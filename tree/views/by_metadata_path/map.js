function(doc) {
  emit([[doc.Owner],[doc.Artist]],1);
  emit([[doc.Owner,doc.Artist],[doc.Album]],1);
  emit([[doc.Owner,doc.Artist,doc.Album],[doc.Name]],1);
}