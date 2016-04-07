/**
 * Created by Garrise on 2016/3/8.
 */
/*
Tool Contain in ToolBar:
Drawer
Eraser
Color Menu
Character
 */
var ToolBox = {
    drawer: new Drawer(),
    eraser: new Eraser(),
    color: new Color(),
    character: new Character(),
    effect: new Effect(),
    select: new Select(),
    move: new Move()
};
function Tool() {
    this.size = 1; // 5feet/1
    this.td = $('td:last'); //Current hovered td
    this.area = [];
    this.visitedArea = [];
    /* Cell */
    this.getCell = function() {
        var x = this.td.index();
        var y = this.td.parent().index();
        return Map.cells[y][x];
    };
    /* Tool Area */
    this.markArea = function() {
        var area = [];
        var cell = this.getCell();
        this.initVisitedArea([cell.x, cell.y]);
        area = this.searchArea(area, cell);
        this.visitedArea = [];
        Map.setCellStatus('marked', area);
        this.area = area;
    };
    this.removeMarkArea = function() {
        Map.clearCellStatus('marked');
    };
    this.initVisitedArea = function(originGrid) {
        var visitedRow = [];
        for (var i = originGrid[0] - this.size; i <= originGrid[0] + this.size; i++) {
            for (var j = originGrid[1] - this.size; j <= originGrid[1] + this.size; j++) {
                visitedRow[j] = false;
            }
            this.visitedArea[i] = visitedRow;
            visitedRow = [];
        }
    };
    this.mouseDown = function(){};
    this.mouseOver = function(){
        this.removeMarkArea();
        this.markArea();
    };
    this.mouseUp = function(){};
    this.doubleClick = function(){};
}

function DrawTool() {
    Tool.call(this);
    this.searchArea = function(area, cell) {// Direction: topCell, rightCell, bottomCell, leftCell
        if (!cell) {
            return area;
        }
        if (!this.fitArea(cell) || this.visitedArea[cell.x][cell.y]) {
            return area;
        } else {
            area.push([cell.x, cell.y]);
            this.visitedArea[cell.x][cell.y] = true;
            //cell.$td.css("background-color", 'red');
            area = this.searchArea(area, cell.topCell);
            area = this.searchArea(area, cell.rightCell);
            area = this.searchArea(area, cell.bottomCell);
            area = this.searchArea(area, cell.leftCell);
        }
        return area;
    };
    this.fitArea = function(target) {// Find if the given cell is in the Area from td
        var size = this.size;
        var cell = this.getCell();
        var xDiff = target.x - cell.x;
        var yDiff = cell.y - target.y;
        return Math.abs(xDiff) < size && Math.abs(yDiff) < size;
        /*case 'cone':
         switch (rotate) {
         case 'top':
         // Top cone limit
         var topConeLimit = yDiff >= Math.abs(xDiff);
         // Range limit
         var rangeLimit = this.range(originCell, target) <= size;
         return topConeLimit && rangeLimit;
         case 'right-top':
         //Right-Top cone limit
         var rightTopConeLimit = yDiff >= 0 && xDiff >= 0;
         //Range limit
         var rangeLimit = this.range(originCell, target) <= size;
         return rightTopConeLimit && rangeLimit;
         }
         break;*/
    };
    this.range = function(cell, target) {// Find the range between the given cells
        var xRange = Math.abs(target.x - cell.x);
        var yRange = Math.abs(target.y - cell.y);
        var shorterRange = xRange < yRange ? xRange : yRange;
        var diffRange = Math.abs(xRange - yRange);
        return Math.floor(1.5 * shorterRange + diffRange);
    };
}

