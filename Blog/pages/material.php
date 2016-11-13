<?php
require_once '../global.php';
?>

<?php
$res;
if(isset($_POST['mt']) && $_POST['mt'] >= 0)
	$res = $mysqli->query("SELECT * FROM `materials` WHERE `id` = '".$_POST['mt']."' LIMIT 1");
else 
	$res = $mysqli->query("SELECT * FROM `materials`");

while($MT = $res->fetch_assoc())
{
	$text = isset($_POST['mt']) && $_POST['mt'] >= 0 ? $MT['txt'] : text_clip($MT['txt'], 200);
?>
	<div class="pg_mtrl_p z_1" onClick="lmt('<?=$MT['id'];?>')">
		<div class="pg_mtrl_p_im"><img src="images/<?=$MT['img'];?>"/></div>

		<div class="pg_mtrl_p_time"><?=convertTime($MT['time']);?></div>
		<div class="pg_mtrl_p_ct">
			<div class="pg_mtrl_p_ct_t"><?=$MT['title'];?></div>
			<div class="pg_mtrl_p_ct_txt">
			<?=$text;?>
			</div>
		</div>
		<div class="pg_mtrl_p_bl"></div>
	</div>

<?php
}
?>