var DBNAME = 'media';

var Node = function() {}
Node.prototype = {
  toString: function() { 
    return this.label;
    return '<div class="node ' + (this.numChildren > 0 ? 'folder' : 'file') + '">' + this.label + '</div>';
  }
}

var TrackRow = function() {}

uki({
  view: 'Container',
  rect: '1000 600', anchors: 'left right top bottom',
  childViews: [{
    view: 'SplitPane',
    rect: '1000 585', anchors: 'left top right bottom',
    handlePosition: 200, leftMin: 200, rightMin: 700,
    leftChildViews: [{
      view: 'TextField', id: 'search', rect: '5 5 190 24', anchors: 'left top right', value: '', placeholder: 'Search library',
    }],
    rightChildViews: [{
      view: 'VerticalSplitPane',
      rect: '793 585', anchors: 'left top right bottom', vertical: true,
      handlePosition: 250, topMin: 150,
      topChildViews: [{
        view: 'ScrollPane', rect: '400 250', anchors: 'left right top bottom', background: '#F00',
        scrollableH: 'true', scrollableV: 'false',
        childViews: [{
          view: 'ScrollPane', rect: '150 235', anchors: 'left top bottom', background: '#F00',
          scrollableH: 'false', scrollableV: 'true',
          childViews: [{
            view: 'List', rect: '0 0 150 410', anchors: 'top left right', 
            data: [], rowHeight: 30, id: 'list1', throttle: 0, focusable: false,
          }]
        }, {
          view: 'ScrollPane', rect: '150 0 150 235', anchors: 'left top bottom', background: '#F00',
          scrollableH: 'false', scrollableV: 'true',
          childViews: [{
            view: 'List', rect: '0 0 150 410', anchors: 'top left right', 
            data: [], rowHeight: 30, id: 'list2', throttle: 0, focusable: false,
          }]
        }, {
          view: 'ScrollPane', rect: '300 0 150 235', anchors: 'left top bottom', background: '#F00',
          scrollableH: 'false', scrollableV: 'true',
          childViews: [{
            view: 'List', rect: '0 0 150 410', anchors: 'top left right', 
            data: [], rowHeight: 30, id: 'list3', throttle: 0, focusable: false,
          }]
        }]
      }, {
        view: 'Table', rect: '400 0 393 250', anchors: 'top bottom right', 
        data: [], rowHeight: 30, id: 'files', throttle: 0,
        columns: [
          { view: 'table.NumberColumn', label: 'ID', width: 40 },
          { view: 'table.CustomColumn', label: 'Name', resizable: true, minWidth: 100, width: 152 },
          { view: 'table.CustomColumn', label: 'Artist', resizable: true, minWidth: 100, width: 100 },
          { view: 'table.CustomColumn', label: 'Album', resizable: true, minWidth: 100, width: 100, },
        ]
      }],
      bottomChildViews: [{
        view: 'ScrollPane', rect: '793 343', anchors: 'left right top bottom', background: '#D0D7E2',
        scrollableH: 'true', scrollableV: 'true',
        childViews: [{
          view: 'Table', rect: '793 343', anchors: 'top bottom left right', 
          data: [], rowHeight: 30, id: 'playlist', throttle: 0,
          columns: [
            { view: 'table.NumberColumn', label: 'ID', width: 40 },
            { view: 'table.CustomColumn', label: 'Name', resizable: true, minWidth: 100, width: 250 },
            { view: 'table.CustomColumn', label: 'Artist', resizable: true, minWidth: 100, width: 150 },
            { view: 'table.CustomColumn', label: 'Album', resizable: true, minWidth: 100, width: 150, },
          ]
        }]
      }]
    }]
  },{
    view: 'Box', rect: '0 585 1000 15', anchors: 'left right bottom', background: '#00F'
  }]
}).attachTo( window, '1000 600');

uki('#list1').click(function() {
  var selectedNode = this.data()[this.selectedIndex()];
  getChildren(selectedNode.key, '#list2');
});

uki('#list2').click(function() {
  var selectedNode = this.data()[this.selectedIndex()];
  getChildren(selectedNode.key, '#list3');
});

uki('#list3').click(function() {
  var selectedNode = this.data()[this.selectedIndex()];
  getChildren(selectedNode.key, '#list4');
});

uki('#files').dblclick(function() {
  var trackData = uki("#playlist").data();
  trackData.push(this.data()[this.selectedIndex()]);
  uki("#playlist").data(trackData);
});

uki('#playlist').dblclick(function() {
  var key = this.data()[this.selectedIndex()][0];
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

uki('#search').change(function() {
  // http://localhost:5984/media/_fti/search/by_metadata?q=Artist:Radiohead
  $.couch.db(DBNAME).fti('by_metadata', this.value(), {
    limit: 2000,
    error: function(resp) { alert('error!'); },
    success: function(json) {
      // get all keys from FTI response
      keys = [];
      for (var i in json.rows) keys.push(json.rows[i].id);
      $.couch.db(DBNAME).view('tree/by_metadata', {
        keys: keys,
        success: function(json) {
          var data = [];
          for (var i in json.rows) {
            var row = json.rows[i];
            data[i] = [row.key, row.value['Name'], row.value['Artist'], row.value['Album']];
          }
          uki("#files").data(data);
        }
      });
      
      $.couch.db(DBNAME).view('tree/by_path', {
        keys: keys,
        success: function(json) {
          var list1 = [];
          var list2 = [];
          var list3 = [];
          for (var i in json.rows) {
            var row = json.rows[i];
            if($.inArray(row.value[1], list1) == -1) list1.push(row.value[1]);
            if($.inArray(row.value[2], list2) == -1) list2.push(row.value[2]);
            if($.inArray(row.value[3], list3) == -1) list3.push(row.value[3]);
          }
          uki("#list1").data(list1);
          uki("#list2").data(list2);
          uki("#list3").data(list3);
        }
      });
    }
  });
});

function getFiles(keys) {
  $.couch.db(DBNAME).view('tree/by_metadata', {
    keys: keys,
    success: function(json) {
      var data = [];
      for (var i in json.rows) {
        var row = json.rows[i];
        data[i] = [row.key, row.value['Name'], row.value['Artist'], row.value['Album']];
      }
      uki("#files").data(data);
    }
  });
};

function getChildren(path, listID) {
  // TODO: set up view -- progress indicator; clear descendent lists
  
  $.CouchApp(function(app) {
  	// http://localhost:5984/media/_design/tree/_view/children?group=true&startkey=[["ROOT"]]&endkey=[["ROOT"],[{}]]
  	// {"rows":[{"key":[["ROOT"],["jason"]],"value":15690},{"key":[["ROOT"],["noah"]],"value":10360}]}
		app.view("children", {
			group:		true, 
			startkey: [path],
			endkey: 	[path,[{}]],
			success:	function(json) {
			  var fileKeys = [];
			  var folderData = [];
				for (var i in json.rows) {
				  var row = json.rows[i];
				  if (row.value > 0) { // numeric => number of children => branch
            var node = new Node();
            node.label = row.key[1][0];
            node.key = row.key[0];
            node.key.push(node.label);
            node.numChildren = row.value;
            folderData[i] = node;
				  }
				  else { // non-numeric => _id => leaf
				    fileKeys.push(row.value);
				  }
				}
				console.log(fileKeys);
				uki(listID).data(folderData);
				if (fileKeys.length) getFiles(fileKeys);
			}
		});
  });  
}
getChildren(["ROOT"], "#list1");
