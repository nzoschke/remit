var page = uki({ view: 'SplitPane', rect: '1000 500', anchors: 'left top right bottom', 
    handlePosition: 299, handleWidth: 1,
    leftChildViews: [
        { view: 'Box', rect: '0 0 299 31', anchors: 'left top right', background: 'theme(panel)', style: { zIndex: 101 },
            childViews: [
                { view: 'TextField', rect: '5 5 288 22', anchors: 'left top right', placeholder: 'Search', name: 'search' }
            ]},
        { view: 'ScrollPane', rect: '0 30 299 470', anchors: 'left top bottom right', childViews: [
            { view: 'List', rect: '299 470', anchors: 'left top bottom right', rowHeight: '20', 
                style: { fontSize: '12px'}, textSelectable: false, className: 'tree' }
        ], name: 'treeScroll' },
        { view: 'ScrollPane', rect: '0 30 299 470', anchors: 'left top bottom right', childViews: [
            { view: 'List', rect: '299 470', anchors: 'left top bottom right', rowHeight: '46', 
                textSelectable: false, className: 'list' }
        ], visible: false, name: 'listScroll' },
        { view: 'Label', rect: '10 70 200 20', anchors: 'left top', text: 'Loading...', name: 'loading' }
    ],
    rightChildViews: [
        { view: 'List', rect: '700 500', anchors: 'left top right bottom', id: 'fileList' },
        { view: 'Box', rect: '700 500', anchors: 'left top right bottom', style: { zIndex: 101 }, id: 'dragOverlay', 
            visible: false }
    ]
});

page.attachTo(window, '1000 500');

$.CouchApp(function(app) {
	// http://localhost:5984/media/_design/tree/_view/children?group=true&startkey=[["ROOT"]]&endkey=[["ROOT"],[{}]]
	// {"rows":[
	// {"key":[["ROOT"],["jason"]],"value":15690},
	// {"key":[["ROOT"],["noah"]],"value":10360}
	// ]}
	
	function getChildren(path) {
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