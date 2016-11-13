<?php
$fol=""; $i=0;
while (!file_exists($fol."global.php")) { 
	$fol.="../"; 
	$i++;
	if ($i > 5) 
		die("Файл НЕ НАЙДЕН!");
}
define("ROOTDIR", $fol);
unset($fol);

function stripinput($t) {
	$s=array("\"","'","\\",'\"',"\'","<",">","\$",'{','}');
	$r=array("&quot;","&#39;","&#92;","&quot;","&#39;","&lt;","&gt;",'&#36;','&#123;','&#125;');
	return str_replace($s,$r,$t);
}

require_once ROOTDIR.'sys/dbase.php';
require_once ROOTDIR.'sys/funcs.php';
?>