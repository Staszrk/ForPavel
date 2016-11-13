<?php
$month_array = array ( 
	"lar1" => "Января", 
	"lar2" => "Февраля", 
	"lar3" => "Марта", 
	"lar4" => "Апреля", 
	"lar5" => "Мая", 
	"lar6" => "Июня", 
	"lar7" => "Июля", 
	"lar8" => "Августа", 
	"lar9" => "Сентября", 
	"lar10" => "Октября", 
	"lar11" => "Ноября", 
	"lar12" => "Декабря"
);

function convertTime($date) {
	global $month_array;
	$arr = explode(' ',$date);
	$date = explode('-',$arr[0]);
	$time = explode(':',$arr[1]);
	if($date[1] < 10) 
		$_month = substr($date[1], 1);
	else 
		$month = $date[1];
	$month = mb_strtolower($month_array["lar".$month], 'UTF-8');
	$day = $date[2];
	$year = $date[0];
	$hour = $time[0];
	$minute = $time[1];
	return $day.' '.$month.' '.$year.' в '.$hour.':'.$minute;
}
function count_posts() {
	global $mysqli;
	if($posts = $mysqli->query("SELECT count(*) as count FROM `materials`"))
		if($count = $posts->fetch_assoc())
		{
			if(substr($count['count'], -2) > 10 && substr($count['count'], -2) < 20)
				return '<b>'.$count['count'].'</b><br>постов';
			elseif(substr($count['count'], -1) == 1)
				return '<b>'.$COUNT['count'].'</b><br>пост';
			else if(substr($count['count'], -1) > 1 && substr($count['count'], -1) < 5)
				return '<b>'.$count['count'].'</b><br>поста';
			else 
				return '<b>'.$count['count'].'</b><br>постов';
		}
}

function count_subscribles() {
	global $mysqli;
	if($subscribles = $mysqli->query("SELECT count(*) as count FROM `users`"))
		if($count = $subscribles->fetch_assoc())
		{
			if(substr($count['count'], -2) > 10 &&  substr($count['count'], -2) < 20)
				return '<b>'.$count['count'].'</b><br>подписчиков';
			elseif(substr($count['count'], -1) == 1)
				return '<b>'.$count['count'].'</b><br>подписчик';
			else if(substr($count['count'], -1) > 1 && substr($count['count'], -1) < 5)
				return '<b>'.$count['count'].'</b><br>подписчика';
			else 
				return '<b>'.$count['count'].'</b><br>подписчиков';
		}
}

function text_clip($text, $length)
{
	$start_word_count = sizeof(explode( ' ', $text ));
	$arr = array_slice(explode( ' ', $text ), 0, $length);
	
	if($start_word_count == sizeof($arr))
		$text = trim(implode(' ', $arr), ',');
	else $text = trim(implode(' ', $arr), ',').'...';
	unset($arr);
	return $text;
}
?>