<?php
require_once 'global.php';
require_once ROOTDIR.'style/head.php';
?>
<div>
	<div class="lpan">
		<div class="lpan_usr z_1">
			<div class="lpan_usr_avt"><img src="images/avatar.jpg"/></div>
			<div class="lpan_usr_nm">Станислав</div>
			<div class="lpan_usr_st">разработчик</div>
			<hr>
			<div class="lpan_usr_s">
				<div class="lpan_usr_s_sb"><?=count_subscribles();?></div>
				<div class="lpan_usr_s_ps"><?=count_posts();?></div>
			</div>
			<div class="clear"></div>
			<hr>
			<div class="lpan_usr_subs z_1" id="gSbs">Подписаться</div>
		</div>
		
	</div>
	<div class="page" id="pge">

	</div>
</div>

<?php
require_once ROOTDIR.'style/foot.php';
if(isset($_GET['abt'])) 
	echo '<script>g_abt();</script>';
elseif(isset($_GET['mt'])) 
	echo '<script>g_mt('.$_GET['mt'].');</script>';
elseif(isset($_GET['ind'])) 
	echo '<script>g_ind();</script>';
else 
	echo '<script>g_ind();</script>';
?>