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
				// add link to parent path
				$("#tree").html('');
				var firstChildPath = json.rows[0].key[0].join('/') + '/' + json.rows[0].key[1].join('/');
				var parentPath = firstChildPath.split('/').slice(0,-2).join('/');
				$("#tree").append("<li><a class=\"node\" href=\"#\">" + parentPath + "</a></li>");
				
				for (var i in json.rows) { // FIXME: for each?!
					var row = json.rows[i];
					var childpath = row.key[0].join('/') + '/' + row.key[1].join('/');
					var row = json.rows[i];
					$("#tree").append("<li><a class=\"node\" href=\"#\">" + row.key[0].join('/') + '/' + row.key[1].join('/') + "</a></li>");
				}
			}
		});
		
	}
	
	$(".node").live("click", function() {
		getChildren(this.text);
	});
	
	getChildren("ROOT");
});