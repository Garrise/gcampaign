/**
 * Created by Garrise on 2016/3/8.
 */
$(document).bind("selectstart", function(){return false});
$(document).ready(function(){
    /*  Initializing Process  */
    // Initializing Map
    var mapWidth = 60;
    var mapHeight = 40;
    var cellSide = '20px';
    Map.createMap(mapWidth, mapHeight, cellSide);
    // Initializing Layer
    Map.addLayer(new Layer('图层1'), 0);
    Map.addLayer(new Layer('图层2'), 1);
    Map.addLayer(new Layer('图层3'), 2);
    var layer = $('#layer div:first');
    selectLayer(layer);
    /* Td Hover */
    var td = '#map td';
    $('#map').on('mouseover', 'td', function(){
        ToolBox[Map.currentTool].td = $(this);
        ToolBox[Map.currentTool].removeMarkArea('marked');
        ToolBox[Map.currentTool].markArea('marked');
        $('#currentBackColor').css("background-color", $(this).css("background-color"));
        $('#currentForeColor').css("background-color", $(this).css("color"));
        var x = $(this).index() + 1;
        var y = $(this).parent().index() + 1;
        $('#currentCoordinate').text("X=" + x + " Y=" + y);
    });

    /* Td Control */
    var mouseKey = 'mouseUp'; // mouseKey = 'mouseUp' or 'mouseDown'
    $('#map').on('mousedown', 'td', function(e){
        mouseKey = 'mouseDown';
        control(e);
    });
    $('#map').on('mouseover', 'td', function(e){
        if (mouseKey == 'mouseDown') {
            control(e);
        }
    });
    $(document).on('mouseup', function(){
        mouseKey = 'mouseUp';
    });
    var control = function(e) {
        switch (Map.currentTool) {
            case 'Drawer':
                ToolBox.Drawer.drawArea(e);
                break;
            case 'Eraser':
                ToolBox.Eraser.eraseArea();
                break;
        }
    };

    /* ToolBar Control */

    // Drawer
    $('#drawer').click(function(){
        Map.currentTool = 'Drawer';
    });

    // Eraser
    $('#eraser').click(function(){
        Map.currentTool = 'Eraser';
    });

    // Color
    $('#color').hover(function(){
        $('#colorMenu').css("display", 'block');
    }, function(){
        $('#colorMenu').css("display", 'none');
    });
    $('#colorMenu').find('td').click(function(e){
        var color = $(this).css("background-color");
        if (e.ctrlKey) {
            ToolBox.Color.setColor('Fore', color);
            $('#color').css("color", Map.currentForeColor)
        } else {
            ToolBox.Color.setColor('Back', color);
            $('#color').css("background-color", Map.currentBackColor);
        }
    });

    // Character
    var input = $('#inputCharacter');
    $('#character').click(function(){
        input.css("display", 'block');
        input.trigger('select');
    });
    $('#character').keydown(function(e){
        if (e.keyCode == 13) {
            if (input.css("display") == 'none') {
                input.css("display", 'block');
                input.trigger('select');
            } else {
                var char = input.val();
                ToolBox.Character.setCharacter(char);
                $('#character').find('span').text(char);
                input.css("display", 'none');
            }
        }
    });
    input.blur(function(){
        var char = input.val();
        ToolBox.Character.setCharacter(char);
        $('#character').find('span').text(char);
        input.css("display", 'none');
    });
    //Effect
    $('#effect').click(function(){
        Map.currentTool = 'Effect';
    });
    // Shape
    $('#shape').click(function(){
        var tool = ToolBox.Effect;
        if (tool.rotate < tool.rotateList.length - 1) {
            tool.rotate++;
        } else {
            tool.rotate = 0;
        }
    });

    /* Layer */
    $('#layer').on('click', 'div', function() {
        var div = $(this);
        selectLayer(div);
    });
    $('#layer').on('dblclick', 'div', function() {
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
        SaveAndLoad.save();
        var json = '';
        json = Code.getJSON(json, SaveData);
        var base64 = Code.encode(json);
        console.log(base64);
    });
    //Load
    $('#load').click(function(){
        SaveAndLoad.load();
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