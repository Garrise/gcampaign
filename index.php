<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Garrise's Campaign Designer</title>
    <link rel="stylesheet" type="text/css" href="style.css"/>
    <script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js"></script>
    <script type="text/javascript" src="model.js"></script>
    <script type="text/javascript" src="tool.js"></script>
    <script type="text/javascript" src="controller.js"></script>
    <script type="text/javascript" src="saveLoad.js"></script>
</head>
<body>
    <div id="dTop">
        <div id="fileManager" class="toolBar">
            <table>
                <tr>
                    <td id="save" class="tool">存</td>
                    <td id="load" class="tool">读</td>
                </tr>
            </table>
        </div>
    </div>
    <div id="dCenter">
        <div id="palette" class="toolBar">
            <table id="toolBox">
                <tr>
                    <td id="drawer" class="tool"><span>画</span></td>
                    <td id="eraser" class="tool"><span>擦</span></td>
                    <td id="effect" class="tool"><span>效</span></td>
                </tr>
                <tr>
                    <td id="character" class="tool"><span></span>
                        <input id="inputCharacter" type="text" />
                    </td>
                    <td id="color" class="tool"><span>色</span>
                        <table id="colorMenu" class="invisibleMenu">
                            <tr>
                                <td id="black" style="background-color: black"></td>
                                <td id="gray" style="background-color: gray"></td>
                                <td id="red" style="background-color: red"></td>
                                <td id="orange" style="background-color: orange"></td>
                                <td id="yellow" style="background-color: yellow"></td>
                            </tr>
                            <tr>
                                <td id="green" style="background-color: green"></td>
                                <td id="blue" style="background-color: blue"></td>
                                <td id="violet" style="background-color: violet"></td>
                                <td id="purple" style="background-color: purple"></td>
                                <td id="white" style="background-color: white"></td>
                            </tr>
                        </table>
                    </td>
                    <td id="shape" class="tool"><span>形</span>
                        
                    </td>
                </tr>
            </table>
        </div>
        <div id="field">
            <div id="mapField">
                <table id="map"></table>
            </div>
            <div id="textField"></div>
            <div id="textInput">
                <input type="text" />
            </div>
        </div>
        <div id="manager" class="toolBar">
            <table id="layerBox">
                <tr>
                    <td id="addLayer" class="tool">加</td>
                    <td id="removeLayer" class="tool">删</td>
                    <td id="upLayer" class="tool">上</td>
                    <td id="downLayer" class="tool">下</td>
                </tr>
            </table>
            <div id="layer">
            </div>
        </div>
    </div>
    <div id="dBottom">
        <table id="statusViewer" class="toolBar">
            <tr>
                <td id="hint" colspan="3"></td>
            </tr>
            <tr>
                <td id="currentBackColor">
                    <div id="currentForeColor"></div>
                </td>
                <td id="currentCoordinate"></td>
                <td id="status"></td>
            </tr>
        </table>
    </div>
</body>
</html>