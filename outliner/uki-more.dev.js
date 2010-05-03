uki.more = {};uki.more.view = {};// really basic tree list implementation
uki.more.view.treeList = {};

uki.view.declare('uki.more.view.TreeList', uki.view.List, function(Base) {
    this._setup = function() {
        Base._setup.call(this);
        this._render = new uki.more.view.treeList.Render();
    };
    
    this.listData = Base.data;

    this.data = uki.newProp('_data', function(v) {
        this._data = v;
        var children = this.listData(), opened = false;
        for (var i=children.length - 1; i >= 0 ; i--) {
            if (this._data[i].__opened) {
                opened = true;
                this._openSubElement(i);
            }
        };
        this.listData(this._data);
        if (opened) this.trigger('open');
    });

    this._treeNodeToListData = function(node, indent) {
        indent = indent || 0;
        return uki.map(node, function(row) {
            row.__indent = indent;
            return row;
        });
    };

    this.toggle = function(index) {
        this._data[index].__opened ? this.close(index) : this.open(index);
    };
    
    function offsetFrom (array, from, offset) {
        for (var i = from; i < array.length; i++) {
            array[i] += offset;
        };
    }
    
    function recursiveLength (item) {
        var children = uki.attr(item, 'children'),
        length = children.length;

        for (var i=0; i < children.length; i++) {
            if (children[i].__opened) length += recursiveLength(children[i]);
        };
        return length;
    }    
    
    this._openSubElement = function(index) {
        var item = this._data[index],
            children = uki.attr(item, 'children');

        if (!children || !children.length) return 0;
        var length = children.length;
        
        item.__opened = true;
        this._data.splice.apply(this._data, [index+1, 0].concat( this._treeNodeToListData(children, item.__indent + 1) ));
        
        for (var i=children.length - 1; i >= 0 ; i--) {
            if (this._data[index+1+i].__opened) {
                length += this._openSubElement(index+1+i);
            }
        };
        return length;
    };

    this.open = function(index) {
        if (this._data[index].__opened) return this;
        
        var length = this._openSubElement(index),
            positionInSelection = uki.binarySearch(index, this._selectedIndexes),
            clickIndex = this._lastClickIndex,
            indexes = this._selectedIndexes;
            
        this.clearSelection(true);
        offsetFrom(
            indexes, 
            positionInSelection + (indexes[positionInSelection] == index ? 1 : 0), 
            length
        );
            
        this.listData(this._data);
        this.selectedIndexes(indexes);
        this._lastClickIndex = clickIndex > index ? clickIndex + length : clickIndex;
        this.trigger('open');
        return this;
    };
    
    this.close = function(index) {
        var item = this._data[index],
            indexes = this._selectedIndexes,
            children = uki.attr(item, 'children');
        if (!children || !children.length || !item.__opened) return;
            
        var length = recursiveLength(item);
        
        item.__opened = false;
        this._data.splice(index+1, length);
        
        var positionInSelection = uki.binarySearch(index, indexes),
            removeFrom = positionInSelection + (indexes[positionInSelection] == index ? 1 : 0),
            toRemove = 0,
            clickIndex = this._lastClickIndex;
        while (indexes[removeFrom + toRemove] && indexes[removeFrom + toRemove] <= index + length) toRemove++;
        
        this.clearSelection(true);
        offsetFrom(indexes, removeFrom, -length);
        if (toRemove > 0) {
            indexes.splice(positionInSelection, toRemove);
        }

        this.listData(this._data);
        this.selectedIndexes(indexes);
        this._lastClickIndex = clickIndex > index ? clickIndex - length : clickIndex;
        this.trigger('close');
    };
    
    this._mousedown = function(e) {
        if (e.target.className.indexOf('toggle-tree') > -1) {
            var o = uki.dom.offset(this._dom),
                y = e.pageY - o.y,
                p = y / this._rowHeight << 0;
            this.toggle(p);
        } else {
            Base._mousedown.call(this, e);
        }
    };

    this._keypress = function(e) {
        Base._keypress.call(this, e);
        e = e.domEvent;
        if (e.which == 39 || e.keyCode == 39) { // RIGHT
            this.open(this._lastClickIndex);
        } else if (e.which == 37 || e.keyCode == 37) { // LEFT
            this.close(this._lastClickIndex);
        } else if (e.which == 13 || e.keyCode == 13) { // ENTER
          var item = this._data[this.selectedIndexes()[0]],
            children = uki.attr(item, 'children'),
            newItem = {};

          if (!children || !children.length) // no children => add new sibling
            newItem = { _id: '7B0568A4', cells: ['empty'], __indent: item.__indent, parent: item.parent, checked: false, editing: true };
          else // children => prepend new child
            newItem = { _id: '7B0568A4', cells: ['empty'], __indent: item.__indent + 1, parent: item, checked: false, editing: true };

          this._data.splice.apply(this._data, [this.selectedIndexes()[0]+1, 0].concat( [newItem] ));
          newItem.parent.children.unshift(newItem);
          this.listData(this._data);
        }
    };

});

