<?php
global $mysqli;
$mysqli = new mysqli('localhost', 'root', '', 'mblog');
if ($mysqli->connect_error) 
	die('Connect Error (' .$mysqli->connect_errno. ') '.$mysqli->connect_error);

?>