<?php
$type = $_POST['type'];
switch ($type) {
    case 'save':
        $name = $_POST['name'];
        $code = $_POST['code'];
        $code = $code;
        $file = fopen($name . '.mapdata', 'w');
        fwrite($file, $code);
        fclose($file);
        break;
    case 'load':
        $name = $_POST['name'];
        $file = fopen($name . '.mapdata', 'r');
        $code = fgets($file);
        fclose($file);
        echo $code;
}
?>

