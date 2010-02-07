import base64
import datetime
from optparse import OptionParser
import os
import re
import sys
import urllib

from BeautifulSoup import UnicodeDammit
import couchdb

try:
	import cElementTree as ET
except ImportError:
	import elementtree.ElementTree as ET

class XMLPlist(dict):
	"""
	A generic Plist parser, cribbed from http://effbot.org/zone/element-iterparse.htm
	"""
	unmarshallers = {
		# collections
		"array":	lambda x: [v.text for v in x],
		"dict":		lambda x: dict((x[i].text, x[i+1].text) for i in range(0, len(x), 2)),
		"key":		lambda x: x.text or "",

		# simple types
		"string":	lambda x: x.text or "",
		"data":		lambda x: base64.decodestring(x.text or ""),
		"date":		lambda x: datetime.datetime(*map(int, re.findall("\d+", x.text))),
		"true":		lambda x: True,
		"false":	lambda x: False,
		"real":		lambda x: float(x.text),
		"integer":	lambda x: int(x.text),
	}

	def __init__(self, filename):
		parser = ET.iterparse(filename)
		for action, elem in parser:
			unmarshal = self.unmarshallers.get(elem.tag)
			if unmarshal:
				data = unmarshal(elem)
				elem.clear()
				elem.text = data
			elif elem.tag != "plist":
				raise IOError("unknown plist type: %r" % elem.tag)
		self.plist = parser.root[0].text
		
	def __getitem__(self, key):
		return self.plist[key]

if __name__ == '__main__':
	parser = OptionParser(usage = "usage: python -m itunes_import [options]")
	parser.add_option("-d", "--database", help="CouchDB database name to create/update",)
	parser.add_option("-l", "--library", help="import from iTunes XML library",)
	parser.add_option("-u", "--username", help="set owner of files to username",)
	parser.add_option("--limit", type="int", help="limit how many docs to add",)

	(options, args) = parser.parse_args()
	if not options.library or not options.username:
		parser.print_help()
		sys.exit(1)
		
	# resolve path to library
	library = os.path.normpath(os.path.expanduser(options.library))
	if not os.path.exists(library):
		library = os.path.join(os.getcwd(), library)

	try:
		open(library)
	except IOError:
		sys.exit("Error: Can't open %s" % options.library)

	# get handle to couchdb
	couch = couchdb.Server()
	try:
		couch.create(options.database)
	except couchdb.client.PreconditionFailed:
		pass
	db = couch[options.database]

	# parse and calculate subset to save in DB
	library = XMLPlist(library)
	folder = library['Music Folder'].split('/')[:-1] # remove trailing ''
	
	docs = []
	for track_id in library['Tracks']:
		track = library['Tracks'][track_id]
		if track.has_key('Location'):
			track['Location'] = urllib.unquote(UnicodeDammit(track['Location']).unicode) # unicode :(
		fields = set(['Name', 'Artist', 'Album', 'Location']) # fields to include, if present
		doc = dict([k, track[k]] for k in fields.intersection(track))
		doc['_id'] = track['Persistent ID']
		doc['Owner'] = options.username
		doc['LocationPath'] = ['ROOT', options.username] + track['Location'].split('/')[len(folder):] # trim off the common folder; append username folder
		docs.append(doc)
	
	print "Parsed %s docs for %s..." % (len(docs), options.username)
	if options.limit:
		docs = docs[0:options.limit]
	
	# bulk get all revision_ids for existing docs
	headers, data = db.resource.post('_all_docs', {"keys": [doc['_id'] for doc in docs]})
	id_rev_map = {}
	for row in data['rows']:
		if not row.has_key('value'): continue
		id_rev_map[row['key']] = row['value']['rev']

	for doc in docs:
		if doc['_id'] in id_rev_map:
			doc['_rev'] = id_rev_map[doc['_id']]

	# bulk update DB
	results = db.update(docs)
	num_added = sum(r[0] for r in results)
	print "Successfully added/updated %s, failed %s docs" % (num_added, len(docs)-num_added)