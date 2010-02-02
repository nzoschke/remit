function(doc) {
	var ret = new Document();
	if (doc.Name)   ret.add(doc.Name);
	if (doc.Artist) ret.add(doc.Artist);
	if (doc.Album)  ret.add(doc.Album);
	return ret;
}