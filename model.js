/**
 * Created by Garrise on 2016/3/7.
 */
/*
CampaignDesigner Model Contain:
map
cell
layer
token
 */
/******************  Map Object  ******************/
/* Map */
Map = {
    name: "Map 1",
    width: 60,
    height: 40,
    cells: [],// cells[y][x]
    marked: [],
    masked: [],
    layers: [],
    currentLayer: null,
    currentTool: 'Effect',
    currentText: '',
    currentForeColor: '#000',
    currentBackColor: '#FFF',
    cellSide: '30px',
    table: '#map',
    background: '#FFF',
    border: '4px ridge #888',
    defaultCell: {
        text: '',
        foreColor: '#000',
        backColor: '#FFF'
    },
    /* Create Map Method */
    createMap: function(width, height, cellSide) {
        this.width = width;
        this.height = height;
        this.cellSide = cellSide;
        var td = this.table + ' td';
        var lastRow = null;
        for (var y = 0; y < height; y++) {
            $(this.table).append('<tr></tr>');
            var tr = this.table + ' tr:last';
            lastRow = this.createCellRow(tr, y, lastRow);
            this.cells[y] = lastRow;
        }
        $(td).css("width", cellSide);
        $(td).css("min-width", cellSide);
        $(td).css("max-width", cellSide);
        $(td).css("height", cellSide);
        $(td).css("min-height", cellSide);
        $(td).css("max-height", cellSide);
    },

    createCellRow: function(tr, y, lastRow) {
        var width = this.width;
        var row = [];
        var lastCell = null;
        for (var x = 0; x < width; x++) {
            var cell = new Cell(x, y, lastCell, lastRow ? lastRow[x]:null);
            row[x] = cell;
            $(tr).append('<td></td>');
            var td = tr + ' td:last';
            cell.$td = $(td);
            cell.drawCellContent();
            lastCell = cell;
        }
        return row;
    },

    /*  Marked and Masked Method */
    setCellStatus: function(status, area) {// Set cells in the area[] to the status
        var statusList = this[status];
        for (var i = 0; i < area.length; i++) {
            var x = area[i][0];
            var y = area[i][1];
            statusList.push(area[i]);
            Map.cells[y][x][status] = true;
            //area[i].$td.css("background-color", 'red');
        }
        for (i = 0; i < statusList.length; i++) {
            x = statusList[i][0];
            y = statusList[i][1];
            Map.cells[y][x].setBorder();
        }
        this[status] = statusList;
    },
    removeCellStatus: function(status) {
        var statusList = this[status];
        for (var i = 0; i < statusList.length; i++) {
            var x = statusList[i][0];
            var y = statusList[i][1];
            Map.cells[y][x][status] = false;
        }
        for (i = 0; i < statusList.length; i++) {
            x = statusList[i][0];
            y = statusList[i][1];
            Map.cells[y][x].setBorder();
        }
        this[status] = [];
    },

    // Layer
    addLayer: function(layer, index) {
        if (index) {
            this.layers.splice(index, 0, layer);
        } else {
            this.layers.push(layer);
        }
        if (!this.currentLayer) {
            this.currentLayer = layer;
        }
        var newLayer = $('<div></div>');
        newLayer.addClass('layer');
        newLayer.text(layer.name);
        if ($('#layer').has('.selectedLayer').length) {
            $('.selectedLayer').after(newLayer);
        } else if ($('#layer').has('.invisibleSelectedLayer').length) {
            $('.invisibleSelectedLayer').after(newLayer);
        } else {
            $('#layer').append(newLayer);
        }
    },
    removeLayer: function(layer) {
        var index = Map.layers.indexOf(Map.currentLayer);
        var div = $('#layer');
        var len = div.children().length;
        if (len == 1) {
            alert("至少必须有1个图层！");
            return;
        }
        if (index + 1 < len) {
            var newSelect = div.children().eq(index + 1);
            selectLayer(newSelect);
        } else {
            var newSelect = div.children().eq(index - 1);
            selectLayer(newSelect);
        }
        div.children().eq(index).remove();
        var i = this.layers.indexOf(layer);
        if (this.currentLayer == layer) {
            if (this.layers[i]){
                this.currentLayer = this.layers[i];
            } else {
                this.currentLayer = this.layers[i - 2];
            }
        }
        this.layers.splice(i - 1, 1);
    },
    refresh: function() {
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                this.refreshCell(x, y);
            }
        }
    },
    refreshCell: function(x, y) { // Search the top visible not empty layer and draw the cell
        var foreDrawn = false;
        var backDrawn = false;
        var layers = this.layers;
        var len = layers.length;
        var cell = this.cells[y][x];
        for (var i = 0; i < len; i++) {
            if (foreDrawn && backDrawn) {
                break;
            }
            if (!layers[i].visible) {
                continue;
            }
            var c = layers[i].getCell(x, y);
            //Draw Text
            if (!foreDrawn && c) {
                if (c.text != null) {
                    cell.text = c.text;
                    cell.foreColor = c.foreColor;
                    foreDrawn = true;
                }
            }
            //Draw Back
            if (!backDrawn && c) {
                if (c.backColor != null) {
                    cell.backColor = c.backColor;
                    backDrawn = true;
                }
            }
        }
        if (!foreDrawn) {
            cell.text = this.defaultCell.text;
            cell.foreColor = this.defaultCell.foreColor;
        }
        if (!backDrawn) {
            cell.backColor = this.defaultCell.backColor;
        }
        cell.drawCellContent();
    }
};

