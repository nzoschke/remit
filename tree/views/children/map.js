function(doc) {
  for(var i = 1; i < doc.LocationPath.length; i++) {
    var head = doc.LocationPath.slice(0, i);
    var tail = doc.LocationPath.slice(i, i+1);
    value = (i == doc.LocationPath.length - 1) ? doc._id : 1;
    emit([head, tail], value);
  }
}