function Drawer() {
    DrawTool.call(this);
    this.drawArea = function(e) {
        if (!Map.currentLayer.visible) {
            return;
        }
        if (Map.currentLayer.name == 'SHADOW') {
            if (e.ctrlKey) {
                for (var i = 0; i < Map.marked.length; i++) {
                    var x = Map.marked[i][0];
                    var y = Map.marked[i][1];
                    Map.currentLayer.createCell(x, y).level = -1; // ctrl: Low-Light
                    Map.refreshCell(x, y)
                }
            } else if (e.shiftKey) {
                for (y = 0; y < Map.height; y++) {
                    for (x = 0; x < Map.width; x++) {
                        Map.currentLayer.createCell(x, y).level = -2;
                        Map.refreshCell(x, y);
                    }
                }
            } else {
                for (i = 0; i < Map.marked.length; i++) {
                    x = Map.marked[i][0];
                    y = Map.marked[i][1];
                    Map.currentLayer.createCell(x, y).level = -2; // normal: Dark
                    Map.refreshCell(x, y)
                }
            }
        } else {
            for (i = 0; i < Map.marked.length; i++) {
                x = Map.marked[i][0];
                y = Map.marked[i][1];
                if (Map.layers[0].getCell(x, y) && Map.layers[0].visible) {
                    if (Map.layers[0].getCell(x, y).level < 0) {
                        continue;
                    }
                }
                if (e.ctrlKey) {
                    Map.currentLayer.createCell(x, y).text = Map.currentText;
                    Map.currentLayer.createCell(x, y).foreColor = Map.currentForeColor;
                    Map.refreshCell(x, y);
                } else if (e.shiftKey) {
                    Map.currentLayer.createCell(x, y).text = Map.currentText;
                    Map.currentLayer.createCell(x, y).foreColor = Map.currentForeColor;
                    Map.currentLayer.createCell(x, y).backColor = Map.currentBackColor;
                    Map.refreshCell(x, y);
                } else {
                    Map.currentLayer.createCell(x, y).backColor = Map.currentBackColor;
                    Map.refreshCell(x, y);
                }
            }
        }
    };
    this.mouseDown = function(e) {
        this.drawArea(e);
    };
    this.mouseOver = function(e){
        this.removeMarkArea();
        this.markArea();
        if (Map.mouseKey == 'mouseDown') {
            this.drawArea(e);
        }
    };
}

function Eraser() {
    DrawTool.call(this);
    this.eraseArea = function() {
        if (!Map.currentLayer.visible) {
            return;
        }
        for (var i = 0; i < Map.marked.length; i++) {
            var x = Map.marked[i][0];
            var y = Map.marked[i][1];
            Map.currentLayer.deleteCell(x, y);
            Map.refreshCell(x, y)
        }
    };
    this.mouseDown = function(){
        this.eraseArea();
    };
    this.mouseOver = function(){
        this.removeMarkArea();
        this.markArea();
        if (Map.mouseKey == 'mouseDown') {
            this.eraseArea();
        }
    };
}
function Color() {
    this.setColor = function(type, color) { // type= 'Back' or 'Fore'
        Map['current' + type + 'Color'] = color;
    }
}

function Character() {
    this.setCharacter = function(character) {
        Map.currentText = character;
    }
}