/* Layer */
Layer = function(name) {
    this.name = name;
    this.visible = true;
    this.cells = [];
};
Layer.prototype = {
    name: undefined,
    visible: true,
    cells: [],
    getCell: function(x, y) {
        var cells = this.cells;
        if (!cells[y]) {
            return null;
        }
        var c = cells[y];
        return c[x] ? c[x] : null;
    },
    setCell: function(x, y, layerCell) {
        var cells = this.cells;
        if (layerCell) {
            if (!cells[y]) {
                cells[y] = [];
            }
            cells[y][x] = layerCell;
        } else {
            if (cells[y]) {
                delete cells[y][x];
                if (!cells[y])
                    delete cells[y];
            }
        }
    },
    createCell: function(x, y) {
        var c = this.getCell(x, y);
        if (!c) {
            var cell = new LayerCell();
            this.setCell(x, y, cell);
            return cell;
        }
        return c;
    },
    getCells: function() { //Get all not empty cells and put them in a list
        var list = [];
        var cells = this.cells;
        var h = cells.length;
        for (var y = 0; y < h; y++) {
            if (cells[y] && cells[y].length <= 0) {
                var row = cells[y];
                var len = row.length;
                for (var x = 0; x < len; x++) {
                    if (row[x]) {
                        list.push(row[x]);
                    }
                }
            }
        }
        return list;
    },
    trim: function() { //Clear all empty cells
        var cells = this.cells;
        var h = cells.length;
        for (var y = 0; y < h; y++) {
            if (cells[y]) {
                if (cells[y].length <= 0) {
                    delete cells[y];
                }
                var row = cells[y];
                var len = row.length;
                var count = 0;
                for (var x = 0; x < len; x++) {
                    if (!row[x] || (row[x].text == null && row[x].foreColor == null && row[x].backColor == null)) {
                        delete cells[y][x];
                    } else {
                        count++;
                    }
                }
                if (!count) {
                    delete cells[y];
                }
            }
        }
    }
};
LayerCell = function(back, fore, text) {
    this.backColor = back;
    this.foreColor = fore;
    this.text = text;
};
LayerCell.prototype = {
    backColor: null,
    foreColor: null,
    text: null,
    set: function(back, fore, text) {
        this.backColor = back;
        this.foreColor = fore;
        this.text = text;
    }
};

/* Cell */
Cell = function(x, y, leftCell, topCell, $td) {
    this.x = x;
    this.y = y;
    this.$td = $td;
    this.leftCell = leftCell;
    if (leftCell) {
        leftCell.rightCell = this;
    }
    this.topCell = topCell;
    if (topCell) {
        topCell.bottomCell = this;
    }
};
Cell.prototype = {
    x: undefined,
    y: undefined,
    /* NearbyCell */
    topCell: null,
    rightCell: null,
    bottomCell: null,
    leftCell: null,
    /*Content*/
    text: '',
    foreColor: '#000',
    backColor: '#FFF',
    /*Border*/
    border: {
        none: '1px solid #f0f0f0',
        mm: '1px solid #808',
        marked: '1px solid #F00',
        masked: '1px solid #00F'
    },
    borderTop: '',
    borderRight: '',
    borderBottom: '',
    borderLeft: '',
    /*Status*/
    marked: false,
    masked: false,
    selected:false,
    $td: null,

    isEmpty: function() {
        return this.text === '' && this.foreColor === '#000' && this.backColor === '#FFF';
    },
    /* Status Border */
    setBorder: function() {
        var border = this.getBorder(this.topCell);
        if (border != this.borderTop) {
            this.borderTop = border;
            this.$td.css("border-top", border);
        }
        border = this.getBorder(this.rightCell);
        if (border != this.borderRight) {
            this.borderRight = border;
            this.$td.css("border-right", border);
        }
        border = this.getBorder(this.bottomCell);
        if (border != this.borderBottom) {
            this.borderBottom = border;
            this.$td.css("border-bottom", border);
        }
        border = this.getBorder(this.leftCell);
        if (border != this.borderLeft) {
            this.borderLeft = border;
            this.$td.css("border-left", border);
        }
    },
    getBorder: function(target) { // Get border style between this cell and target cell, target must be near to this
        if (target) {
            // If this is empty or this cell's status equals to target's, draw normal border
            if ((!this.marked && !this.masked) || ((this.marked == target.marked) && (this.masked == target.masked))) {
                return this.border.none;
                // If target is empty, it does no effect on this
            } else if (!target.marked && !target.masked) {
                return this.getBorder(null);
                // If this is only marked, target must be masked if not empty
                // If this is only masked, target must be marked if not empty
                // If this is marked and masked, return all
                // Thus return marked and masked border
            } else {
                return this.border.mm;
            }
        } else if (this.marked && this.masked) {
            return this.border.mm;
        } else if (this.marked) {
            return this.border.marked;
        } else if (this.masked){
            return this.border.masked;
        } else {
            return this.border.none;
        }
    },
    /* Draw Method */
    drawCellContent: function() {
        this.drawCellText();
        this.drawCellForeColor();
        this.drawCellBackColor();
    },
    drawCellText: function() {
        var text = this.text;
        if (this.$td.val() !== text) {
            this.$td.text(text);
        }
    },
    drawCellForeColor: function() {
        var fore = this.foreColor;
        if (this.$td.css("color") !== fore) {
            this.$td.css("color", fore);
        }
    },
    drawCellBackColor: function() {
        var back = this.backColor;
        if (this.$td.css("background-color") !== back) {
            this.$td.css("background-color", back);
        }
    },

    /* Erase Method */
    eraseCellContent: function() {
        if (this.isEmpty) {
            this.text = '';
            this.$td.text('');
            this.backColor = "#FFF";
            this.$td.css("background-color", "#FFF");
            this.foreColor = "#000";
            this.$td.css("color", "#000");
        }
    }
};