// tree list render
uki.more.view.treeList.Render = uki.newClass(uki.view.list.Render, new function() {
    this._parentTemplate = new uki.theme.Template(
        '<div class="${classPrefix}-row ${classPrefix}-${opened}" style="margin-left:${indent}px">' + 
            '<div class="${classPrefix}-toggle"><i class="toggle-tree"></i></div>${text}' +
        '</div>'
    );

    this._leafTemplate = new uki.theme.Template(
        '<div class="${classPrefix}-row" style="margin-left:${indent}px">${text}</div>'
    );
    
    this.initStyles = function() {
        this.classPrefix = 'treeList-' + uki.guid++;
        var style = new uki.theme.Template(
            '.${classPrefix}-row { color: #333; position:relative; padding-top:3px; } ' +
            '.${classPrefix}-toggle { overflow: hidden; position:absolute; left:-15px; top:5px; width: 10px; height:9px; } ' +
            '.${classPrefix}-toggle i { display: block; position:absolute; left: 0; top: 0; width:20px; height:18px; background: url(${imageSrc});} ' +
            '.${classPrefix}-selected { background: #3875D7; } ' +
            '.${classPrefix}-selected .${classPrefix}-row { color: #FFF; } ' +
            '.${classPrefix}-selected i { left: -10px; } ' +
            '.${classPrefix}-selected-blured { background: #CCCCCC; } ' +
            '.${classPrefix}-opened i { top: -9px; }'
        ).render({ 
            classPrefix: this.classPrefix, 
            imageSrc: 'i/arrows.png'  // should call uki.image here
        });
        uki.dom.createStylesheet(style);
    };

    this.render = function(row, rect, i) {
        this.classPrefix || this.initStyles();
        var text = row.cells[0],
            children = uki.attr(row, 'children');
        if (children && children.length) {
            return this._parentTemplate.render({ 
                text: text, 
                indent: row.__indent*18 + 22,
                classPrefix: this.classPrefix,
                opened: row.__opened ? 'opened' : ''
            });
        } else {
            return this._leafTemplate.render({ 
                text: text, 
                indent: row.__indent*18 + 22,
                classPrefix: this.classPrefix
            });
        }
    };
    
    this.setSelected = function(container, data, state, focus) {
        container.className = !state ? '' : focus ? this.classPrefix + '-selected' : this.classPrefix + '-selected-blured';
    };
});
uki.view.declare('uki.more.view.ToggleButton', uki.view.Button, function(Base) {
    
    this._setup = function() {
        Base._setup.call(this);
        this._focusable = false;
    };
    
    this.value = this.checked = uki.newProp('_checked', function(state) {
        this._checked = !!state;
        this._updateBg();
    });
    
    this._updateBg = function() {
        var name = this._disabled ? 'disabled' : this._down || this._checked ? 'down' : this._over ? 'hover' : 'normal';
        this._backgroundByName(name);
    };
    
    this._mouseup = function(e) {
        if (!this._down) return;
        this._down = false;
        if (!this._disabled) this.checked(!this.checked())
    };
    
});uki.view.declare('uki.more.view.RadioButton', uki.more.view.ToggleButton, function(base) {
    var manager = uki.view.Radio;
    
    this.group = uki.newProp('_group', function(g) {
        manager.unregisterGroup(this);
        this._group = g;
        manager.registerGroup(this);
        manager.clearGroup(this);
    });
    
    this.value = this.checked = uki.newProp('_checked', function(state) {
        this._checked = !!state;
        if (state) manager.clearGroup(this);
        this._updateBg();
    });
    
    this._mouseup = function() {
        if (!this._down) return;
        this._down = false;
        if (!this._checked && !this._disabled) {
            this.checked(!this._checked);
            this.trigger('change', {checked: this._checked, source: this});
        }
    }
});uki.more.view.splitTable = {};

