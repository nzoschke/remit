function(doc) {
  if (doc.LocationPath) emit(doc._id, doc.LocationPath);
}