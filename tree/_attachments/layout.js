uki({
  view: 'SplitTable', id: 'files', handlePosition: 100, rect: '500 500', anchors: 'top left', background: '#FFF',
  data: [], rowHeight: 20, id: 'files', throttle: 0,
  columns: [
    { view: 'table.CustomColumn', label: 'Owner', resizable: true, minWidth: 50, width: 50 },
    { view: 'table.CustomColumn', label: 'Artist', resizable: true, minWidth: 50, width: 150 },
    { view: 'table.CustomColumn', label: 'Album', resizable: true, minWidth: 50, width: 150 },
    { view: 'table.CustomColumn', label: 'Name', resizable: true, minWidth: 50, width: 150, },
  ]
}).attachTo( window, '500 500');

uki("#files")[0]._headerLists[0].data([1,2,3,4,5,6,7,8,9]);
uki("#files")[0]._headerLists[1].data([5,6,7,8,91,2,3,4,5,6,7,8,9]);
uki("#files")[0]._headerLists[2].data([45,6,7,8,9,5,6,7,8,9,6,7,8,9,5,6,7,8,9,6,7,8,9,5,6,7,8,9]);
uki("#files")[0]._headerLists[3].data([75,6,7,8,9,8,975,6,7,8,9,8,975,6,7,8,9,8,975,6,7,8,9,8,975,6,7,8,9,8,975,6,7,8,9,8,9]);
uki("#files").data([['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['a', 'a', 'a'],['z', 'z', 'z'],]);