function(doc) {
	var ret = new Document();
	if (doc.Name) {
	  ret.add(doc.Name);
	  ret.add(doc.Name, {'field': 'Name'});
  }
	if (doc.Artist) {
	  ret.add(doc.Artist);
	  ret.add(doc.Artist, {'field': 'Artist'});
  }
	if (doc.Album) {
	  ret.add(doc.Album);
	  ret.add(doc.Album, {'field': 'Album'});
  }
  if (doc.Owner) {
	  ret.add(doc.Owner, {'field': 'Owner'});
  }
	return ret;
}