function Effect() {
    Tool.call(this);
    this.size = 3;
    this.shape = 1;
    this.shapeList = ['circle', 'cone'];
    this.rotate = 7;
    this.rotateList = ['top', 'right-top', 'right', 'right-bottom', 'bottom', 'left-bottom', 'left', 'left-top'];
    this.markArea = function() {
        this.area = [];
        this.area = this.searchArea(this.getCell());
        Map.setCellStatus('marked', this.area);
    };
    this.searchArea = function(cell) {
        var area = [];
        var originGrid = [cell.x + 1, cell.y + 1];
        var gridList = [];
        // Initialize Search Area
        this.initVisitedArea(originGrid);
        gridList = this.searchGrid(gridList, originGrid, originGrid);
        this.visitedArea = [];
        var gridCrossList = [];
        this.initVisitedArea(originGrid);
        for (var i = 0; i < gridList.length; i++) {
            gridCrossList = [];
            if (this.isLeaned(gridList[i], originGrid)) {
                var line = this.getLine(gridList[i], originGrid);
                var k = line[0];
                var b = line[1];
                var prec = 0.01;
                for (x = originGrid[0]; gridList[i][0] > originGrid[0] ? x <= gridList[i][0] : x >= gridList[i][0]; gridList[i][0] > originGrid[0] ? x++ : x--) {
                    var yResult = k * x + b;
                    yResult - Math.floor(yResult) < prec ? yResult = Math.floor(yResult) : '';
                    Math.ceil(yResult) - yResult < prec ? yResult = Math.ceil(yResult) : '';
                    gridCrossList.push([x, yResult]);
                }
                for (y = originGrid[1]; gridList[i][1] > originGrid[1] ? y <= gridList[i][1] : y >= gridList[i][1]; gridList[i][1] > originGrid[1] ? y++ : y--) {
                    var xResult = (y - b) / k;
                    if (xResult - Math.floor(xResult) > prec && Math.ceil(xResult) - xResult > prec) {
                        gridCrossList.push([(y - b) / k, y]);
                    }
                }
                function gridSort (grid1, grid2) {
                    return grid1[0] - grid2[0];
                }
                gridCrossList.sort(gridSort);
                for (var g = 0; g < gridCrossList.length - 1; g++) {
                    var x = (gridCrossList[g][0] + gridCrossList[g + 1][0]) / 2;
                    var y = (gridCrossList[g][1] + gridCrossList[g + 1][1]) / 2;
                    if ((x >=0 && x < Map.width) && (y >=0 && y < Map.height)) {
                        var xTarget = Math.floor(x);
                        var yTarget = Math.floor(y);
                        if (!this.visitedArea[xTarget][yTarget]) {
                            this.visitedArea[xTarget][yTarget] = true;
                            area.push([xTarget, yTarget]);
                        }
                    }
                }
            }
        }
        this.visitedArea = [];
        return area;
    };
    this.searchGrid = function(gridList, grid, originGrid) {
        var topGrid = [grid[0], grid[1] - 1];
        var rightGrid = [grid[0] + 1, grid[1]];
        var bottomGrid = [grid[0], grid[1] + 1];
        var leftGrid = [grid[0] - 1, grid[1]];
        if (this.fitGrid(grid, originGrid) && !this.visitedArea[grid[0]][grid[1]]) {
            if (this.gridRange(grid, originGrid) == this.size) {
                gridList.push(grid);
            }
            this.visitedArea[grid[0]][grid[1]] = true;
            this.searchGrid(gridList, topGrid, originGrid);
            this.searchGrid(gridList, rightGrid, originGrid);
            this.searchGrid(gridList, bottomGrid, originGrid);
            this.searchGrid(gridList, leftGrid, originGrid);
        }
        return gridList;
    };
    this.fitGrid = function(grid, originGrid) {// Search target grid with the range of size from originGrid and within shape
        var shape = this.shapeList[this.shape];
        var rotate = this.rotateList[this.rotate];
        switch (shape) {
            case 'cone':
                var rangeLimit = this.gridRange(grid, originGrid) <= this.size;
                var coneLimit = this.coneLimit(rotate, grid, originGrid);
                return rangeLimit && coneLimit;
            case 'circle':
                return this.gridRange(grid, originGrid) <= this.size;
        }
    };
    this.gridRange = function(grid, target) { //Find the range between the given grid
        var xRange = Math.abs(grid[0] - target[0]);
        var yRange = Math.abs(grid[1] - target[1]);
        var shorterRange = xRange < yRange ? xRange : yRange;
        var diffRange = Math.abs(xRange - yRange);
        return Math.floor(1.5 * shorterRange + diffRange);
    };
    // parameter = [k, b], means a line(y = kx + b) cross a grid, cross() function tend to find if the line cross a cell
    // parameter must be a leaned line
    this.isLeaned = function(grid1, grid2) {// Find if line between grid1 and grid2 is leaned
        return !(grid1[0] == grid2[0] || grid1[1] == grid2[1]);
    };
    this.getLine = function(grid1, grid2) {// Get line parameter between grid1 and grid2
        var a1 = grid1[0];
        var a2 = grid2[0];
        var b1 = grid1[1];
        var b2 = grid2[1];
        var k = (b1 - b2) / (a1 - a2);
        var b = (a1 * b2 - a2 * b1) / (a1 - a2);
        return [k, b];
    };
    this.coneLimit = function(rotate, grid, originGrid) {
        /*
         top <<
         x o o o o o x line2
         o x o o o x o
         o o x o x o o
         >< left o o o x o o o right <>
         o o x o x o o
         o x o o o x o
         x o o o o o x line1
         bottom  >>
         */
        var xOri = originGrid[0];
        var yOri = originGrid[1];
        var x = grid[0];
        var y = grid[1];
        var line1 = this.getLine([xOri, yOri], [xOri + 1, yOri + 1]);
        var line2 = this.getLine([xOri, yOri], [xOri + 1, yOri - 1]);
        var k1 = line1[0], k2 = line2[0], b1 = line1[1], b2=line2[1];
        switch (rotate) {
            case 'top':
                return y <= k1 * x + b1 && y <= k2 * x + b2;
            case 'right':
                return y <= k1 * x + b1 && y >= k2 * x + b2;
            case 'bottom':
                return y >= k1 * x + b1 && y >= k2 * x + b2;
            case 'left':
                return y >= k1 * x + b1 && y <= k2 * x + b2;
            case 'right-top':
                return y <= yOri && x >= xOri;
            case 'right-bottom':
                return y >= yOri && x >= xOri;
            case 'left-bottom':
                return y >= yOri && x <= xOri;
            case 'left-top':
                return y <= yOri && x <= xOri;
        }
    };
}
function SelectTool() {
    Tool.call(this);
    this.originCell = undefined;
    this.tempArea = [];
    this.setOrigin = function() {
        this.originCell = this.getCell();
        this.tempArea = [];
        var temp = this.tempArea;
        if (this.originCell.masked) {
            var cells = Map.masked;
        } else {
            cells = Map.marked;
        }
        for (var i = 0; i < cells.length; i++) {
            var x = cells[i][0];
            var y = cells[i][1];
            var cell = Map.currentLayer.getCell(x, y);
            if (!cell) {
                this.tempArea.push({x: x, y: y, sign: true, empty: true})
            } else {
                if (Map.currentLayer.name == 'SHADOW') {
                    this.tempArea.push({x: x, y: y, sign: true, level: cell.level});
                } else {
                    this.tempArea.push({x: x, y: y, sign: true, text: cell.text, foreColor: cell.foreColor, backColor:cell.backColor});
                }
            }
        }
    };
    this.searchSimilar = function(area, cell) {
        if (!cell) {
            return area;
        }
        if (this.fitSimilar(cell) && !this.isVisited(cell.x, cell.y)) {
            area.push([cell.x, cell.y]);
            this.setVisited(cell.x, cell.y);
            area = this.searchSimilar(area, cell.topCell);
            area = this.searchSimilar(area, cell.rightCell);
            area = this.searchSimilar(area, cell.bottomCell);
            area = this.searchSimilar(area, cell.leftCell);
        } else {
            return area;
        }
        return area;
    };
    this.fitSimilar = function(cell) {
        var x = this.getCell().x;
        var y = this.getCell().y;
        var originCell = Map.currentLayer.getCell(x, y);
        if (originCell) {
            return cell.text == originCell.text && cell.backColor == originCell.backColor && cell.foreColor == originCell.foreColor;
        } else {
            return false;
        }
    };
    this.isVisited = function(x, y) {
        if (this.visitedArea[y]) {
            return this.visitedArea[y][x];
        } else {
            return false;
        }
    };
    this.setVisited = function(x, y) {
        var visited = this.visitedArea;
        if (!visited[y]) {
            visited[y] = [];
        }
        visited[y][x] = true;
    };
    this.removeVisited = function(x, y) {
        var visited = this.visitedArea;
        if (!visited[y]) {
            delete visited[y];
        } else if (visited[y][x]) {
            delete visited[y][x];
        }
    };
    this.copyCells = function() {
        var cell = this.getCell();
        var originCell = this.originCell;
        var xMove = cell.x - originCell.x;
        var yMove = cell.y - originCell.y;
        var markedArea = Map.marked;
        var j = 0;
        var tempArea = this.tempArea;
        for (var i = 0; i < markedArea.length; i++) {
            var x = markedArea[i][0];
            var y = markedArea[i][1];
            while (!tempArea[j].sign) {
                j++;
            }
            if (!this.tempIsEmpty(j)) {
                var layerCell = Map.currentLayer.createCell(x, y);
                if (Map.currentLayer.name == 'SHADOW') {
                    layerCell.level = tempArea[i].level;
                } else {
                    layerCell.text = tempArea[i].text;
                    layerCell.foreColor = tempArea[i].foreColor;
                    layerCell.backColor = tempArea[i].backColor;
                }
                Map.refreshCell(x, y);
            } 
            j++;
        }
    };
    this.clearCells = function() {
        if (Map.currentLayer.visible) {
            for (var i = 0; i < this.tempArea.length; i++) {
                var x = this.tempArea[i].x;
                var y = this.tempArea[i].y;
                Map.currentLayer.deleteCell(x, y);
                Map.refreshCell(x, y);
            }
        }
    };
    this.moveCells = function() {
        this.clearCells();
        this.copyCells();
    };
    this.moveMasked = function() {
        var cell = this.getCell();
        var xMove = cell.x - this.originCell.x;
        var yMove = cell.y - this.originCell.y;
        var area = [];
        for (var i = 0; i < this.tempArea.length; i++) {
            if (this.tempArea[i].x + xMove >= 0 && this.tempArea[i].y + yMove >= 0) {
                area.push([this.tempArea[i].x + xMove, this.tempArea[i].y + yMove]);
            }
        }
        Map.clearCellStatus('masked');
        Map.setCellStatus('masked', area);
    };
    this.tempIsEmpty = function(i) {
        return this.tempArea[i].empty;
    };
}