uki.view.declare('uki.more.view.SplitTable', uki.view.Container, function(Base) {
    var Rect = uki.geometry.Rect,
        Size = uki.geometry.Size;
        
    var propertiesToDelegate = 'rowHeight data packSize visibleRectExt render selectedIndex focusable textSelectable multiselect'.split(' ');
    
    
    this._defaultHandlePosition = 200;
    this._headerHeight = 17;
    
    this._style = function(name, value) {
        this._leftHeader.style(name, value);
        this._rightHeader.style(name, value);
        return Base._style.call(this, name, value);
    };
    
    this.columns = uki.newProp('_columns', function(c) {
        this._columns = uki.build(c);
        this._totalWidth = 0;
        this._leftHeader.columns([this._columns[0]]);
        
        this._columns[0].bind('beforeResize', uki.proxy(this._syncHandlePosition, this, this._columns[0]));
        
        for (var i = 1; i < this._columns.length; i++) {
            this._columns[i].position(i - 1);
            this._columns[i].bind('beforeResize', uki.proxy(this._rightColumnResized, this, this._columns[i]));
        };
        this._updateTotalWidth();
        this._rightHeader.columns(Array.prototype.slice.call(this._columns, 1));
        this._splitPane.leftMin(this._columns[0].minWidth() - 1)
        // this._splitPane.handlePosition(this._columns[0].width());
        this._syncHandlePosition(this._splitPane);
    });
    
    uki.each(propertiesToDelegate, function(i, name) { 
        this[name] = function(v) {
            if (v === undefined) return this._leftList[name]();
            this._leftList[name](v);
            this._rightList[name](v);
            return this;
        };
    }, this);
    
    this.hasFocus = function() {
        return this._leftList.hasFocus() || this._rightList.hasFocus();
    };
    
    this.rightColumns = function() {
        return this._rightHeader.columns();
    };
    
    this._rightColumnResized = function(column) {
        this._updateTotalWidth();
        this._horizontalScroll.layout();
    };
    
    this.rowHeight = function(value) {
        if (value === undefined) return this._leftList.rowHeight();
        this._leftList.rowHeight(value);
        this._rightList.rowHeight(value);
        return this;
    };
    
    this.data = function(d) {
        if (d === undefined) return uki.map(this._leftList.data(), function(value, i) {
            return [value].concat(this._rightList.data()[i]);
        }, this);
        
        this._leftList.data(uki.map(d, function(value) {
            return [value[0]];
        }));
        
        this._rightList.data(uki.map(d, function(value) {
            return value.slice(1);
        }));
        
        this._splitPane.minSize(new Size(0, this._leftList.minSize().height));
        this._verticalScroll.layout();
    };
    
    this._createDom = function() {
        Base._createDom.call(this);
        var scrollWidth = uki.view.ScrollPane.initScrollWidth(),
            bodyHeight = this.rect().height - this._headerHeight - scrollWidth,
            contents = uki(
            [
                { 
                    view: 'table.Header', 
                    rect: new Rect(this._defaultHandlePosition, this._headerHeight), 
                    anchors: 'left top' 
                },
                { 
                    view: 'Box',
                    className: 'table-header-container',
                    style: { overflow: 'hidden' },
                    rect: new Rect(this._defaultHandlePosition, 0, this.rect().width - this._defaultHandlePosition - 1, this._headerHeight), 
                    anchors: 'left top right',
                    childViews: { 
                        view: 'table.Header', 
                        rect: new Rect(this.rect().width - this._defaultHandlePosition - 1, this._headerHeight), 
                        anchors: 'top left right', 
                        className: 'table-header' 
                    }
                },
                {
                    view: 'ScrollPane',
                    rect: new Rect(0, this._headerHeight, this.rect().width, bodyHeight),
                    anchors: 'left top right bottom',
                    className: 'table-v-scroll',
                    scrollV: true,
                    childViews: [
                        { 
                            view: 'HSplitPane', 
                            rect: new Rect(this.rect().width, bodyHeight), 
                            anchors: 'left top right bottom',
                            className: 'table-horizontal-split-pane',
                            handlePosition: this._defaultHandlePosition,
                            handleWidth: 1,
                            leftChildViews: [
                                { 
                                    view: 'List', 
                                    rect: new Rect(this._defaultHandlePosition, bodyHeight), 
                                    anchors: 'left top right bottom',
                                    className: 'table-list-left' 
                                }
                            ],
                            rightChildViews: [
                                { 
                                    view: 'Box', 
                                    rect: '0 0 100 100', 
                                    anchors: 'left top right bottom',
                                    style: { overflow: 'hidden' },
                                    rect: new Rect(this.rect().width - this._defaultHandlePosition - 1, bodyHeight), 
                                    childViews: { 
                                        view: 'ScrollPane', 
                                        rect: new Rect(this.rect().width - this._defaultHandlePosition - 1, bodyHeight + scrollWidth), 
                                        scrollableV: false,
                                        scrollableH: true,
                                        anchors: 'left top right bottom',
                                        className: 'table-h-scroll',
                                        childViews: [
                                            { 
                                                view: 'List', 
                                                rect: new Rect(this.rect().width - this._defaultHandlePosition - 1, bodyHeight + scrollWidth), 
                                                anchors: 'left top right bottom' 
                                            }
                                        ]
                                    }
                                    
                                }
                            ]
                        }
                    ]
                },
                { 
                    view: 'ScrollPane', 
                    rect: new Rect(this._defaultHandlePosition + 1, bodyHeight + this._headerHeight, this.rect().width - this._defaultHandlePosition - 1, scrollWidth), 
                    anchors: 'left bottom right',
                    scrollableH: true,
                    scrollableV: false,
                    scrollH: true,
                    className: 'table-h-scroll-bar',
                    childViews: { view: 'Box', rect: '1 1', anchors: 'left top' }
                 }
            ]).appendTo(this);
            
        this._verticalScroll = uki('ScrollPane[className=table-v-scroll]', this)[0];
        this._horizontalScroll = uki('ScrollPane[className=table-h-scroll]', this)[0];
        this._horizontalScrollBar = uki('ScrollPane[className=table-h-scroll-bar]', this)[0];
        this._leftList = uki('List:eq(0)', this)[0];
        this._rightList = uki('List:eq(1)', this)[0];
        this._splitPane = uki('HSplitPane', this)[0];
        this._leftHeader = uki('table.Header:eq(0)', this)[0];
        this._rightHeader = uki('table.Header:eq(1)', this)[0];
        this._rightHeaderContainer = uki('[className=table-header-container]', this)[0];
        this._dummyScrollContents = uki('Box', this._horizontalScrollBar);
        
        this._leftList._scrollableParent = this._verticalScroll;
        this._rightList._scrollableParent = this._verticalScroll;
        this._verticalScroll.bind('scroll', uki.proxy(this._leftList._scrollableParentScroll, this._leftList));
        this._verticalScroll.bind('scroll', uki.proxy(this._rightList._scrollableParentScroll, this._rightList));
        
        this._leftList.render(new uki.more.view.splitTable.Render(this._leftHeader));
        this._rightList.render(new uki.more.view.splitTable.Render(this._rightHeader));
        this._bindEvents();
    };
    
    this._bindEvents = function() {
        this._splitPane.bind('handleMove', uki.proxy(this._syncHandlePosition, this, this._splitPane));
        this._horizontalScroll.bind('scroll', uki.proxy(this._syncHScroll, this, this._horizontalScroll));
        this._horizontalScrollBar.bind('scroll', uki.proxy(this._syncHScroll, this, this._horizontalScrollBar));
        this._leftList.bind('selection', uki.proxy(this._syncSelection, this, this._leftList));
        this._rightList.bind('selection', uki.proxy(this._syncSelection, this, this._rightList));
    };
    
    var updatingHandlePosition = false;
    this._syncHandlePosition = function(source) {
        if (updatingHandlePosition) return;
        updatingHandlePosition = true;
        var w, rect;
        if (source == this._splitPane) {
            w = this._splitPane.handlePosition() + 1;
            this.columns()[0].width(w);
        } else {
            var w = this.columns()[0].width();
            this._splitPane.handlePosition(w - 1).layout();
        }
        
        this._leftHeader.rect(new Rect(w, this._headerHeight)).layout();
        
        rect = this._rightHeaderContainer.rect().clone();
        rect.x = w;
        rect.width = this._rect.width - w - uki.view.ScrollPane.initScrollWidth();
        this._rightHeaderContainer.rect(rect).layout();
        rect = this._horizontalScrollBar.rect().clone();
        rect.x = w;
        rect.width = this._rect.width - w - uki.view.ScrollPane.initScrollWidth();
        this._horizontalScrollBar.rect(rect).layout();
        updatingHandlePosition = false;
    };
    
    var updatingHScroll = false;
    this._syncHScroll = function(source) {
        if (updatingHScroll) return;
        updatingHScroll = true;
        var scroll, target = source == this._horizontalScroll ? this._horizontalScrollBar : this._horizontalScroll;
        scroll = source.scrollLeft();
        target.scrollLeft(scroll);
        this._rightHeader.dom().style.marginLeft = -scroll + 'px'; 
        updatingHScroll = false;
    };
    
    var updatingSelection = false;
    this._syncSelection = function(source) {
        if (updatingSelection) return;
        updatingSelection = true;
        var target = source == this._leftList ? this._rightList : this._leftList;
        target.selectedIndexes(source.selectedIndexes());
        updatingSelection = false;
    };
    
    this._updateTotalWidth = function() {
        this._totalWidth = 0;
        for (var i=1; i < this._columns.length; i++) {
            this._totalWidth += this._columns[i].width();
        };
        this._rightHeader.minSize(new Size(this._totalWidth, 0));
        this._rightList.minSize(new Size(this._totalWidth, this._rightList.minSize().height));
        this._dummyScrollContents.rect(new Rect(this._totalWidth, 1)).parent().layout();
        this._rightHeader.minSize(new Size(this._totalWidth, 0));
        this._horizontalScroll.layout();
    };
    
});

uki.more.view.splitTable.Render = uki.newClass(uki.view.table.Render, new function() {
    
    this.setSelected = function(container, data, state, focus) {
        focus = true;
        container.style.backgroundColor = state && focus ? '#3875D7' : state ? '#CCC' : '';
        container.style.color = state && focus ? '#FFF' : '#000';
    }

});