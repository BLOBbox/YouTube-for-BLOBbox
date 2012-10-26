<? header("Location: prova.html"); return; ?>

<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
<head>
<meta name='Author' content='Edoardo Esposito - edoardo.esposito@tvblob.com' />
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=974; initial-scale=1.0; maximum-scale=1.0; minimum-scale=1.0" />  

<title>Youtube for BLOBBox</title>
<script type='text/javascript' src='http://www.blobforge.com/static/lib/tvb-min.js'></script>
<script type='text/javascript' src='js/tools.js'></script>
<script type='text/javascript' src='js/home.js'></script>
<script type='text/javascript' src='js/youtube.js'></script>
<script type='text/javascript' src='js/search.js'></script>
<script type='text/javascript' src='js/user.js'></script>
<script type='text/javascript' src='js/videolist.js'></script>
<script type='text/javascript' src='js/aftervideo.js'></script>
<script type='text/javascript' src='js/locales.js'></script>
<!-- <script type="text/javascript" src="http://tvportal.tvblob.com/apps/youtube/getYoutubeVideo.js" charset="utf-8"></script> -->
<script type="text/javascript" src="getYoutubeVideo.js" charset="utf-8"></script>

<link rel='stylesheet' type='text/css' href='youtube.css'>

<body>

<script type="text/javascript">
var youtubetheme = TVB.Tools.getCookie('youtube_theme');
var youtubequality = TVB.Tools.getCookie('youtube_quality');

if (youtubetheme == null || youtubetheme == undefined) { youtubetheme = "light"; }
if (youtubequality == null || youtubequality == undefined) { youtubequality = "high"; }

if (window.innerWidth < 700) 
{
	document.write('<link rel="stylesheet" type="text/css" href="youtube_43.css">');

	if (youtubetheme == 'light')
	{
		document.write('<link rel="stylesheet" type="text/css" href="light.css">');
		document.write('<link rel="stylesheet" type="text/css" href="light_43.css">');
	}
	else if (youtubetheme == 'dark')
	{
		document.write('<link rel="stylesheet" type="text/css" href="dark.css">');
		document.write('<link rel="stylesheet" type="text/css" href="dark_43.css">');
	}
}
else
{
	if (youtubetheme == 'light')
	{
		document.write('<link rel="stylesheet" type="text/css" href="light.css">');
	}
	else if (youtubetheme == 'dark')
	{
		document.write('<link rel="stylesheet" type="text/css" href="dark.css">');
	}
}

</script>

</head>
<body>
	
<div id='container'>

	<div id='homepage'>

		<div id="hometitle"></div>
		<div id="hometopbar"></div>
		<div id="homeselected"></div>
		<div id="homemenubar"></div>

	</div>

	<div id='searchpage' style='display: none;'>
		<div id='content'></div>
	</div>
	
	<div id="videolist" style='display:none'>
		<div id="videolistmenu"></div>
		<div id="videolistcont"></div>
		<div id="frecciagiu" style='display: none;'></div>
	</div>

	<div id='loginpage' style='display: none;'></div>
	<div id='optionspage' style='display: none;'></div>
</div>

<a id='dummy'></a>
	
<div class='break'></div>

<!-- start of google analytics -->
<script type='text/javascript' async=true
src='https://ssl.google-analytics.com/ga.js'></script>
<script type="text/javascript">
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-20030158-26']);
  _gaq.push(['_trackPageview']);
</script>
<!--  end of google analytics -->

<script type='text/javascript'>
var youtubeusername = TVB.Tools.getCookie('youtube_username');
var youtubepassword = TVB.Tools.getCookie('youtube_password');
var youtubelanguage = TVB.Tools.getCookie('youtube_language');

if (youtubeusername == null || youtubeusername == undefined)
{
	youtubeusername = "";
}

if (youtubepassword == null || youtubepassword == undefined)
{
	youtubepassword = "";
}

if (youtubelanguage == null || youtubelanguage == undefined)
{
	youtubelanguage = 1;
}

try
{
	setTimeout(function(){init();},250);
}
catch (e) {}

</script>
</body>

</html>
