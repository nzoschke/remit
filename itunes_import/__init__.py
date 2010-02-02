import base64
import datetime
from optparse import OptionParser
import os
import re
import sys

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
	parser.add_option("-l", "--library", dest="library", help="import from iTunes XML library",)
	parser.add_option("-u", "--username", dest="username", help="set owner of files to username",)

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

	# parse and calculate subset to save in DB
	library = XMLPlist(library)
	folder = library['Music Folder'].split('/')[:-1] # remove trailing ''
	
	docs = []
	for track_id in library['Tracks']:
		track = library['Tracks'][track_id]
		fields = set(['Name', 'Artist', 'Album', 'Location']) # fields to include, if present
		doc = dict([k, track[k]] for k in fields.intersection(track))
		doc['_id'] = track['Persistent ID']
		doc['Owner'] = options.username
		doc['LocationPath'] = [options.username] + track['Location'].split('/')[len(folder):] # trim off the common folder; append username folder
		docs.append(doc)
	
	# bulk update DB
	print "Parsed %s docs for %s..." % (len(docs), options.username)
	couch = couchdb.Server()
	try:
		couch.create('media')
	except couchdb.client.PreconditionFailed:
		pass
	
	results = couch['media'].update(docs)
	print "Successfully added %s docs" % sum(r[0] for r in results)