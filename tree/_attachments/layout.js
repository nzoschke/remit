uki({
  view: 'TableBrowser', rect: '500 500', anchors: 'top bottom left right', 
  data: [], rowHeight: 20, id: 'files', throttle: 0,
  columns: [
    { view: 'table.CustomColumn', label: 'Artist', resizable: true, minWidth: 150, width: 150 },
    { view: 'table.CustomColumn', label: 'Album', resizable: true, minWidth: 150, width: 150 },
    { view: 'table.CustomColumn', label: 'Name', resizable: true, minWidth: 150, width: 200, },
  ],
  browsers: [
    { view: 'ScrollableList', id: 'list1', anchors: 'top bottom left right', rect: '0 17 150 134', data: [0,1,2,3,4,5,6,7,8,9,10,11,12,13], rowHeight: 20 },
    { view: 'ScrollableList', id: 'list2', anchors: 'top bottom left', rect: '150 17 150 134', data: [,6,7,8,9,10,11,12,13,1,2,3,4,5,6,7,8,9,10,11,12,13,1,2,3,4,5,6,7,8,9,10,11,12,13,], rowHeight: 20 },
    { view: 'ScrollableList', id: 'list3', anchors: 'top bottom left', rect: '300 17 200 134', data: [11,12,13,1,2,3,4,5,6,7,8,9,10,11,12,13,1,2,3,4,5,6,7,8,9,10,11,12,13,], rowHeight: 20 },
  ]  
}).attachTo( window, '500 500');

uki("#files").columns()[0].bind('resize', function(){
  uki("#list1").rect().width = this.width();
  uki("#list1").layout();
});

uki("#files").columns()[1].bind('resize', function(){
  uki("#list2").rect().width = this.width();
  uki("#list2").layout();
});

uki("#files").columns()[2].bind('resize', function(){
  uki("#list3").rect().width = this.width();
  uki("#list3").layout();
});

/*uki({
  view: 'VerticalSplitPane', rect: '500 600', anchors: 'left top bottom', id: 'filesContainer',
  handlePosition: 200, topMin: 100, bottomMin: 400,
  topChildViews: [{
    view: 'ScrollableList', id: 'list1', anchors: 'top bottom',
    rect: '200 200',
    data: [], rowHeight: 20
  }],
  bottomChildViews: [{
    view: 'TableBrowser', rect: '500 393', anchors: 'top bottom left right', 
    data: [], rowHeight: 20, id: 'files', throttle: 0, background: "#F00",
    columns: [
      { view: 'table.CustomColumn', label: 'Artist', resizable: true, minWidth: 150, width: 200, resize: function() {console.log('r');} },
      { view: 'table.CustomColumn', label: 'Album', resizable: true, minWidth: 150, width: 150 },
      { view: 'table.CustomColumn', label: 'Name', resizable: true, minWidth: 150, width: 150, },
    ]
  }],
}).attachTo( window, '1000 600');

// table column resizers resize container and linked lists
uki("#files").columns()[0].bind('resize', function(){
  uki("#list1").rect().width = this.width();
  uki("#list1").layout();
  
  //uki("#filesContainer").rect().width = uki("#files")[0]._list.minSize().width;
  //uki("#filesContainer").layout();
});*/

/*function shrinkTable(uki_selector) {
  uki(uki_selector).rect().width = uki(uki_selector)[0]._list.minSize().width;
  uki(uki_selector).layout();
}*/

uki("#files").data([['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['z', 'z', 'z'],]);