function(doc) {
  if (doc.LocationPath) emit(doc._id, {Name: doc.Name, Artist: doc.Artist, Album: doc.Album});
}