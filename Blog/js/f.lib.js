$("#abt").click(function(){ 
		history.pushState(null, null, "?abt");
		$("#pge").load("pages/abt.php");
		$("#bck").css("display","block");
});

$("#bck").click(function(){ 
		history.pushState(null, null, "?ind");
		$("#pge").load("pages/material.php");
		$("#bck").css("display","none");
});

$("#gSbs").click(function(){ 
	$("div.g_sb").css("display","block");
	$("div.g_sb_t").css("top","0");
	$("div.g_sb_t").css("top","-" + $("div.g_sb_t").height() - 100 + "px");
	$("div.g_sb").animate({opacity: "1"}, 300);
	$("div.g_sb_t").animate({top: "150"}, 300);
});
$("div.g_sb_cncl").click(function(){ 
	$("div.g_sb_t").animate({
		top: "-" + $("div.g_sb_t").height() - 100 + "px"
	}, 300);
	$("div.g_sb").animate(
		{
			opacity: "0"
		}, 
		300, 
		function() { 
			$("div.g_sb").css("display","none");
		}
	);
});

function g_ind() { 
	$("#pge").load("pages/material.php"); 
	$("#bck").css("display","none");
}
function g_abt() { 
	$("#pge").load("pages/abt.php"); 
}
function g_mt(i) { 
	$("#pge").load("pages/material.php", { mt: i }); 
}

$("div.g_sb_done").click(function() {
	if(checkSymbols($("#emlt").val().toLowerCase()) && contains('@', $("#emlt").val().toLowerCase()) && contains('.', $("#emlt").val().toLowerCase()))
	{
		$('div.g_sb_err').html('');
		$('div.g_sb_scc').html('');
		if(checkSymbols($("#namet").val().toLowerCase()))
		{
			$('div.g_sb_err').html('');
			$.ajax({ 
				type: 'POST', 
				url: 'sys/jax.php?subs', 
				data: { 
					'nm': $("#namet").val(), 
					'em': $("#emlt").val() 
				}, 
				success: function(r) 
				{ 
					if(r == 'true') 
					{ 
						$('div.g_sb_scc').html('Успешно подписались'); 
						setTimeout(function() {
							$("div.g_sb_t").animate({top: "-" + $("div.g_sb_t").height() - 100 + "px"}, 300);
							$("div.g_sb").animate({opacity: "0"}, 300, function() { 
								$("div.g_sb").css("display","none");
							});
						}, 1000);
					} 
				}
			});
		} 
		else 
		{
			$('div.g_sb_err').html('Введите имя правильно');
		}
	} 
	else 
	{ 
		$('div.g_sb_err').html('Введите правильный E-Mail'); 
	}
});