/**
 * Created by Garrise on 2016/3/22.
 */
/**
 * Created by Garrise on 2016/3/15.
 */
/* save Map and Layer data as JSON and encode via base64
 Use save model SaveData, LayerData and CellData
 */
SaveData = {
    name: '',
    width: undefined,
    height: undefined,
    layers: []
};

function LayerData(name) {
    this.name = name;
    this.cells = [];
    this.visible = true;
}

function CellData(text, foreColor, backColor) {
    this.text = text;
    this.foreColor = foreColor;
    this.backColor = backColor;
}

function ShadowCellData(level) {
    this.level = level;
}

var JsonData = '';

SaveAndLoad = {
    save: function() {
        SaveData.name = Map.name;
        SaveData.width = Map.width;
        SaveData.height = Map.height;
        for (var i = 0; i < Map.layers.length; i++) {
            SaveData.layers[i] = new LayerData(Map.layers[i].name);
            this.saveLayer(SaveData.layers[i], Map.layers[i]);
        }
    },
    saveLayer: function(layerData, layer) {
        layerData.visible = layer.visible;
        var cells = layer.cells;
        var row = layer.cells.length;
        for (var y = 0; y < row; y++) {
            if (cells[y]) {
                if (!layerData.cells[y]) {
                    layerData.cells[y] = [];
                }
                for (var x = 0; x < cells[y].length; x++) {
                    if (cells[y][x]) {
                        if (layer.name == 'SHADOW') {
                            layerData.cells[y][x] = new ShadowCellData(cells[y][x].level);
                        } else {
                            layerData.cells[y][x] = new CellData(cells[y][x].text, cells[y][x].foreColor, cells[y][x].backColor);
                        }
                    }
                }
            }
        }
    },
    saveCell: function(cellData, cell) {
        cellData.text = cell.text;
        cellData.foreColor = cell.foreColor;
        cellData.backColor = cell.backColor;
    },
    load: function() {
        $('#map').empty();
        $('#layer').empty();
        Map.layers = [];
        Map.cells = [];
        Map.marked = [];
        Map.masked = [];
        Map.name = SaveData.name;
        Map.width = SaveData.width;
        Map.height = SaveData.height;
        Map.createMap(Map.width, Map.height, Map.cellSide);
        for (var i = 0; i < SaveData.layers.length; i++) {
            if (SaveData.layers[i].name == 'SHADOW') {
                Map.addLayer(new ShadowLayer(SaveData.layers[i].name), i);
            } else {
                Map.addLayer(new Layer(SaveData.layers[i].name), i);
            }
            var cells = SaveData.layers[i].cells;
            for (var y = 0; y < cells.length; y++) {
                if (cells[y]) {
                    for (var x = 0; x < cells[y].length; x++) {
                        if (cells[y][x]) {
                            if (SaveData.layers[i].name == 'SHADOW') {
                                Map.layers[i].createCell(x, y).level = cells[y][x].level;
                            } else {
                                Map.layers[i].createCell(x, y).text = cells[y][x].text;
                                Map.layers[i].createCell(x, y).foreColor = cells[y][x].foreColor;
                                Map.layers[i].createCell(x, y).backColor = cells[y][x].backColor;
                            }
                        }
                    }
                }
            }
        }
        var layer = $('#layer').children('div').eq(1);
        selectLayer(layer);
        Map.refresh();
    },
    loadJSON: function(json) {
        var loadData = eval('(' + json + ')');
        SaveData.name = loadData.name;
        SaveData.width = loadData.width;
        SaveData.height = loadData.height;
        SaveData.layers = [];
        var layerLength = loadData.layers.length;
        for (var i = 0; i < layerLength; i++) {
            SaveData.layers[i] = new LayerData(loadData.layers[i].name);
            this.saveLayer(SaveData.layers[i], loadData.layers[i]);
        }
    }
};

Code = {
    // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = this._utf8_encode(input);

        while (i < input.length) {

            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
                this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);

        }

        return output;
    },

    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        while (i < input.length) {

            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

        }

        output = this._utf8_decode(output);

        return output;

    },

    // private method for UTF-8 encoding
    _utf8_encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    },

    // private method for UTF-8 decoding
    _utf8_decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = 0, c1 = 0, c2 = 0, c3;

        while ( i < utftext.length ) {

            c = utftext.charCodeAt(i);

            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            }
            else if((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i+1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            }
            else {
                c2 = utftext.charCodeAt(i+1);
                c3 = utftext.charCodeAt(i+2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }

        }

        return string;
    },
    getJSON: function(json, object) {
        var json = '';
        var type = '';//0: none, 1: object, 2:array
        if (object == undefined) {
            type = 'undefined';
        }else if (object.constructor.toString() == 'function Array() { [native code] }') {
            type = 'array';
        } else if(typeof object == 'object') {
            type = 'object';
        } else if (typeof object == 'number') {
            type = 'number';
        } else {
            type = 'string';
        }
        switch(type) {
            case 'object':
                json += '{';
                for (var i in object) {
                    if (object.hasOwnProperty(i)) {
                        json += '"' + i + '"' + ':' + this.getJSON(json, object[i]) + ',';
                    }
                }
                json = json.substring(0, json.length - 1);
                json += '}';
                break;
            case 'array':
                json += '[';
                for (i = 0; i < object.length; i++) {
                    json += this.getJSON(json, object[i]) + ',';
                }
                if (object.length > 0){
                    json = json.substring(0, json.length - 1);
                }
                json += ']';
                break;
            case 'undefined':
                json = 'undefined';
                break;
            case 'string':
                json = '"' + object + '"';
                break;
            default:
                json = object;

        }
        return json;
    }
};