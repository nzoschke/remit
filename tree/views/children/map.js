function(doc) {
	for(var i = 1; i < doc.LocationPath.length; i++)
		emit([doc.LocationPath.slice(0, i),  doc.LocationPath.slice(i, i+1)], (i+1 == doc.LocationPath.length) ? 0:1)
}