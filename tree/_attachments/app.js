uki({
  view: 'SplitPane',
  rect: '1000 600', anchors: 'left top right bottom',
  handlePosition: 200, leftMin: 200, rightMin: 300,
  leftChildViews: [],
  rightChildViews: [{
    view: 'VerticalSplitPane',
    rect: '793 600', anchors: 'left top right bottom', vertical: true,
    handlePosition: 200, topMin: 150,
    topChildViews: [],
    bottomChildViews: []
  }]
}).attachTo( window, '1000 600' );


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