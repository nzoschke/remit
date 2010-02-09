uki([
  { view: 'TextField', id: 'search', rect: '505 5 190 24', anchors: 'left top', value: '', placeholder: 'Search library', },
  { view: 'Button', id: 'go', rect: '700 5 40 24', anchors: 'left top', text: 'Go', },
  { view: 'SplitTable', id: 'files', handlePosition: 100, rect: '500 500', anchors: 'top left', background: '#FFF',
    data: [], rowHeight: 20, id: 'files', throttle: 0,
    columns: [
      { view: 'table.CustomColumn', label: 'Owner', resizable: true, minWidth: 50, width: 50 },
      { view: 'table.CustomColumn', label: 'Artist', resizable: true, minWidth: 50, width: 150 },
      { view: 'table.CustomColumn', label: 'Album', resizable: true, minWidth: 50, width: 150 },
      { view: 'table.CustomColumn', label: 'Name', resizable: true, minWidth: 50, width: 150, },
    ]
  }
]).attachTo( window, '500 500');

var DBNAME = 'media';
var DOCS = {}; // local document cache

var owners = [];
$.couch.db(DBNAME).view('tree/by_owner', {
  group: true,
  error: function(result) { alert('error getting owners!'); },
  success: function(result) {
    for (var i in result.rows) {
      var row = result.rows[i];
      if($.inArray(row.key, owners) == -1) owners.push(row.key);
    }
    uki("#filesList0").data(owners);
  }
});

var VO = function(value) { this._value = value; }
VO.prototype = {
  toString: function() {
    return this._value;
  }
}


uki("#filesList0").dblclick(function() {
  // http://localhost:5984/media-small/_design/meta/_view/by_metadata_path?group=true&startkey=[["jason"]]&endkey=[["jason"],[{}]]
  // {"rows":[{"key":[["jason"],["Air"]],"value":2}, ... }
  owner = this.data()[this.selectedIndex()];
  $.couch.db(DBNAME).view('tree/by_metadata_path', {
    group: true,
    startkey: [[owner]],
    endkey: [[owner],[{}]],
    error: function(result) { alert('error getting artists!'); },
    success: function(result) {
      var artists = [];
      for (var i in result.rows) {
        var row = result.rows[i];
        var artist = row.key[1][0];
        if ($.inArray(artist, artists) == -1) artists.push(artist);
      }
      uki("#filesList1").data(artists);
      uki("#filesList2").data([]);
      uki("#filesList3").data([]);
    }
  });  
});

uki("#filesList1").dblclick(function() {
  owner = uki("#filesList0").data()[uki("#filesList0").selectedIndex()];
  artist = this.data()[this.selectedIndex()];
  $.couch.db(DBNAME).view('tree/by_metadata_path', {
    group: true,
    startkey: [[owner,artist]],
    endkey: [[owner,artist],[{}]],
    error: function(result) { alert('error getting albums!'); },
    success: function(result) {
      var albums = [];
      for (var i in result.rows) {
        var row = result.rows[i];
        var album = row.key[1][0];
        if ($.inArray(album, albums) == -1) albums.push(album);
      }
      uki("#filesList2").data(albums);
      uki("#filesList3").data([]);
    }
  });  
});

uki("#filesList2").dblclick(function() {
  owner = uki("#filesList0").data()[uki("#filesList0").selectedIndex()];
  artist = uki("#filesList1").data()[uki("#filesList1").selectedIndex()];
  album = this.data()[this.selectedIndex()];
  $.couch.db(DBNAME).view('tree/by_metadata_path', {
    reduce: false,
    startkey: [[owner,artist,album]],
    endkey: [[owner,artist,album],[{}]],
    error: function(result) { alert('error getting names!'); },
    success: function(result) {
      var names = [];
      for (var i in result.rows) {
        var row = result.rows[i];
        var name = new VO(row.key[1][0]);
        name['_id'] = row.id;
        if ($.inArray(name, names) == -1) names.push(name);
      }
      uki("#filesList3").data(names);
    }
  });  
});

uki("#filesList3").dblclick(function() {
  var _id = this.data()[this.selectedIndex()]['_id'];
  $.couch.db(DBNAME).view('tree/by_network_location', {
    keys: [_id],
    success: function(result) {
      var audio = $("#audio")[0]
      console.log(result.rows[0].value);
      audio.setAttribute('src', result.rows[0].value);
    	audio.load();
    	audio.play();
    }
  });
});

uki('#search').change(function() {
  // http://localhost:5984/media/_fti/search/by_metadata?q=Artist:Radiohead
  $.couch.db(DBNAME).fti('by_metadata', this.value(), {
    limit: 2000,
    error: function(resp) { alert('error!'); },
    success: function(json) {
      // get all keys from FTI response
      var keys = [];
      for (var i in json.rows) keys.push(json.rows[i].id);
      $.couch.db(DBNAME).view('tree/all', {
        keys: keys,
        success: function(json) {
          var data = [], owners = [], artists = [], albums = [], names = [];
          for (var i in json.rows) {
            var row = json.rows[i];
            DOCS[json.key] = row;
            data[i] = [row.value['Owner'], row.value['Artist'], row.value['Album'], row.value['Name'], row.key];
            if($.inArray(row.value['Owner'], owners) == -1) owners.push(row.value['Owner']);
            if($.inArray(row.value['Artist'], artists) == -1) artists.push(row.value['Artist']);
            if($.inArray(row.value['Album'], albums) == -1) albums.push(row.value['Album']);
            if($.inArray(row.value['Name'], names) == -1) names.push(row.value['Name']);
          }
          uki("#files").data(data);
          uki("#files")[0]._headerLists[0].data(owners);
          uki("#files")[0]._headerLists[1].data(artists);
          uki("#files")[0]._headerLists[2].data(albums);
          uki("#files")[0]._headerLists[3].data(names);
        }
      });
    }
  });
});

uki('#filesTable').dblclick(function() {
  var key = this.data()[this.selectedIndex()][4];
  $.couch.db(DBNAME).view('tree/by_network_location', {
    keys: [key],
    success: function(json) {
      var audio = $("#audio")[0]
      console.log(json.rows[0].value);
      audio.setAttribute('src', json.rows[0].value);
    	audio.load();
    	audio.play();
    }
  });
});