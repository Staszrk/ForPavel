<?php
require_once '../global.php';

if(isset($_GET['subs']) && !empty($_POST['em']) && !empty($_POST['nm']))
{
	global $mysqli;
	$query = "INSERT INTO `users` (email, name) VALUES('".stripinput($_POST['em'])."', '".stripinput($_POST['nm'])."')";
	if($res = $mysqli->query($query))
	  echo 'true';
	else 
	  echo 'false';
}

?>