function Select() {
    this.move = false;
    SelectTool.call(this);
    this.markArea = function(e) {
        var cell = this.getCell();
        var tempArea = this.tempArea;
        if (Map.mouseKey == 'mouseDown') {
            if (e.shiftKey){
                this.area = [];
                this.area = this.squareArea();
                Map.setCellStatus('marked', this.area);
            } else if (this.move == true) {
                var originCell = this.originCell;
                var xMove = cell.x - originCell.x;
                var yMove = cell.y - originCell.y;
                this.area = [];
                for (var i = 0; i < this.tempArea.length; i++) {
                    if (tempArea[i].x + xMove >= 0 && tempArea[i].y + yMove >= 0) {
                        this.area.push([tempArea[i].x + xMove, this.tempArea[i].y + yMove]);
                        this.tempArea[i].sign = true;
                    } else {
                        this.tempArea[i].sign = false;
                    }
                }
                Map.setCellStatus('marked', this.area);
            } else {
                this.area = [];
                this.area = this.squareArea();
                Map.setCellStatus('marked', this.area);
            }
        }
    };//
    this.squareArea = function() {
        var area = [];
        var x1 = this.originCell.x < this.getCell().x ? this.originCell.x : this.getCell().x;
        var x2 = this.originCell.x > this.getCell().x ? this.originCell.x : this.getCell().x;
        var y1 = this.originCell.y < this.getCell().y ? this.originCell.y : this.getCell().y;
        var y2 = this.originCell.y > this.getCell().y ? this.originCell.y : this.getCell().y;
        for (var y = y1; y <= y2; y++) {
            for (var x = x1; x <= x2; x++) {
                area.push([x, y]);
            }
        }
        return area;
    };
    this.selectRemoveCells = function(e) {
        if (e.shiftKey) {
            this.removeCells();
        } else if (e.ctrlKey) {
            this.selectCells();
        } else {
            Map.clearCellStatus('masked');
            this.selectCells();
        }
    };
    this.selectCells = function() {
        for (var i = 0; i < Map.marked.length; i++) {
            this.setVisited(Map.marked[i][0], Map.marked[i][1]);
        }
        Map.setCellStatus('masked', this.area);
    };
    this.removeCells = function() {
        var area = this.area;
        for (var i = 0; i < area.length; i++) {
            var x = area[i][0];
            var y = area[i][1];
            this.removeVisited(x, y);
            Map.removeCellStatus(x, y, 'masked');
        }
    };
    this.selectSimilarCells = function() {
        this.area = [];
        this.visitedArea = [];
        var cell = this.getCell();
        this.area = this.searchSimilar(this.area, cell);
        this.selectCells();
    };
    this.removeAll = function() {
        this.visitedArea = [];
        Map.clearCellStatus('masked');
    };
    this.mouseDown = function(e) {
        if (e.altKey) {
            this.selectSimilarCells();
        } else {
            if (this.getCell().masked) {
                this.move = true;
            }
            this.setOrigin();
            this.markArea(e);
        }
    };
    this.mouseOver = function(e){
        this.removeMarkArea();
        this.markArea(e);
    };
    this.mouseUp = function(e) {
        if (e.shiftKey) {
            this.removeCells()
        } else if (this.move) {
            if (e.ctrlKey) {
                this.copyCells();
            } else {
                this.moveCells();
            }
            this.moveMasked();
            this.move = false;
        } else {
            if (e.ctrlKey) {
                this.selectCells();
            } else {
                this.removeAll();
                this.selectCells();
            }
        }
    };
    this.doubleClick = function() {
        this.removeAll();
        this.removeMarkArea();
    }
}

