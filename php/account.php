<?php
    $type = $_POST['type'];
    switch ($type) {
        case 'register':
            $username = $_POST['username'];
            $password = $_POST['password'];
            break;
        case 'login':
            break;
    }
?>