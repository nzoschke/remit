function(doc) {
  if (doc.Location) {
    var l = doc.Location;
    l = l.replace("file://localhost/Network/NAS/", "http://hero2000.dyndns.org/");
    emit(doc._id, l);
  }
}