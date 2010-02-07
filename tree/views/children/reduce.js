function(keys, values, rereduce) {
  var s = 0;
  for (var i = 0; i < values.length; i++) {
    if (values[i] > 0) s += values[i];  // sum numeric values
    else return values[i];              // return non-numeric values immediately
  }
  return s;
}