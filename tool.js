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
ToolBox = {};
ToolBox.Tool = {
    size: 2, // 5feet/1
    td: $('td:last'), //Current hovered td
    area: [],
    visitedArea: [],
    /* Cell */
    getCell: function() {
        var x = this.td.index();
        var y = this.td.parent().index();
        return Map.cells[y][x];
    },
    /* Tool Area */
    markArea: function(status) {
        var area = [];
        var cell = this.getCell();
        this.initVisitedArea([cell.x, cell.y]);
        area = this.searchArea(area, cell);
        this.visitedArea = [];
        Map.setCellStatus(status, area);
        this.area = area;
    },
    removeMarkArea: function(status) {
        Map.removeCellStatus(status);
    },
    searchArea: function(area, cell) {// Direction: topCell, rightCell, bottomCell, leftCell
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
    },
    fitArea: function(target) {// Find if the given cell is in the Area from td
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
    },
    range: function(cell, target) {// Find the range between the given cells
        var xRange = Math.abs(target.x - cell.x);
        var yRange = Math.abs(target.y - cell.y);
        var shorterRange = xRange < yRange ? xRange : yRange;
        var diffRange = Math.abs(xRange - yRange);
        return Math.floor(1.5 * shorterRange + diffRange);
    },
    initVisitedArea: function(originGrid) {
        var visitedRow = [];
        for (var i = originGrid[0] - this.size; i <= originGrid[0] + this.size; i++) {
            for (var j = originGrid[1] - this.size; j <= originGrid[1] + this.size; j++) {
                visitedRow[j] = false;
            }
            this.visitedArea[i] = visitedRow;
            visitedRow = [];
        }
    }
};

ToolBox.Drawer = ToolBox.Tool;
ToolBox.Drawer.drawArea = function(e) {
    if (!Map.currentLayer.visible) {
        return;
    }
    if (e.ctrlKey) {
        for (var i = 0; i < Map.marked.length; i++) {
            var x = Map.marked[i][0];
            var y = Map.marked[i][1];
            Map.currentLayer.createCell(x, y).text = Map.currentText;
            Map.currentLayer.createCell(x, y).foreColor = Map.currentForeColor;
            Map.refreshCell(x, y);
            //Map.cells[y][x].text = Map.currentText;
            //Map.cells[y][x].foreColor = Map.currentForeColor;
            //Map.cells[y][x].drawCellText();
            //Map.cells[y][x].drawCellForeColor();
        }
    } else if (e.shiftKey) {
        for (i = 0; i < Map.marked.length; i++) {
            x = Map.marked[i][0];
            y = Map.marked[i][1];
            Map.currentLayer.createCell(x, y).text = Map.currentText;
            Map.currentLayer.createCell(x, y).foreColor = Map.currentForeColor;
            Map.currentLayer.createCell(x, y).backColor = Map.currentBackColor;
            Map.refreshCell(x, y);
            //Map.cells[y][x].text = Map.currentText;
            //Map.cells[y][x].foreColor = Map.currentForeColor;
            //Map.cells[y][x].backColor = Map.currentBackColor;
            //Map.cells[y][x].drawCellContent();
        }
    } else {
        for (i = 0; i < Map.marked.length; i++) {
            x = Map.marked[i][0];
            y = Map.marked[i][1];
            Map.currentLayer.createCell(x, y).backColor = Map.currentBackColor;
            Map.refreshCell(x, y);
            //Map.cells[y][x].backColor = Map.currentBackColor;
            //Map.cells[y][x].drawCellBackColor();
        }
    }
};

ToolBox.Eraser = ToolBox.Tool;
ToolBox.Eraser.eraseArea = function() {
    for (var i = 0; i < Map.marked.length; i++) {
        var x = Map.marked[i][0];
        var y = Map.marked[i][1];
        Map.cells[y][x].eraseCellContent();
    }
};

ToolBox.Color = {
    setColor: function(type, color) { // type= 'Back' or 'Fore'
        Map['current' + type + 'Color'] = color;
    }
};

ToolBox.Character = {
    setCharacter: function(character) {
        Map.currentText = character;
    }
};

