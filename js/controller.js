/**
 * Created by Garrise on 2016/3/8.
 */
$(document).bind("selectstart", function(){return false});
$(document).ready(function(){
    /*  Initializing Process  */
    // Initializing Map
    var mapWidth = 60;
    var mapHeight = 40;
    var cellSide = '40px';
    Map.createMap(mapWidth, mapHeight, cellSide);
    // Initializing Layer
    Map.addLayer(new ShadowLayer('阴影层'), 0);
    Map.addLayer(new Layer('图层1'), 1);
    Map.addLayer(new Layer('图层2'), 2);
    Map.addLayer(new Layer('图层3'), 3);
    var $layer = $('#layer');
    selectLayer($layer.children('div').eq(1));
    /* Td Control */
    var td = '#map td';
    $('#map').on("mouseover", 'td', function(e){
        ToolBox[Map.currentTool].td = $(this);
        ToolBox[Map.currentTool].mouseOver(e);
        $('#currentBackColor').css("background-color", $(this).css("background-color"));
        $('#currentForeColor').css("background-color", $(this).css("color"));
        var x = $(this).index() + 1;
        var y = $(this).parent().index() + 1;
        var $hint = $('#hint');
        $('#currentCoordinate').text("X=" + x + " Y=" + y);
        switch (Map.currentTool) {
            case 'drawer':
                $hint.text('左键：绘制背景，ctrl：绘制文字，shift：绘制背景与文字，按下Enter修改文字');
                break;
            case 'eraser':
                $hint.text('左键：擦除');
                break;
            case 'effect':
                $hint.text('目前尚未有操作功能');
                break;
            case 'select':
                $hint.text('左键：选择，shift：反选，ctrl：复选，alt：近似全选');
                break;
            case 'move':
                $hint.text('左键：移动，ctrl：复制');
                break;
        }
    }).on('mousedown', 'td', function(e){
        Map.mouseKey = 'mouseDown';
        ToolBox[Map.currentTool].mouseDown(e);
    }).on('mouseup', function(e){
        Map.mouseKey = 'mouseUp';
        ToolBox[Map.currentTool].mouseUp(e);
    }).on('dblclick', 'td', function(){
        ToolBox[Map.currentTool].doubleClick();
    });
    /* Key Control */
    $(document).keydown(function(e){
        var input = $('#inputCharacter');
        if (e.keyCode == 13) {
            if (input.css("display") == 'none') {
                input.css("display", 'block');
                input.trigger('select');
            } else {
                var char = input.val();
                ToolBox.character.setCharacter(char);
                $('#character').find('span').text(char);
                input.css("display", 'none');
            }
        }
        if (e.keyCode == 81) {
            if (Map.currentTool == 'select') {
                ToolBox.select.removeAll();
            }
        }
    });
    /* Map Zooming*/
    $('#zoomOut').click(function(){
        Map.zoom('out');
    });
    $('#zoomIn').click(function(){
        Map.zoom('in');
    });
    /* SelectBar Control */
    //Select
    $('#selectTool').hover(function(){
        $('#hint').text('选择工具：选择格子进行编辑');
    }).click(function(){
        Map.currentTool = 'select';
        $('.selectedTool').removeClass('selectedTool');
        $(this).addClass('selectedTool');
    });

    //Move
    $('#moveTool').hover(function(){
        $('#hint').text('移动工具：移动选定格子或近似格子');
    }).click(function(){
        Map.currentTool = 'move';
        $('.selectedTool').removeClass('selectedTool');
        $(this).addClass('selectedTool');
    });

    /* ToolBar Control */

    // Drawer
    $('#drawer').hover(function(){
        $('#hint').text('绘图工具：绘制地图格子背景与文字');
    }).click(function(){
        Map.currentTool = 'drawer';
        $('.selectedTool').removeClass('selectedTool');
        $(this).addClass('selectedTool');
    });

    // Eraser
    $('#eraser').hover(function(){
        $('#hint').text('橡皮擦工具：擦除地图格子');
    }).click(function(){
        Map.currentTool = 'eraser';
        $('.selectedTool').removeClass('selectedTool');
        $(this).addClass('selectedTool');
    });

    // Color
    $('#color').hover(function(){
        $('#colorMenu').css("display", 'block');
        $('#hint').text('调色板：修改绘制的背景与文字颜色；左键选择背景色，ctrl+左键选择文字色');
    }, function(){
        $('#colorMenu').css("display", 'none');
    });
    $('#colorMenu').find('td').click(function(e){
        var color = $(this).css("background-color");
        if (e.ctrlKey) {
            ToolBox.color.setColor('Fore', color);
            $('#color').css("color", Map.currentForeColor)
        } else {
            ToolBox.color.setColor('Back', color);
            $('#color').css("background-color", Map.currentBackColor);
        }
    });

    // Character
    $('#character').hover(function(){
        $('#hint').text('文字：修改绘制的文字；也可按下Enter修改');
    }).click(function(){
        $('#inputCharacter').css("display", 'block').trigger('select');
    });
    $('#inputCharacter').blur(function(){
        var char = $(this).val();
        ToolBox.character.setCharacter(char);
        $('#character').find('span').text(char);
        $(this).css("display", 'none');
    });

    //Tool Size
    $('#toolSize').hover(function(){
        $('#toolSizeMenu').css("display", "block");
        $('#hint').text('工具大小：分别是1x1，3x3，5x5');
    }, function(){
        $('#toolSizeMenu').css("display", "none");
    });
    $('#toolSizeMenu').find('td').click(function(){
        var size = $(this).attr('id');
        if (Map.currentTool == 'drawer' || Map.currentTool == 'eraser') {
            switch (size) {
                case 'small':
                    ToolBox[Map.currentTool].size = 1;
                    break;
                case 'middle':
                    ToolBox[Map.currentTool].size = 2;
                    break;
                case 'large':
                    ToolBox[Map.currentTool].size = 3;
                    break;
            }
        }
    });

    //Effect
    $('#effect').hover(function(){
        $('#hint').text('查看效果区域');
    }).click(function(){
        Map.currentTool = 'effect';
        $('.selectedTool').removeClass('selectedTool');
        $(this).addClass('selectedTool');
    });

    // Shape
    $('#shape').hover(function(){
        $('#effectShape').css('display', 'block');
        $('#hint').text('修改效果区域形状');
    }, function(){
        $('#effectShape').css('display', 'none');
    });
    $('#effectShape').on('click', 'td', function(){
        var type = $(this).attr('id');
        var $selectedShape = $('.selectedShape');
        var $effectSize = $('#effectSize');
        var size = 0;
        if (Map.currentTool == 'effect') {
            switch (type) {
                case 'cone':
                    ToolBox.effect.shape = 1;
                    $selectedShape.removeClass('selectedShape');
                    $(this).addClass('selectedShape');
                    break;
                case 'circle':
                    ToolBox.effect.shape = 0;
                    $selectedShape.removeClass('selectedShape');
                    $(this).addClass('selectedShape');
                    break;
                case 'top':
                    ToolBox.effect.rotate = 0;
                    $selectedShape.removeClass('selectedRotate');
                    $(this).addClass('selectedRotate');
                    break;
                case 'rightTop':
                    ToolBox.effect.rotate = 1;
                    $selectedShape.removeClass('selectedRotate');
                    $(this).addClass('selectedRotate');
                    break;
                case 'right':
                    ToolBox.effect.rotate = 2;
                    $selectedShape.removeClass('selectedRotate');
                    $(this).addClass('selectedRotate');
                    break;
                case 'rightBottom':
                    ToolBox.effect.rotate = 3;
                    $selectedShape.removeClass('selectedRotate');
                    $(this).addClass('selectedRotate');
                    break;
                case 'bottom':
                    ToolBox.effect.rotate = 4;
                    $selectedShape.removeClass('selectedRotate');
                    $(this).addClass('selectedRotate');
                    break;
                case 'leftBottom':
                    ToolBox.effect.rotate = 5;
                    $selectedShape.removeClass('selectedRotate');
                    $(this).addClass('selectedRotate');
                    break;
                case 'left':
                    ToolBox.effect.rotate = 6;
                    $selectedShape.removeClass('selectedRotate');
                    $(this).addClass('selectedRotate');
                    break;
                case 'leftTop':
                    ToolBox.effect.rotate = 7;
                    $('.selectedRotate').removeClass('selectedRotate');
                    $(this).addClass('selectedRotate');
                    break;
                case 'smaller':
                    if (ToolBox.effect.size == 1) {
                        alert("至少需要5尺！");
                    } else {
                        ToolBox.effect.size -= 1;
                    }
                    size = (ToolBox.effect.size * 5).toString();
                    $effectSize.find('span').text(size);
                    break;
                case 'larger':
                    ToolBox.effect.size += 1;
                    size = (ToolBox.effect.size * 5).toString();
                    $effectSize.find('span').text(size);
                    break;
            }
        }
    });

    /* Layer */
    $layer.on('click', 'div', function() {
        var div = $(this);
        selectLayer(div);
    }).on('dblclick', 'div', function() {
        var div = $(this);
        hideOrRevealLayer(div);
    });
    $('#addLayer').click(function(){
        var name = prompt("请输入新图层名：");
        var index = Map.layers.indexOf(Map.currentLayer);
        Map.addLayer(new Layer(name), index + 1);
    });
    $('#removeLayer').click(function(){
        Map.removeLayer(Map.currentLayer);
        Map.refresh();
    });
    $('#upLayer').click(function(){
        var index = Map.layers.indexOf(Map.currentLayer);
        if (index == 0) {
            return;
        }
        var div = $('#layer');
        var up = div.children().eq(index - 1);
        div.children().eq(index).after(up);
        Map.layers[index] = Map.layers[index - 1];
        Map.layers[index - 1] = Map.currentLayer;
        Map.refresh();
    });
    $('#downLayer').click(function(){
        var index = Map.layers.indexOf(Map.currentLayer);
        var div = $('#layer');
        var len = div.children().length;
        if (index == len - 1) {
            return;
        }
        var up = div.children().eq(index + 1);
        div.children().eq(index).before(up);
        Map.layers[index] = Map.layers[index + 1];
        Map.layers[index + 1] = Map.currentLayer;
        Map.refresh();
    });
    //Save
    $('#save').click(function(){
        $('#window').css('display', 'table');
        $('#win_saveLoad').css('display', 'block');
    });
    $('#saveButton').click(function(){
        SaveAndLoad.save();
        var json = '';
        json = Code.getJSON(json, SaveData);
        JsonData = json;
        var base64 = Code.encode(json);
        var name = $('#saveName').val();
        $.ajax({
            type: 'POST',
            url: getRootPath() + "php/saveLoad.php",
            data: {
                name: name,
                code: base64,
                type: 'save'
            },
            dataType: 'text',
            success: function(){
                $('#win_saveLoad').css('display', 'none');
                $('#window').css('display', 'none');
                alert("已保存！" );
            },
            error: function() {
                $('#win_saveLoad').css('display', 'none');
                $('#window').css('display', 'none');
                alert("保存失败！" );
            }
        });
    });
    //Load
    $('#loadButton').click(function(){
        var name = $('#loadName').val();
        $.ajax({
            type: 'POST',
            url: getRootPath() + "php/saveLoad.php",
            data: {
                name: name,
                type: 'load'
            },
            dataType: 'html',
            success: function(data) {
                $('#win_saveLoad').css('display', 'none');
                $('#window').css('display', 'none');
                var json = Code.decode(data);
                SaveAndLoad.loadJSON(json);
                SaveAndLoad.load();
                alert("已读取！" );
            },
            error: function() {
                $('#win_saveLoad').css('display', 'none');
                $('#window').css('display', 'none');
                alert("读取失败！" );
            }
        });
    });
});
var selectLayer = function(div) {
    if (div.attr('class') == 'layer') {
        $('.selectedLayer').removeClass().addClass('layer');
        $('.invisibleSelectedLayer').removeClass().addClass('invisibleLayer');
        div.addClass('selectedLayer');
        Map.currentLayer = Map.layers[div.index()];
    }
    if (div.attr('class') == 'invisibleLayer') {
        $('.selectedLayer').removeClass().addClass('layer');
        $('.invisibleSelectedLayer').removeClass().addClass('invisibleLayer');
        $(this).removeClass().addClass('invisibleSelectedLayer');
        Map.currentLayer = Map.layers[div.index()];
    }
};
var hideOrRevealLayer = function(div) {
    var index = div.index();
    if (Map.layers[index].visible) {
        Map.layers[index].visible = false;
        div.removeClass().addClass('invisibleSelectedLayer');
        Map.currentLayer = Map.layers[index];
    } else {
        Map.layers[index].visible = true;
        div.removeClass().addClass('selectedLayer');
        Map.currentLayer = Map.layers[index];
    }
    Map.refresh();
};
function getRootPath()
{
    var pathName = window.location.pathname.substring(1);
    var webName = pathName == '' ? '' : pathName.substring(0, pathName.indexOf('/'));
    return window.location.protocol + '//' + window.location.host + '/'+ webName + '/';
}