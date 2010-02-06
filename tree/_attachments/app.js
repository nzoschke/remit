//var data = ['this is', '30000k long', 'list'];
//for (var i=3; i < 30000; i++) {
//    data[i] = 'item #' + (i+1);
//};

var Node = function(path) {
    this.path = path;
}
Node.prototype = {
  toString: function() { return this.path }
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
        view: 'Label', rect: '200 200',  // label with long text
        anchors: 'top left rigth', // anchored to the top right (grow down)
        multiline: 'true',
        text: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        inset: '3 3', id: 'tree1'
      }]
    }, {
      view: 'ScrollPane', rect: '200 0 200 200', anchors: 'left top bottom', background: '#0F0',
      scrollableH: 'false', scrollableV: 'true',
      childViews: [{
        view: 'List', rect: '0 0 200 900000', anchors: 'top left right', 
        data: [], rowHeight: 30, id: 'list', throttle: 0
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

uki('#list').click(function() {
  alert(uki('#list').selectedIndex());
})
 
uki('#doIt').resizeToContents('width').layout(); // fix button size

/*//uki("#tree1").text = 'foo';

.html(uki('#target').html() + ' Lorem ipsum dolor sit amet, consectetur adipisicing elit ') // add more text
        .resizeToContents('height').parent().resizeToContents('height').layout(); // resize to contents and relayout
*/
$.CouchApp(function(app) {
  return;
	// http://localhost:5984/media/_design/tree/_view/children?group=true&startkey=[["ROOT"]]&endkey=[["ROOT"],[{}]]
	// {"rows":[
	// {"key":[["ROOT"],["jason"]],"value":15690},
	// {"key":[["ROOT"],["noah"]],"value":10360}
	// ]}
	
	function getChildren(path) {
	  return;
		path = path.split('/');
		app.view("children", {
			group:		true, 
			startkey: 	[path],
			endkey: 	[path,[{}]],
			success:	function(json) {
				// add links to current and parent path
				var firstChildPath = json.rows[0].key[0].join('/') + '/' + json.rows[0].key[1].join('/');
				var parentPath = firstChildPath.split('/').slice(0,-2).join('/');
				var currentPath = firstChildPath.split('/').slice(0,-1).join('/');
				$("#path").html(currentPath);
				$("#fileList").html('');
				$("#fileList").append("<li><a class=\"node\" href=\"" + currentPath + "\">.</a></li>");
				$("#fileList").append("<li><a class=\"node\" href=\"" + parentPath + "\">..</a></li>");
				
				// add links for children
				for (var i in json.rows) { // FIXME: for each?!
					var row = json.rows[i];
					var childPath = row.key[0].join('/') + '/' + row.key[1].join('/');
					var row = json.rows[i];
					$("#fileList").append("<li><a class=\"node\" href=\"" + childPath + "\">" + row.key[1].join('/') + "</a></li>");
				}
			}
		});
		
	}
	
	$(".node").live("click", function() {
		getChildren($(this).attr('href')); // get raw (relative) href attr
		return false;
	});
	
	getChildren("ROOT");
});