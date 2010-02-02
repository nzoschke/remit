import base64, datetime, re, sys
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
	library = XMLPlist('iTunes Library.xml')
	
	# calculate subset to save in DB
	docs = []
	for track_id in library['Tracks']:
		track = library['Tracks'][track_id]
		fields = set(['Name', 'Artist', 'Album', 'Location']) # fields to include, if present
		doc = dict([k, track[k]] for k in fields.intersection(track))
		doc['_id'] = track['Persistent ID']
		doc['owner'] = 'noah'
		docs.append(doc)

	# bulk update DB
	couch = couchdb.Server()
	couch['files'].update(docs)