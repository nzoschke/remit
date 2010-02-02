$.CouchApp(function(app) {
	// http://localhost:5984/media/_design/tree/_view/children?group=true&startkey=[["ROOT"]]&endkey=[["ROOT"],[{}]]
	// {"rows":[
	// {"key":[["ROOT"],["jason"]],"value":15690},
	// {"key":[["ROOT"],["noah"]],"value":10360}
	// ]}
	
	function URLDecode(s) {
		var o=s;
		var binVal,t;
		var r=/(%[^%]{2})/;
		while((m=r.exec(o))!=null && m.length>1 && m[1]!='') {
			b=parseInt(m[1].substr(1),16);
			t=String.fromCharCode(b);o=o.replace(m[1],t);
		}
		return o;
	};
	
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
				$("#path").html(URLDecode(currentPath));
				$("#tree").html('');
				$("#tree").append("<li><a class=\"node\" href=\"" + currentPath + "\">.</a></li>");
				$("#tree").append("<li><a class=\"node\" href=\"" + parentPath + "\">..</a></li>");
				
				// add links for children
				for (var i in json.rows) { // FIXME: for each?!
					var row = json.rows[i];
					var childPath = row.key[0].join('/') + '/' + row.key[1].join('/');
					var row = json.rows[i];
					$("#tree").append("<li><a class=\"node\" href=\"" + childPath + "\">" + URLDecode(row.key[1].join('/')) + "</a></li>");
				}
			}
		});
		
	};
	
	$(".node").live("click", function() {
		getChildren($(this).attr('href')); // get raw (relative) href attr
		return false;
	});
	
	getChildren("ROOT");
});