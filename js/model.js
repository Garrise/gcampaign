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
    currentTool: 'drawer',
    currentText: '',
    currentForeColor: 'rgb(0, 0, 0)',
    currentBackColor: 'rgb(255, 255, 255)',
    cellSide: '50px',
    table: '#map',
    background: 'rgb(255, 255, 255)',
    border: '4px ridge #888',
    defaultCell: {
        text: '',
        foreColor: 'rgb(0, 0, 0)',
        backColor: 'rgb(255, 255, 255)'
    },
    mouseKey: 'mouseUp',
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
        for (var i = 0; i < area.length; i++) {
            var x = area[i][0];
            var y = area[i][1];
            this.setStatus(x, y, status);
            //area[i].$td.css("background-color", 'red');
        }
    },
    clearCellStatus: function(status) {
        var statusList = this[status];
        var length = statusList.length;
        for (var i = 0; i < length; i++) {
            this.removeCellStatus(statusList[0][0], statusList[0][1], status);
        }
        statusList = [];
    },
    setStatus: function(x, y, status) {
        if (this.cells[y][x][status]) {
            return;
        }
        this[status].push([x, y]);
        this.cells[y][x][status] = true;
        this.cells[y][x].setBorder();
        if (status == 'masked') {
            this.cells[y][x].$td.append('<div class="masked"></div>');
        }
    },
    removeCellStatus: function(x, y, status) {
        if (!this.cells[y][x][status]) {
            return;
        }
        for (var i = 0; i < this[status].length; i++) {
            if (this[status][i][0] == x && this[status][i][1] == y) {
                this[status].splice(i, 1);
            }
        }
        this.cells[y][x][status] = false;
        this.cells[y][x].setBorder();
        if (status == 'masked') {
            this.cells[y][x].$td.empty();
        }
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
        if (layer.name == 'SHADOW') {
            newLayer.text('阴影层');
        } else {
            newLayer.text(layer.name);
        }
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
        if (layer.name == 'SHADOW') {
            return;
        }
        if (len == 2) {
            alert("至少必须有1个图层！");
            return;
        }
        if (index + 1 < len) {
            var newSelect = div.children().eq(index + 1);
            selectLayer(newSelect);
        } else {
            newSelect = div.children().eq(index - 1);
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
        for (var i = 1; i < len; i++) {
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
                    if (Map.layers[0].getCell(x, y) && Map.layers[0].visible) {
                        switch (Map.layers[0].getCell(x, y).level) {
                            case -2:
                                cell.text = c.text;
                                cell.foreColor = 'rgb(0, 0, 0)';
                                foreDrawn = true;
                                break;
                            case -1:
                                cell.text = c.text;
                                cell.foreColor = this.getLowLight(c.foreColor);
                                foreDrawn = true;
                            default:
                                cell.text = c.text;
                                cell.foreColor = c.foreColor;
                                foreDrawn = true;
                        }
                    } else {
                        cell.text = c.text;
                        cell.foreColor = c.foreColor;
                        foreDrawn = true;
                    }
                }
            }
            //Draw Back
            if (!backDrawn && c) {
                if (c.backColor != null) {
                    if (Map.layers[0].getCell(x, y) && Map.layers[0].visible) {
                        switch (Map.layers[0].getCell(x, y).level) {
                            case -2:
                                cell.backColor = 'rgb(0, 0, 0)';
                                backDrawn = true;
                                break;
                            case -1:
                                cell.backColor = this.getLowLight(c.backColor);
                                backDrawn = true;
                                break;
                            default:
                                cell.backColor = c.backColor;
                                backDrawn = true;
                        }
                    } else {
                        cell.backColor = c.backColor;
                        backDrawn = true;
                    }
                }
            }
        }
        if (!foreDrawn) {
            if (Map.layers[0].getCell(x, y) && Map.layers[0].visible) {
                switch (Map.layers[0].getCell(x, y).level) {
                    case -1:
                        cell.text = this.defaultCell.text;
                        cell.foreColor = this.getLowLight(this.defaultCell.foreColor);
                        break;
                    case -2:
                        cell.text = this.defaultCell.text;
                        cell.foreColor = 'rgb(0, 0, 0)';
                        break;
                    default:
                        cell.text = this.defaultCell.text;
                        cell.foreColor = this.defaultCell.foreColor;
                }
            } else {
                cell.text = this.defaultCell.text;
                cell.foreColor = this.defaultCell.foreColor;
            }
        }
        if (!backDrawn) {
            if (Map.layers[0].getCell(x, y) && Map.layers[0].visible) {
                switch (Map.layers[0].getCell(x, y).level) {
                    case -1:
                        cell.backColor = this.getLowLight(this.defaultCell.backColor);
                        break;
                    case -2:
                        cell.backColor = 'rgb(0, 0, 0)';
                        break;
                    default:
                        cell.backColor = this.defaultCell.backColor;
                }
            } else {
                cell.backColor = this.defaultCell.backColor;
            }
        }
        cell.drawCellContent();
    },
    zoom: function(type) {
        var side = parseInt(this.cellSide);
        switch (type) {
            case 'out':
                side += 5;
                break;
            case 'in':
                side -= 5;
                break;
        }
        this.cellSide = side + 'px';
        this.zoomRefresh();
    },
    zoomRefresh: function() {
        for (var y = 0; y < this.height; y++) {
            for (var x = 0; x < this.width; x++) {
                this.cells[y][x].$td.css('width', this.cellSide);
                this.cells[y][x].$td.css('height', this.cellSide);
                this.cells[y][x].$td.css('min-width', this.cellSide);
                this.cells[y][x].$td.css('min-height', this.cellSide);
                this.cells[y][x].$td.css('max-width', this.cellSide);
                this.cells[y][x].$td.css('max-height', this.cellSide);
            }
        }
    },
    getRGB: function(color) {
        if (color.substr(0, 3) == 'rgb') {
            var char = '';
            var one = '';
            var rgb = [];
            var j = 0;
            for (var i = 4; i <color.length; i++) {
                char = color.substr(i, 1);
                if (char == ',' || char == ')') {
                    rgb[j] = parseInt(one);
                    one = '';
                    j++;
                } else if (char.charCodeAt() >= 48 && char.charCodeAt() <= 57) {
                    one += char;
                }
            }
        }
        return rgb;
    },
    getLowLight: function(color) {
        var rgb1 = this.getRGB(color);
        var rgb2 = [0, 0, 0];
        var alpha = 0.5;
        var rgb = [];
        rgb[0] = parseInt((1 - alpha) * rgb2[0] + alpha * rgb1[0] + '');
        rgb[1] = parseInt((1 - alpha) * rgb2[1] + alpha * rgb1[1] + '');
        rgb[2] = parseInt((1 - alpha) * rgb2[2] + alpha * rgb1[2] + '');
        return 'rgb(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')';
    }
};

