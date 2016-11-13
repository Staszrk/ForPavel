var P = 0;

function Go(Url) {
	if (confirm('Подтвердить переход по ссылке?'))
		 top.location = Url;
}

function lmt(i)
{
	history.pushState(null, null, "?mt=" + i);
	$("#bck").css("display","block");
	$("#pge").load(
		"pages/material.php", 
		{ 
			mt: i 
		}
	);
}

var symbols = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','@','.','а','б','в','г','д','е','ё','ж','з','и','й','к','л','м','н','о','п','р','с','т','у','ф','х','ц','ч','ш','щ','ь','ъ','э','ю','я','ы'];

function checkSymbols(l)
{
	var cn = 0;
	for(var k = 0; k < l.length; k++)
		for(var i = 0; i < symbols.length; i++)
			if(l[k] == symbols[i])
			{
				cn++;
				break;
			}
	if(cn == l.length)
		return true;
	else 
		return false;
}

function contains(s, l)
{
	if(l.indexOf(s) > -1)
		return true;
	else 
		return false;
}
