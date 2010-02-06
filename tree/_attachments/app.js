//var data = ['this is', '30000k long', 'list'];
//for (var i=3; i < 30000; i++) {
//    data[i] = 'item #' + (i+1);
//};

var Node = function() {
}
Node.prototype = {
  toString: function() { return this.label + (this.numChildren > 0 ? ' > ' : ''); }
}
var data = [new Node('abc'), {a: 'a', toString: function() { return 'ass'}}];

uki({
  view: 'SplitPane',
  rect: '1000 600', anchors: 'left top right bottom',
  handlePosition: 200, leftMin: 200, rightMin: 300,
  leftChildViews: [{view: 'Button', rect: '10 10 100 24', anchors: 'left top', text: 'resize', id: 'doIt' }],
  rightChildViews: [{
    view: 'VerticalSplitPane',
    rect: '793 600', anchors: 'left top right bottom', vertical: true,
    handlePosition: 200, topMin: 150,
    topChildViews: [{
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
    }],
    bottomChildViews: []
  }]
}).attachTo( window, '1000 600' );

uki('#doIt').click(function () {
    uki('#tree1') 
        .html(uki('#tree1').html() + ' Lorem ipsum dolor sit amet, consectetur adipisicing elit ') // add more text
        .resizeToContents('height').parent().layout(); // resize to contents and relayout
        
});

uki('#list1').click(function() {
  var selectedNode = this.data()[this.selectedIndex()];
  getChildren(selectedNode.key, '#list2');
})
 
uki('#doIt').resizeToContents('width').layout(); // fix button size

/*//uki("#tree1").text = 'foo';

.html(uki('#target').html() + ' Lorem ipsum dolor sit amet, consectetur adipisicing elit ') // add more text
        .resizeToContents('height').parent().resizeToContents('height').layout(); // resize to contents and relayout
*/
function getChildren(path, listID) {
  $.CouchApp(function(app) {
  	// http://localhost:5984/media/_design/tree/_view/children?group=true&startkey=[["ROOT"]]&endkey=[["ROOT"],[{}]]
  	// {"rows":[
  	// {"key":[["ROOT"],["jason"]],"value":15690},
  	// {"key":[["ROOT"],["noah"]],"value":10360}
  	// ]}

		app.view("children", {
			group:		true, 
			startkey: 	[path],
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