function Move() {
    this.masked = false;
    SelectTool.call(this);
    this.markArea = function (e) {
        if (Map.mouseKey == 'mouseUp') {
            var cell = this.getCell();
            if (!cell.masked && !cell.isEmpty()) {
                this.area = [];
                this.visitedArea = [];
                this.area = this.searchSimilar(this.area, cell);
                Map.setCellStatus('marked', this.area);
            }
        } else if (Map.mouseKey == 'mouseDown') {
            var cell = this.getCell();
            var originCell = this.originCell;
            var xMove = cell.x - originCell.x;
            var yMove = cell.y - originCell.y;
            this.area = [];
            for (var i = 0; i < this.tempArea.length; i++) {
                if (this.tempArea[i].x + xMove >= 0 && this.tempArea[i].y + yMove >= 0) {
                    this.area.push([this.tempArea[i].x + xMove, this.tempArea[i].y + yMove]);
                    this.tempArea[i].sign = true;
                } else {
                    this.tempArea[i].sign = false;
                }
            }
            Map.setCellStatus('marked', this.area);
        }
    };
    this.setOrigin = function() {
        this.originCell = this.getCell();
        this.tempArea = [];
        var temp = this.tempArea;
        if (this.originCell.masked) {
            var cells = Map.masked;
            this.masked = true;
        } else {
            cells = Map.marked;
        }
        for (var i = 0; i < cells.length; i++) {
            var x = cells[i][0];
            var y = cells[i][1];
            var cell = Map.currentLayer.getCell(x, y);
            if (!cell) {
                this.tempArea.push({x: x, y: y, sign: true, empty: true})
            } else {
                if (Map.currentLayer.name != 'SHADOW') {
                    this.tempArea.push({x: x, y: y, sign: true, text: cell.text, foreColor: cell.foreColor, backColor:cell.backColor});
                }
            }
        }
    };
    this.copyCells = function() {
        var cell = this.getCell();
        var originCell = this.originCell;
        var xMove = cell.x - originCell.x;
        var yMove = cell.y - originCell.y;
        var markedArea = Map.marked;
        var j = 0;
        var tempArea = this.tempArea;
        for (var i = 0; i < markedArea.length; i++) {
            var x = markedArea[i][0];
            var y = markedArea[i][1];
            while (!tempArea[j].sign) {
                j++;
            }
            if (this.tempIsEmpty(j)) {
                Map.currentLayer.deleteCell(x, y);
            } else {
                var layerCell = Map.currentLayer.createCell(x, y);
                if (Map.currentLayer.name == 'SHADOW') {
                    layerCell.level = tempArea[i].level;
                } else {
                    layerCell.text = tempArea[i].text;
                    layerCell.foreColor = tempArea[i].foreColor;
                    layerCell.backColor = tempArea[i].backColor;
                }
                Map.refreshCell(x, y);
            }
            j++;
        }
    };
    this.mouseDown = function(e) {
        this.setOrigin();
        this.markArea(e);
    };
    this.mouseOver = function(e) {
        this.removeMarkArea();
        this.markArea(e);
    };
    this.mouseUp = function(e) {
        if (e.ctrlKey) {
            this.copyCells();
        } else {
            this.moveCells();
        }
        if (this.masked) {
            this.moveMasked();
            this.masked = false;
        }
    }
}