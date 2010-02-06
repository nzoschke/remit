var Node = function() {}
Node.prototype = {
  toString: function() { 
    return '<div class="node ' + (this.numChildren > 0 ? 'folder' : 'file') + '">' + this.label + '</div>';
  }
}

uki({
  view: 'SplitPane',
  rect: '1000 600', anchors: 'left top right bottom',
  handlePosition: 200, leftMin: 200, rightMin: 300,
  leftChildViews: [{
    view: 'TextField', rect: '5 5 190 24', anchors: 'left top right', value: '', placeholder: 'Search library',
  }],
  rightChildViews: [{
    view: 'VerticalSplitPane',
    rect: '793 600', anchors: 'left top right bottom', vertical: true,
    handlePosition: 200, topMin: 150,
    topChildViews: [{
      view: 'ScrollPane', rect: '793 200', anchors: 'left right top bottom', background: '#F00',
      scrollableH: 'true', scrollableV: 'false',
      childViews: [{
          view: 'ScrollPane', rect: '200 200', anchors: 'left top bottom', background: '#F00',
          scrollableH: 'false', scrollableV: 'true',
          childViews: [{
            view: 'List', rect: '0 0 200 210', anchors: 'top left right', 
            data: [], rowHeight: 30, id: 'list1', throttle: 0
          }]
        }, {
          view: 'ScrollPane', rect: '200 0 200 200', anchors: 'left top bottom', background: '#0F0',
          scrollableH: 'false', scrollableV: 'true',
          childViews: [{
            view: 'List', rect: '0 0 200 210', anchors: 'top left right', 
            data: [], rowHeight: 30, id: 'list2', throttle: 0
          }]
        }, {
          view: 'ScrollPane', rect: '400 0 200 200', anchors: 'left top bottom', background: '#0F0',
          scrollableH: 'false', scrollableV: 'true',
          childViews: [{
            view: 'List', rect: '0 0 200 210', anchors: 'top left right', 
            data: [], rowHeight: 30, id: 'list3', throttle: 0
          }]
        }, {
          view: 'ScrollPane', rect: '600 0 200 200', anchors: 'left top bottom', background: '#0F0',
          scrollableH: 'false', scrollableV: 'true',
          childViews: [{
            view: 'List', rect: '0 0 200 210', anchors: 'top left right', 
            data: [], rowHeight: 30, id: 'list4', throttle: 0
          }]
        }],
    }],
    bottomChildViews: []
  }]
}).attachTo( window, '1000 600' );

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
			  var data = [];
				for (var i in json.rows) { // FIXME: for each?!
				  var row = json.rows[i];
				  var node = new Node();
				  node.label = row.key[1][0];
				  node.key = row.key[0];
				  node.key.push(node.label);
				  node.numChildren = row.value;
				  data[i] = node;
				}
				uki(listID).data(data);
			}
		});
  });  
}
getChildren(["ROOT"], "#list1");