ToolBox.Effect = {
    size: 2, // 5feet per 1
    shape: 0,
    shapeList: ['circle', 'cone'],
    rotate: 0,
    rotateList: ['top', 'right-top', 'right', 'right-bottom', 'bottom', 'left-bottom', 'left', 'left-top'],
    td: $(''), //Current hovered td
    area: [],
    visitedArea: [],
    /* Cell */
    getCell: function() {
        var x = this.td.index();
        var y = this.td.parent().index();
        return Map.cells[y][x];
    },
    /* Mark Area */
    markArea: function(status) {
        var area = [];
        area = this.searchArea(this.getCell());
        Map.setCellStatus(status, area);
        this.area = area;
    },
    removeMarkArea: function(status) {
        Map.removeCellStatus(status);
    },
    /* Search Area */
    searchArea: function(cell) {
        var area = [];
        var originGrid = [cell.x + 1, cell.y + 1];
        //var originGrid = [56, 5];
        console.log(originGrid[0]+','+originGrid[1]);
        var gridList = [];
        var visitedRow = [];
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
                    yResult - Math.floor(yResult) < prec ? yResult = Math.floor(yResult) : yResult = yResult;
                    Math.ceil(yResult) - yResult < prec ? yResult = Math.ceil(yResult) : yResult = yResult;
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
    },
    searchGrid: function(gridList, grid, originGrid) {
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
    },
    fitGrid: function(grid, originGrid) {// Search target grid with the range of size from originGrid and within shape
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
    },
    gridRange: function(grid, target) { //Find the range between the given grid
        var xRange = Math.abs(grid[0] - target[0]);
        var yRange = Math.abs(grid[1] - target[1]);
        var shorterRange = xRange < yRange ? xRange : yRange;
        var diffRange = Math.abs(xRange - yRange);
        return Math.floor(1.5 * shorterRange + diffRange);
    },
    isInCell: function(grid, cell) { //Find if a grid is in a certain cell
        var xConfirm = grid[0] > cell.x && grid[0] < cell.x + 1;
        var yConfirm = grid[1] > cell.y && grid[1] < cell.y + 1;
        return xConfirm && yConfirm;
    },
    // parameter = [k, b], means a line(y = kx + b) cross a grid, cross() function tend to find if the line cross a cell
    // parameter must be a leaned line
    isCross: function(parameter, cell) {
        var k = parameter[0];
        var b = parameter[1];
        var gridX = [cell.x, cell.x + 1];
        var gridY = [cell.y, cell.y + 1];
        var testY = [k * gridX[0] + b, k * gridX[1] + b];
        var confirm1 = testY[0] >= gridY[0] && testY[0] <= gridY[1];
        var confirm2 = testY[1] >= gridY[0] && testY[1] <= gridY[1];
        return confirm1 && confirm2;
    },
    isLeaned: function(grid1, grid2) {// Find if line between grid1 and grid2 is leaned
        return !(grid1[0] == grid2[0] || grid1[1] == grid2[1]);
    },
    getLine: function(grid1, grid2) {// Get line parameter between grid1 and grid2
        var a1 = grid1[0];
        var a2 = grid2[0];
        var b1 = grid1[1];
        var b2 = grid2[1];
        var k = (b1 - b2) / (a1 - a2);
        var b = (a1 * b2 - a2 * b1) / (a1 - a2);
        return [k, b];
    },
    coneLimit: function(rotate, grid, originGrid) {
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
    },
    selectedGrid: function(gridList, grid) {
        for (var i = 0; i < gridList.length; i++) {
            if (gridList[i].toString() == grid.toString())
                return true;
        }
        return false;
    },
    initVisitedArea: function(originGrid) {
        var visitedRow = [];
        for (var i = originGrid[0] - this.size; i <= originGrid[0] + this.size; i++) {
            for (var j = originGrid[1] - this.size; j <= originGrid[1] + this.size; j++) {
                visitedRow[j] = false;
            }
            this.visitedArea[i] = visitedRow;
            visitedRow = [];
        }
    }
};