/* Layer */
function Layer(name) {
    this.name = name;
    this.visible = true;
    this.cells = [];
    this.getCell = function(x, y) {
        var cells = this.cells;
        if (!cells[y]) {
            return null;
        }
        var c = cells[y];
        return c[x] ? c[x] : null;
    };
    this.setCell = function(x, y, layerCell) {
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
    };
    this.createCell = function(x, y) {
        var c = this.getCell(x, y);
        if (!c) {
            var cell = new LayerCell();
            this.setCell(x, y, cell);
            return cell;
        }
        return c;
    };
    this.deleteCell = function(x, y) {
        var c = this.getCell(x, y);
        if (c) {
            this.setCell(x, y, null);
        }
    };
    this.getCells = function() { //Get all not empty cells and put them in a list
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
    };
    this.trim = function() { //Clear all empty cells
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
}

LayerCell = function(back, fore, text) {
    this.backColor = back ? back : Map.defaultCell.backColor;
    this.foreColor = fore ? fore : Map.defaultCell.foreColor;
    this.text = text ? text : Map.defaultCell.text;
    this.set = function(back, fore, text) {
        this.backColor = back;
        this.foreColor = fore;
        this.text = text;
    };
};

/* Shadow Layer */
function ShadowLayer() {
    Layer.call(this);
    this.name = 'SHADOW';
    this.auto = false; // True: Automatically fit the light level by Character's Vision and Object's light
    this.createCell = function(x, y) {
        var c = this.getCell(x, y);
        if (!c) {
            var cell = new ShadowCell();
            this.setCell(x, y, cell);
            return cell;
        }
        return c;
    }
}

function ShadowCell() {
    this.level = 0; // 0: Normal, -1: Low-Light, -2: Dark
}

/* Cell */
function Cell(x, y, leftCell, topCell, $td) {
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
}
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
    foreColor: 'rgb(0, 0, 0)',
    backColor: 'rgb(255, 255, 255)',
    /*Border*/
    border: {
        none: '1px solid #f0f0f0',
        mm: '1px solid #808',
        marked: '1px solid #F00',
        masked: '1px solid #00F'
    },
    borderTop: '1px solid #f0f0f0',
    borderRight: '1px solid #f0f0f0',
    borderBottom: '1px solid #f0f0f0',
    borderLeft: '1px solid #f0f0f0',
    /*Status*/
    marked: false,
    masked: false,
    selected:false,
    $td: null,

    isEmpty: function() {
        return this.text == Map.defaultCell.text && this.foreColor == Map.defaultCell.foreColor && this.backColor == Map.defaultCell.backColor;
    },
    /* Status Border */
    setBorder: function() {
        var border = this.getBorder(this.topCell);
        var noneBorder = this.border.none;
        if (border != this.borderTop) {
            this.borderTop = border;
            this.$td.css("border-top", border);
            if (this.topCell) {
                this.topCell.$td.css("border-bottom", border);
                this.topCell.borderBottom = border;
            }
        }
        border = this.getBorder(this.rightCell);
        if (border != this.borderRight) {
            this.borderRight = border;
            this.$td.css("border-right", border);
            if (this.rightCell) {
                this.rightCell.$td.css("border-left", border);
                this.rightCell.borderLeft = border;
            }
        }
        border = this.getBorder(this.bottomCell);
        if (border != this.borderBottom) {
            this.borderBottom = border;
            this.$td.css("border-bottom", border);
            if (this.bottomCell) {
                this.bottomCell.$td.css("border-top", border);
                this.bottomCell.borderTop = border;
            }
        }
        border = this.getBorder(this.leftCell);
        if (border != this.borderLeft) {
            this.borderLeft = border;
            this.$td.css("border-left", border);
            if (this.leftCell) {
                this.leftCell.$td.css("border-right", border);
                this.leftCell.borderRight = border;
            }
        }
    },
    getBorder: function(target) { // Get border style between this cell and target cell, target must be near to this
        if (target) {
            // If this cell's status equals to target's, draw normal border
            if ((this.marked == target.marked) && (this.masked == target.masked)) {
                return this.border.none;
                // If this cell and target has one same and one different, draw different one
            } else if (!(this.marked && target.marked) && (this.masked == target.masked)) {
                return this.border.marked;
            } else if (!(this.masked && target.masked) && (this.marked == target.marked)) {
                return this.border.masked;
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
        if (this.$td.text() !== text) {
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
        if (!this.isEmpty) {
            this.text = Map.defaultCell.text;
            this.backColor = Map.defaultCell.backColor;
            this.foreColor = Map.defaultCell.foreColor;
            this.drawCellContent();
        }
    }
};

/********************* History *************************/
History = {
    logs: [],
    logIndex: 0,
    createHistory: function(name) {
        if ($('#layer').has('.selectedLayer').length) {
            var historyLog =  new HistoryLog(name);
            historyLog.layerLevel = $('.selectedLayer').index();
            this.logs.push(historyLog);
            this.logIndex++;
            var $history = $('#history');
            if ($history.has('.selectedLog').length) {
                $history.find('.selectedLog').removeClass('selectedLog');
            }
            var $log = $('<div class="historyLog selectedLog"></div>');
            $log.text(name);
            $history.prepend($log);
        }
    },
    clearHistory: function() {
        if ($('#layer').has('.selectedLayer').length) {
            while (this.logIndex != this.logs.length) {
                this.logs.pop()
            }
            var $history = $('#history');
            if ($history.has('.cancelledLog').length) {
                var $cancelledLog = $('.cancelledLog');
                $cancelledLog.remove();
            }
        }
    },
    undo: function() {
        if (this.logIndex == 0) {
            return false;
        } else {
            this.logIndex--;
            var historyLog = this.logs[this.logIndex];
            var originCells = historyLog.originCells;
            var newCells = historyLog.newCells;
            var layerLevel = historyLog.layerLevel;
            this.deleteCells(newCells, layerLevel);
            this.revertCells(originCells, layerLevel);
            var $selected = $('.selectedLog');
            var $newSelected = $selected.next();
            $selected.removeClass('selectedLog').addClass('cancelledLog');
            $newSelected.addClass('selectedLog');
            return true;
        }
    },
    redo: function() {
        if (this.logIndex == this.logs.length) {
            return false;
        } else {
            var historyLog = this.logs[this.logIndex];
            var originCells = historyLog.originCells;
            var newCells = historyLog.newCells;
            var layerLevel = historyLog.layerLevel;
            this.deleteCells(originCells, layerLevel);
            this.revertCells(newCells, layerLevel);
            this.logIndex++;
            var $selected = $('.selectedLog');
            var $newSelected = $selected.prev();
            $selected.removeClass('selectedLog').removeClass('cancelledLog');
            $newSelected.addClass('selectedLog');
            return true;
        }
    },
    select: function(index) {
        if (index > this.logIndex) {
            for (var i = this.logIndex; i < index; i++) {
                this.redo();
            }
        } else if (index < this.logIndex) {
            for (i = this.logIndex; i > index; i--) {
                this.undo();
            }
        }
        this.logIndex = index;
    },
    deleteCells: function(cells, layerLevel) {
        for (var i = 0; i < cells.length; i++) {
            var x = cells[i].x;
            var y = cells[i].y;
            if (Map.layers[layerLevel].getCell(x, y)) {
                Map.layers[layerLevel].deleteCell(x, y);
            }
            Map.refreshCell(x, y);
        }
    },
    revertCells: function(cells, layerLevel) {
        for (var  i = 0; i < cells.length; i++) {
            var x = cells[i].x;
            var y = cells[i].y;
            if (cells[i].empty) {
                continue;
            } else {
                var cell = Map.layers[layerLevel].createCell(x, y);
                if (layerLevel == 0) {
                    cell.level = cells[i].level;
                } else {
                    cell.text = cells[i].text;
                    cell.foreColor = cells[i].foreColor;
                    cell.backColor = cells[i].backColor;
                }
            }
            Map.refreshCell(x, y);
        }
    }
};
function HistoryLog(name) {
    this.name = name;
    this.layerLevel = undefined;
    this.originCells = [];
    this.newCells = [];
    this.visitedArea = [];
    this.addOrigin = function (x, y) {
        var area = this.visitedArea;
        if (!this.getVisited(x, y)) {
            this.originCells.push(new HistoryCell(Map.currentLayer.getCell(x, y), x, y));
            this.setVisited(x, y);
        }
    };
    this.addNew = function (x, y) {
        this.newCells.push(new HistoryCell(Map.currentLayer.getCell(x, y), x, y));
    };
    this.setVisited = function(x, y) {
        var area = this.visitedArea;
        if (!area[y]) {
            area[y] = [];
        }
        area[y][x] = true;
    };
    this.getVisited = function(x, y) {
        var area = this.visitedArea;
        if (area[y]) {
            return area[y][x];
        }
        return null;
    }
}
function HistoryCell(cell, x, y) {
    this.x = x;
    this.y = y;
    if (cell) {
        if (Map.currentLayer.name == 'SHADOW') {
            this.level = cell.level;
        } else {
            this.text = cell.text;
            this.foreColor = cell.foreColor;
            this.backColor = cell.backColor;
        }
    } else {
        this.empty = true;
    }
}