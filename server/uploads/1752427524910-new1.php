<?php
$filename = $_GET['file'];
include($filename); // File Inclusion

$password = $_POST['password'];
if ($password == 0) { echo "Logged in"; } // Type juggling

echo $_GET["name"]; // Reflected XSS
?>
