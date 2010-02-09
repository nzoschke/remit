uki([
  { view: 'TextField', id: 'search', rect: '505 5 190 24', anchors: 'left top', value: '', placeholder: 'Search library', },
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

uki('#files').dblclick(function() {
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