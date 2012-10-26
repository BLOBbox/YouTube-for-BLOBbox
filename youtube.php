<?php
/* require_once 'include/Request.php'; */
/* require_once 'xmlrpc_catcher.php';  */
/* set_include_path(get_include_path().PATH_SEPARATOR.'/usr/share/php/libzend-framework-php/'); */
require_once 'Zend/Loader.php';
Zend_Loader::loadClass('Zend_Gdata_ClientLogin');
Zend_Loader::loadClass('Zend_Gdata_YouTube');
Zend_Loader::loadClass('Zend_Gdata_AuthSub');
Zend_Loader::loadClass('Zend_Gdata_App_Exception');

//ini_set('display_errors',2);
//error_reporting(E_ALL);

$errorMessage = '';

function microtime_f()
{
	list($usec, $sec) = explode(" ", microtime());
	return ((float)$usec + (float)$sec);
}

function getMethods($obj)
{
	$class_methods = get_class_methods($obj);
			        
	foreach ($class_methods as $method_name)
		echo $method_name . "<br/>";
}

function writeLog($log) 
{
	$logfile = "/tmp/youtube.php.log";

	if (!file_exists($logfile)) 
	{
		touch($logfile);
		chmod($logfile,0666);
	}

	$fp = fopen($logfile, 'a');
	//fwrite($fp, sprintf("%s - %s\n", date("D M j G:i:s T Y"), $log));
	fclose($fp);
}

function p($res)
{
		echo "<pre>";
		print_r($res);
		echo "</pre>";
}

function parseEntries1 ($entries)
{
	$items = array();

	foreach ($entries as $entry) 
	{
		$ca = count($entry->category);

		$keywords = array();
		for ($i=0;$i<$ca;$i++)
		{
			$a = $entry->category[$i]->attributes();
			if (strstr($a['scheme'],'gdata'))
				array_push($keywords,$a->term[0]);
		}

		$media = $entry->children('http://search.yahoo.com/mrss/');
	
		$attrs = $media->group->player->attributes();

		$url = $attrs['url'];
		$title = $media->group->title;
	
		$attrs = $media->group->thumbnail[0]->attributes();
		$thumbnail = $attrs['url']; 
		$desc = $media->group->description;
		$author = $entry->author->name;
		$published = $entry->published;
	
		$yt = $media->children('http://gdata.youtube.com/schemas/2007');
		$attrs = $yt->duration->attributes();
		$length = $attrs['seconds']; 
	
		$gd = $entry->children('http://schemas.google.com/g/2005'); 
		if ($gd->rating) 
		{
			$attrs = $gd->rating->attributes();
			$rating = $attrs['average']; 
		} 
		else
			$rating = 0; 

		$item = array(
			'url' => $url,
			'title' => $title,
			'thumbnail' => $thumbnail,
			'desc' => $desc,
			'author' => $author,
			'length' => $length,
			'published' => $published,
			'keywords' => $keywords,
			'rating' => $rating
		);

		array_push($items,$item);
	}

	return ($items);
}

function parseEntries($entries)
{
	$items = array();

	foreach ($entries as $entry) 
	{
		try {

			$ca = count($entry->category);

			$keywords = array();
			for ($i=0;$i<$ca;$i++)
			{
				$a = $entry->category[$i]->attributes();
				if (strstr($a['scheme'],'gdata'))
					array_push($keywords,$a->term);
			}

			$media = $entry->children('http://search.yahoo.com/mrss/');

			$attrs = $media->group->player->attributes();

			$url = $attrs['url'];

			$v = explode('=',$url);
			$vid = $v[1];


			$title = $media->group->title;

			$thumbnail = '';
			if ($media->group->thumbnail)
			{ 
				$attrs = $media->group->thumbnail[0]->attributes();
				$thumbnail = $attrs['url']; 
			}

			$desc = $media->group->description;
			$author = $entry->author->name;
			$published = $entry->published;

			$yt = $media->children('http://gdata.youtube.com/schemas/2007');
			$attrs = $yt->duration->attributes();
			$length = $attrs['seconds']; 


			$yt = $entry->children('http://gdata.youtube.com/schemas/2007');
			$attrs = $yt->statistics->attributes();
			$views = $attrs['viewCount']; 

			$gd = $entry->children('http://schemas.google.com/g/2005'); 
			if ($gd->rating) 
			{
				$attrs = $gd->rating->attributes();
				$rating = $attrs['average']; 
			} 
			else
				$rating = 0; 

			$item = array(
				'url' => $url,
				'title' => $title,
				'thumbnail' => $thumbnail,
				'desc' => $desc,
				'author' => $author,
				'length' => $length,
				'published' => $published,
				'views' => $views,
				'vid' => $vid,
				'keywords' => $keywords,
				'rating' => $rating
			);

			array_push($items,$item);
		} catch (Exception $e) {}
	}

	return ($items);
}

function ZendParseEntries($entries)
{
	$items = array();

	foreach ($entries as $entry) 
	{

//		echo 'Video: ' . $entry->getVideoTitle() . "<br/>\n";
//		echo 'Video ID: ' . $entry->getVideoId() . "<br/>\n";
//		echo 'Updated: ' . $entry->getUpdated() . "<br/>\n";
//		echo 'Description: ' . $entry->getVideoDescription() . "<br/>\n";
//		echo 'Category: ' . $entry->getVideoCategory() . "<br/>\n";
//		echo 'Tags: ' . implode(", ", $entry->getVideoTags()) . "<br/>\n";
//		echo 'Watch page: ' . $entry->getVideoWatchPageUrl() . "<br/>\n";
//		echo 'Flash Player Url: ' . $entry->getFlashPlayerUrl() . "<br/>\n";
//		echo 'Duration: ' . $entry->getVideoDuration() . "<br/>\n";
//		echo 'View count: ' . $entry->getVideoViewCount() . "<br/>\n";
//		echo 'Rating: ' . $entry->getVideoRatingInfo() . "<br/>\n";
//		echo 'Geo Location: ' . $entry->getVideoGeoLocation() . "<br/>\n";
//		echo "<br/>\n";
//		echo "<br/>\n";
//		echo "<br/>\n";

		$author = $entry->getAuthor();
		$author = $author[0]->name->text;
		$rating = $entry->getVideoRatingInfo();
		$rating = $rating['average'];

		$wp = explode("=",$entry->getVideoWatchPageUrl());

		if (count($wp) > 0)
		{
			$vid = $wp[1];
		}
		else
		{
			$vid = null;
		}

		if (isset($entry->mediaGroup->thumbnail) && count($entry->mediaGroup->thumbnail) > 0)
		{
			$thumbnail = htmlspecialchars($entry->mediaGroup->thumbnail[0]->url);
		}
		else
		{
			$thumbnail = '';
		}

		$item = array(
			'url' => $entry->getVideoWatchPageUrl(),
			'title' =>  htmlspecialchars($entry->getVideoTitle()),
			'thumbnail' => $thumbnail,
			'desc' => htmlspecialchars($entry->getVideoDescription()),
			'author' => $author,
			'length' => $entry->getVideoDuration(),
			'published' => $entry->getUpdated()->text,
			'views' => $entry->getVideoViewCount(),
//			'vid' => $entry->getVideoId(),
			'vid' => $vid,
			'keywords' => implode(", ", $entry->getVideoTags()),
			'rating' => $rating
		);
		array_push($items,$item);
	}

	return ($items);
}

function ZendParseEntries2($entries)
{
//	echo "<pre>";
//	print_r($entries);
//	echo "</pre>";
//	return;

	$items = array();

	foreach ($entries as $entry) 
	{
		$item = array(
			'url' => $entry->getPlaylistVideoFeedUrl(),
			'vid' => $entry->getPlaylistVideoFeedUrl(),
			'title' =>  htmlspecialchars($entry->title->text),
			'desc' => htmlspecialchars($entry->description->text)
		);
		array_push($items,$item);
	}
	return ($items);

	foreach ($entries as $entry) 
	{

//		echo 'Video: ' . $videoEntry->getVideoTitle() . "\n";
//		echo 'Video ID: ' . $videoEntry->getVideoId() . "\n";
//		echo 'Updated: ' . $videoEntry->getUpdated() . "\n";
//		echo 'Description: ' . $videoEntry->getVideoDescription() . "\n";
//		echo 'Category: ' . $videoEntry->getVideoCategory() . "\n";
//		echo 'Tags: ' . implode(", ", $videoEntry->getVideoTags()) . "\n";
//		echo 'Watch page: ' . $videoEntry->getVideoWatchPageUrl() . "\n";
//		echo 'Flash Player Url: ' . $videoEntry->getFlashPlayerUrl() . "\n";
//		echo 'Duration: ' . $videoEntry->getVideoDuration() . "\n";
//		echo 'View count: ' . $videoEntry->getVideoViewCount() . "\n";
//		echo 'Rating: ' . $videoEntry->getVideoRatingInfo() . "\n";
//		echo 'Geo Location: ' . $videoEntry->getVideoGeoLocation() . "\n";

		$author = $entry->getAuthor();
		$author = $author[0]->name->text;
		$rating = $entry->getVideoRatingInfo();
		$rating = $rating['average'];

		$item = array(
			'url' => $entry->getVideoWatchPageUrl(),
			'title' =>  htmlspecialchars($entry->getVideoTitle()),
			'thumbnail' => htmlspecialchars($entry->mediaGroup->thumbnail[0]->url),
			'desc' => htmlspecialchars($entry->getVideoDescription()),
			'author' => $author,
			'length' => $entry->getVideoDuration(),
			'published' => $entry->getUpdated()->text,
			'views' => $entry->getVideoViewCount(),
			'vid' => $entry->getVideoId(),
			'keywords' => implode(", ", $entry->getVideoTags()),
			'rating' => $rating
		);
		array_push($items,$item);
	}

	return ($items);
}

function parsePlaylistVideoItem($feedItems)
{
	$items = array();

	foreach($feedItems as $f)
	{
//		getMethods($f);
//		return;

//		p($f->getVideoTitle());
//		p($f->getFlashPlayerUrl());
//		continue;

		$thumbnailstruct = $f->getVideoThumbnails();
		$thumbnail = $thumbnailstruct[0]['url'];

		$ratingstruct = $f->getVideoRatingInfo();
		$rating = $ratingstruct['average'];

//		echo 'Video: ' . $f->getVideoTitle() . "<br/>\n";
//		echo 'Video ID: ' . $f->getVideoId() . "<br/>\n";
//		echo 'Thumbnail: ' . $thumbnail . "<br/>\n";
//		echo 'Author: ' . $f->getAuthor() . "<br/>\n";
//		echo 'Updated: ' . $f->getUpdated() . "<br/>\n";
//		echo 'Description: ' . $f->getVideoDescription() . "<br/>\n";
//		echo 'Category: ' . $f->getVideoCategory() . "<br/>\n";
//		echo 'Tags: ' . implode(", ", $f->getVideoTags()) . "<br/>\n";
//		echo 'Watch page: ' . $f->getVideoWatchPageUrl() . "<br/>\n";
//		echo 'Flash Player Url: ' . $f->getFlashPlayerUrl() . "<br/>\n";
//		echo 'Duration: ' . $f->getVideoDuration() . "<br/>\n";
//		echo 'View count: ' . $f->getVideoViewCount() . "<br/>\n";
//		echo 'Rating: ' . $rating . "<br/>\n";
//		echo "<br/>\n";
//		echo "<br/>\n";
//		echo "<br/>\n";

		$fpu = $f->getFlashPlayerUrl();

		if (empty($fpu))
		{
			$removed = 1;
			$vid = null;
		}
		else
		{
			$removed = 0;
			$fpu1 = explode('/',$fpu);
			$fpu2 = explode('?',$fpu1[count($fpu1) - 1]);
			$vid = $fpu2[0];
		}

		$item = array(
			'title' =>  htmlspecialchars($f->getVideoTitle()),
			'thumbnail' => htmlspecialchars($thumbnail),
			'desc' => htmlspecialchars($f->getVideoDescription()),
			'author' => htmlspecialchars($f->getAuthor()),
			'length' => $f->getVideoDuration(),
			'published' => $f->getUpdated()->text,
			'views' => $f->getVideoViewCount(),
			'vid' => $vid,
			'keywords' => implode(", ", $f->getVideoTags()),
			'removed' => $removed,
			'rating' => round($rating,1)
		);
		array_push($items,$item);

	}

	return $items;
}

class Youtube
{
	var $username = '';
	var $password = '';
	var $clientID = 'ytapi-EdoardoEsposito-TVBLOBYoutubeApp-361lto2g-0';
	var $developerKEY = 'AI39si5S7WfvhK47cZi9irF9CNfYyywX-O0TOCOANqikPVsCsqqSlldaCaWeTEyWkcM8HTK_CDceivn8b2h6RAwQBsu6BLNWDQ';
	var $applicationName = "TVBLOB Youtube Application";
	var $youtubeusername = '';

	function startpage($lang,$nv)
	{
		$st = microtime_f();
	
		$maxresults = $nv;
		$time = 'today';

		switch ($lang)
		{
			case 0: 
				$n = '';
				break;		
			case 1: 
				$n = '';
				break;		
			case 2: 
				$n = '/IT';
				break;		
			case 3: 
				$n = '/FR';
				break;		
			case 4: 
				$n = '/DE';
				break;		
			case 5: 
				$n = '/ES';
				break;		
			case 6: 
				$n = '/JP';
				break;
		}
	
		$tr = "http://gdata.youtube.com/feeds/api/standardfeeds".$n."/top_rated";
		$mp = "http://gdata.youtube.com/feeds/api/standardfeeds".$n."/most_popular";
		$mv = "http://gdata.youtube.com/feeds/api/standardfeeds".$n."/most_viewed";
	
		$trurl = $tr. "?time=".$time."&max-results=".$maxresults."&start-index=1";
		$mpurl = $mp. "?time=".$time."&max-results=".$maxresults."&start-index=1";
		$mvurl = $mv. "?time=".$time."&max-results=".$maxresults."&start-index=1";
		
		writeLog('youtube.php - trurl : ' . $trurl);

		$items = array();
		$items[0] = array();
//		$items[1] = array();
//		$items[2] = array();
	
		$sxml = simplexml_load_file($trurl);
		$entries = parseEntries($sxml->entry);
		foreach ($entries as $entry) 
		{
			$url = $entry['url'];
			$vid = $entry['vid'];
			$title = $entry['title'];
			$desc = $entry['desc'];
			$thumbnail = $entry['thumbnail'];
	
			$item = array(
				'url' => $url,
				'vid' => $vid,
				'desc'=>$desc,
				'title' => $title,
				'thumbnail' => $thumbnail
			);

			if (!empty($item))
			{	
				array_push($items[0],$item);
			}
		}

		array_push($items[0],array());

/***************************************************************************************/

		$sxml = simplexml_load_file($mpurl);
		$entries = parseEntries($sxml->entry);
		foreach ($entries as $entry) 
		{
			$url = $entry['url'];
			$vid = $entry['vid'];
			$desc = $entry['desc'];
			$title = $entry['title'];
			$thumbnail = $entry['thumbnail'];
	
			$item = array(
				'url' => $url,
				'vid' => $vid,
				'desc'=>$desc,
				'title' => $title,
				'thumbnail' => $thumbnail
			);
	
			array_push($items[0],$item);
		}
		
		array_push($items[0],array());

/***************************************************************************************/

	
		$sxml = simplexml_load_file($mvurl);
		$entries = parseEntries($sxml->entry);
		foreach ($entries as $entry) 
		{
			$url = $entry['url'];
			$vid = $entry['vid'];
			$desc = $entry['desc'];
			$title = $entry['title'];
			$thumbnail = $entry['thumbnail'];
	
			$item = array(
				'url' => $url,
				'vid' => $vid,
				'desc'=>$desc,
				'title' => $title,
				'thumbnail' => $thumbnail
			);
	
			array_push($items[0],$item);
		}
	
		array_push($items[0],array());


		$et = microtime_f();
	
		writeLog('youtube.php - startpage : ' . floatval($et - $st) . ' ms');
	
		ob_start("ob_gzhandler");

//		echo "<pre>";
//		print_r($items);
//		echo "</pre>";

		echo json_encode($items);
	}

	function __newstartpage($lang,$nv)
	{
		$st = microtime_f();
	
		$maxresults = $nv;
		$time = 'today';

		switch ($lang)
		{
			case 0: 
				$n = '';
				break;		
			case 1: 
				$n = '';
				break;		
			case 2: 
				$n = '/IT';
				break;		
			case 3: 
				$n = '/FR';
				break;		
			case 4: 
				$n = '/DE';
				break;		
			case 5: 
				$n = '/ES';
				break;		
			case 6: 
				$n = '/JP';
				break;
		}
	
		$tr = "http://gdata.youtube.com/feeds/api/standardfeeds".$n."/top_rated";
		$mp = "http://gdata.youtube.com/feeds/api/standardfeeds".$n."/most_popular";
		$mv = "http://gdata.youtube.com/feeds/api/standardfeeds".$n."/most_viewed";
	
		$trurl = $tr. "?time=".$time."&max-results=".$maxresults."&start-index=1";
		$mpurl = $mp. "?time=".$time."&max-results=".$maxresults."&start-index=1";
		$mvurl = $mv. "?time=".$time."&max-results=".$maxresults."&start-index=1";
		
		writeLog('youtube.php - trurl : ' . $trurl);

		$items = array();
		$items['piuvotati'] = array();
		$items['piuvisti'] = array();
		$items['popolari'] = array();

/***************************************************************************************/
	
		$sxml = simplexml_load_file($trurl);
		$entries = parseEntries($sxml->entry);
		foreach ($entries as $entry) 
		{
			$url = $entry['url'];
			$vid = $entry['vid'];
			$title = $entry['title'];
			$thumbnail = $entry['thumbnail'];
	
			$item = array(
				'url' => $url,
				'vid' => $vid,
				'title' => $title,
				'thumbnail' => $thumbnail
			);

			array_push($items['piuvotati'],$item);
		}

/***************************************************************************************/
/*
		$sxml = simplexml_load_file($mpurl);
		$entries = parseEntries($sxml->entry);
		foreach ($entries as $entry) 
		{
			$url = $entry['url'];
			$vid = $entry['vid'];
			$title = $entry['title'];
			$thumbnail = $entry['thumbnail'];
	
			$item = array(
				'url' => $url,
				'vid' => $vid,
				'title' => $title,
				'thumbnail' => $thumbnail
			);
	
			array_push($items['popolari'],$item);
		}
 */
/***************************************************************************************/
	
		$sxml = simplexml_load_file($mvurl);
		$entries = parseEntries($sxml->entry);
		foreach ($entries as $entry) 
		{
			$url = $entry['url'];
			$vid = $entry['vid'];
			$title = $entry['title'];
			$thumbnail = $entry['thumbnail'];
	
			$item = array(
				'url' => $url,
				'vid' => $vid,
				'title' => $title,
				'thumbnail' => $thumbnail
			);
	
			array_push($items['piuvisti'],$item);
		}

/***************************************************************************************/

		$et = microtime_f();
	
		writeLog('youtube.php - startpage : ' . floatval($et - $st) . ' ms');
	
//		echo "<pre>";
//		print_r($items);
//		echo "</pre>";
//		return;

		ob_start("ob_gzhandler");
		echo json_encode($items);
	}

	function newstartpage($lang,$nv)
	{
		$st = microtime_f();
	
		$maxresults = intval($nv + 3);
		$time = 'today';

		switch ($lang)
		{
			case 0: 
				$n = '';
				break;		
			case 1: 
				$n = '';
				break;		
			case 2: 
				$n = '/IT';
				break;		
			case 3: 
				$n = '/FR';
				break;		
			case 4: 
				$n = '/DE';
				break;		
			case 5: 
				$n = '/ES';
				break;		
			case 6: 
				$n = '/JP';
				break;
		}
	
		$tr = "http://gdata.youtube.com/feeds/api/standardfeeds".$n."/top_rated";
		$mp = "http://gdata.youtube.com/feeds/api/standardfeeds".$n."/most_popular";
		$mv = "http://gdata.youtube.com/feeds/api/standardfeeds".$n."/most_viewed";
	
		$trurl = $tr. "?time=".$time."&max-results=".$maxresults."&start-index=1";
		$mpurl = $mp. "?time=".$time."&max-results=".$maxresults."&start-index=1";
		$mvurl = $mv. "?time=".$time."&max-results=".$maxresults."&start-index=1";
		
		writeLog('youtube.php - trurl : ' . $trurl);

		$items = array();
		$items['piuvotati'] = array();
		$items['piuvisti'] = array();
		$items['popolari'] = array();

/***************************************************************************************/
	
		$sxml = simplexml_load_file($trurl);
		
		$entries = parseEntries($sxml->entry);

		$i = 1;
		foreach ($entries as $entry) 
		{
			if (empty($entry['url'])) { continue; }

			$url = $entry['url'];
			$vid = $entry['vid'];
			$title = $entry['title'];
			$thumbnail = $entry['thumbnail'];
	
			$item = array(
				'url' => $url,
				'vid' => $vid,
				'title' => $title,
				'thumbnail' => $thumbnail
			);

			array_push($items['piuvotati'],$item);

			if ($i == $nv) { break; }

			$i ++;
		}

//		echo "PIU VOTATI";
//		p($items['piuvotati']);

/***************************************************************************************/

		$sxml = simplexml_load_file($mpurl);
		$entries = parseEntries($sxml->entry);

		$i = 1;
		foreach ($entries as $entry) 
		{
			if (empty($entry['url'])) { continue; }

			$url = $entry['url'];
			$vid = $entry['vid'];
			$title = $entry['title'];
			$thumbnail = $entry['thumbnail'];
		
			$item = array(
				'url' => $url,
				'vid' => $vid,
				'title' => $title,
				'thumbnail' => $thumbnail
			);
		
			array_push($items['popolari'],$item);

			if ($i == $nv) { break; }

			$i ++;
		}

//		echo "POPOLARI";
//		p($items['popolari']);

/***************************************************************************************/
	
		$sxml = simplexml_load_file($mvurl);
		$entries = parseEntries($sxml->entry);

		$i = 1;
		foreach ($entries as $entry) 
		{
			if (empty($entry['url'])) { continue; }

			$url = $entry['url'];
			$vid = $entry['vid'];
			$title = $entry['title'];
			$thumbnail = $entry['thumbnail'];
	
			$item = array(
				'url' => $url,
				'vid' => $vid,
				'title' => $title,
				'thumbnail' => $thumbnail
			);
	
			array_push($items['piuvisti'],$item);

			if ($i == $nv) { break; }

			$i ++;
		}

//		echo "PIU VISTI";
//		p($items['piuvisti']);

/***************************************************************************************/

		$et = microtime_f();
	
		writeLog('youtube.php - startpage : ' . floatval($et - $st) . ' ms');
	
//		echo "<pre>";
//		print_r($items);
//		echo "</pre>";
//		return;

		ob_start("ob_gzhandler");
		echo json_encode($items);
	}

	function check()
	{
		$st = microtime_f();
		$client = $this->login($this->username,$this->password);
		
		if ($client != null)
		{
			return true;
		}

		return false;
	}

	function checkCredentials($username,$password)
	{
		$st = microtime_f();
		$client = $this->login($username,$password);
		
		if ($client != null)
		{
			echo json_encode(true);
			return;
		}

		echo json_encode(false);
	}


	function login($_username,$_password)
	{
		$authenticationURL= 'https://www.google.com/youtube/accounts/ClientLogin';
		writeLog('youtube.php - login');
		
		try
		{
			$client = Zend_Gdata_ClientLogin::getHttpClient(
        	                                  $username = $_username,
        	                                  $password = $_password,
        	                                  $service = 'youtube',
        	                                  $client = null,
							$source = 'TVBLOB Youtube Application', 
							$loginToken = null,
							$loginCaptcha = null,
							$authenticationURL);	

			$bodyresp = $client->getLastResponse()->getBody();

			list($auth,$token,$this->youtubeusername) = split("=", $bodyresp);
			
			writeLog('youtube.php - Real username: ' . $this->youtubeusername);
		}
		catch (Zend_Gdata_App_Exception $e)
		{
			p($e);

			$client = null;
			$errorMessage = $e->getMessage();
			writeLog('youtube.php - ' . $errorMessage);
		}

		return $client;	
	}		
	
	function playlist()
	{
		$st = microtime_f();

		try
		{
			$client = $this->login($_REQUEST['username'],$_REQUEST['password']);
			$youTubeService = new Zend_Gdata_YouTube($client);

			$feed = $youTubeService->getPlaylistVideoFeed($_REQUEST['playlistid']);
			$items = parsePlaylistVideoItem($feed);
		}
		catch (Exception $e)
		{
			$client = null;

			$items = false;
			echo json_encode($items);
			return;
		}

//		p($items);
//		return;
	
		$et = microtime_f();
	
		writeLog('youtube.php - playlist: ' . floatval($et - $st) . ' ms');
	
		ob_start("ob_gzhandler");
		echo json_encode(array('num'=>count($items),'items'=>$items));
	}

	function getVideoEntry($videoid)
	{
		$youTubeService = new Zend_Gdata_YouTube($client);
		$v = $youTubeService->getVideoEntry($videoid);
		return $v;

		echo "<pre>";
		print_r($v);
		echo "</pre>";
	}

	function usersubscriptions($username,$password,$mine=false)
	{
		try
		{
			$st = microtime_f();
	
			$client = $this->login($username,$password);
			$youTubeService = new Zend_Gdata_YouTube($client);
//			$youTubeService->setMajorProtocolVersion(2);

			if ($mine == true)
				$feed = $youTubeService->getSubscriptionFeed(trim($this->youtubeusername));
			else
				$feed = $youTubeService->getSubscriptionFeed($username);
	
//			echo "<pre>";
//			print_r($feed);
//			echo "</pre>";
//			return;
	
			$items = array();
	
			foreach ($feed as $entry) 
			{
//				getMethods($entry);
//				p($entry);
//				echo $entry->getMediaThumbnail();
//				return;
				
				$type = 'unknown';
				$subscriptionFeedLinkMap = array(
					'query' => 'http://gdata.youtube.com/schemas/2007#video.query',
					'favorites' => 'http://gdata.youtube.com/schemas/2007#user.favorites',
					'channel' => 'http://gdata.youtube.com/schemas/2007#user.uploads' 
				);
	
				foreach ($entry->category as $category) 
				{
					if ($category->scheme == 'http://gdata.youtube.com/schemas/2007/subscriptiontypes.cat') 
					{
						$type = $category->term;
						
						if ($type === 'channe')
						{
							break;
						}
					}
				}
	
				if ($type == 'channel')
				{
					$feedLink = $entry->getFeedLink($subscriptionFeedLinkMap[$type]);
					$h = explode('/',$feedLink->href);

					$username = $h[count($h) - 2];
		
					$item = array(
						'author' => $username,
						'title' => $entry->getTitle()->text,
						'thumbnail' => null
					);
			
					array_push($items,$item);
				}
			}
		
			$et = microtime_f();

//			p($items);
//			return;
		
			writeLog('youtube.php - usersubscriptions: ' . floatval($et - $st) . ' ms');
		
//			ob_start("ob_gzhandler");
			echo json_encode(array('num'=>count($items),'items'=>$items));
		}
		catch (Zend_Gdata_App_Exception $e)
		{
//			echo "<pre>";
//			print_r($e);
//			echo "</pre>";
			echo json_encode(array('num'=>0));
		}

	}

	function userplaylists($username,$password,$mine=false)
	{
		$st = microtime_f();

		$client = $this->login($username,$password);
//		p($client);
//		return;

		$youTubeService = new Zend_Gdata_YouTube($client);

		try
		{
			if ($mine == true)		
				$feed = $youTubeService->getPlaylistListFeed(trim($this->youtubeusername));
			else
				$feed = $youTubeService->getPlaylistListFeed(urlencode($username));
			$entries = ZendParseEntries2($feed);
		}
		catch (Zend_Gdata_App_Exception $e)
		{
			p($e);

//			writeLog('youtube.php - ECCEZIONE');
//			writeLog('youtube.php - ' . print_r($e,true));
			$client = null;

			$errorMessage = $e->getMessage();

			$items = false;
			echo json_encode($items);
			return;

			writeLog('youtube.php - ' . $errorMessage);
		}

//		p($entries);
//		return;
	
		$items = array();
	
		foreach ($entries as $entry) 
		{
//			$urlcomps = explode('/',$entry['url']);
//			$url = $urlcomps[count($urlcomps) - 1];
			$url = $entry['url'];
			$title = $entry['title'];
			$thumbnail = $entry['thumbnail'];
	
			$desc = $entry['desc'];
			$author = $entry['author'];
			$length = $entry['length']; 
			$views = $entry['views']; 
			$rating = $entry['rating']; 
			$published= $entry['published']; 
			$keywords = $entry['keywords']; 
//			$vid = $entry['vid']; 
	
			$item = array(
				'url' => $url,
				'title' => $title,
				'thumbnail' => $thumbnail,
				'desc' => $desc,
				'author' => $author,
				'length' => $length,
				'published' => $published,
				'views' => $views,
				'vid' => null,
				'keywords' => $keywords,
				'rating' => $rating
			);
	
			array_push($items,$item);
		}

//		p($items);
//		return;

	
		$et = microtime_f();
	
		writeLog('youtube.php - userplaylists: ' . floatval($et - $st) . ' ms');
	
		ob_start("ob_gzhandler");
//		echo json_encode($items);
		echo json_encode(array('num'=>count($items),'items'=>$items));
	}
	
	function userprofile($username,$mine=false)
	{
		$st = microtime_f();

		if (! $this->check())
		{
//			echo json_encode($errorMessage);
			echo json_encode(false);

			return;
		}	
		
		if ($mine == true)
		{
			$userurl = "http://gdata.youtube.com/feeds/api/users/" . $this->youtubeusername;
		}
		else
		{
			$userurl = "http://gdata.youtube.com/feeds/api/users/" . $username;
		}
		
		writeLog('youtube.php - userurl: ' . $userurl);
	
		$ch = curl_init($userurl);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		$albumsxml = curl_exec($ch);
		$p = xml_parser_create();
		xml_parser_set_option($p, XML_OPTION_SKIP_WHITE, 1);
		xml_parse_into_struct($p,$albumsxml,$albumsels,$index);
		xml_parser_free($p);
	
		foreach($albumsels as $el)
		{
			if($el['tag'] == 'PUBLISHED')
				$published = $el['value'];
			if($el['tag'] == 'UPDATED')
				$updated = $el['value'];
			if($el['tag'] == 'TITLE')
				$title = $el['value'];
			if($el['tag'] == 'CONTENT')
				$content = $el['value'];
			if($el['tag'] == 'YT:FIRSTNAME')
				$firstname = $el['value'];
			if($el['tag'] == 'YT:LASTNAME')
				$lastname = $el['value'];
			if($el['tag'] == 'YT:GENDER')
				$gender = $el['value'];
			if($el['tag'] == 'YT:GENDER')
				$location = $el['value'];
			if($el['tag'] == 'YT:HOMETOWN')
				$hometown = $el['value'];
			if($el['tag'] == 'MEDIA:THUMBNAIL')
			{
				$e = $el['attributes'];
				$thumbnail = $e['URL'];
			}
			if($el['tag'] == 'YT:STATISTICS')
			{
				$e = $el['attributes'];
				$viewcount = $e['VIEWCOUNT'];
				$videowatchcount= $e['VIDEOWATCHCOUNT'];
				$subscribercount= $e['SUBSCRIBERCOUNT'];
				$lastwebaccess = $e['LASTWEBACCESS'];
			}
		}
	
		if ($subscribercount == null)
			$subscribercount = 0;
	
		if ($viewcount == null)
			$viewcount = 0;
	
		$item = array(
			'title' => $title,
			'thumbnail' => $thumbnail,
			'content' => $content,
			'firstname' => $firstname,
			'lastname' => $lastname,
			'gender' => $gender,
			'hometown' => $hometown,
			'location' => $location,
			'lastwebaccess' => $lastwebaccess,
			'subscribers' => $subscribercount,
			'vid' => $vid,
			'views' => $viewcount,
			'videowatch' => $videowatchcount
		);
	
		$et = microtime_f();
	
		writeLog('youtube.php - userprofile: ' . floatval($et - $st) . ' ms');
	
//		ob_start("ob_gzhandler");
		echo json_encode($item);
	
	}

	function useruploads($username,$password,$mine=false)
	{
		$st = microtime_f();
	
		$maxresults = 12;

		try
		{
			if (isset($username) && isset($password))
			{
				$client = $this->login($username,$password);
			}
			else
			{
				$client = null;
			}

			$youTubeService = new Zend_Gdata_YouTube($client);

			if ($mine == true)
			{
				$youTubeService->getUserUploads(trim($this->youtubeusername));
				$feed = $youTubeService->getUserUploads(trim($this->youtubeusername));
			}
			else
			{
				$feed = $youTubeService->getUserUploads($username);
			}

			$entries = ZendParseEntries($feed);

//			p($entries);
//			return;
		
			$items = array();
		
			foreach ($entries as $entry) 
			{
				$url = $entry['url'];
				$title = $entry['title'];
				$thumbnail = $entry['thumbnail'];
		
				$desc = $entry['desc'];
				$author = $entry['author'];
				$length = $entry['length']; 
				$views = $entry['views']; 
				$rating = $entry['rating']; 
				$published= $entry['published']; 
				$keywords = $entry['keywords']; 
				$vid = $entry['vid']; 
		
				$item = array(
					'url' => $url,
					'title' => $title,
					'thumbnail' => $thumbnail,
					'desc' => $desc,
					'author' => $author,
					'length' => $length,
					'published' => $published,
					'views' => $views,
					'vid' => $vid,
					'keywords' => $keywords,
					'rating' => $rating
				);
		
				array_push($items,$item);
			}
		
			$et = microtime_f();

			writeLog('youtube.php - userfavorites: ' . floatval($et - $st) . ' ms');
		
			ob_start("ob_gzhandler");
			echo json_encode(array('num'=>count($items),'items'=>$items));
		}
		catch (Zend_Gdata_App_Exception $e)
		{
			echo json_encode(array('num'=>0));
		}
	}

	function addtofavorites($vid)
	{
		$st = microtime_f();
	
		try
		{			
			$client = $this->login($this->username,$this->password);			
			$youTubeService = new Zend_Gdata_YouTube($client, $this->applicationName, $this->clientID, $this->developerKEY);
			
//			echo "<pre>";
//			print_r($youTubeService);
//			echo "</pre>";

			$v1 = explode('&',$vid);
			$vid = $v1[0];
			
			writeLog('youtube.php - addtofav: ' . $this->username . '');
			writeLog('youtube.php - addtofav: ' . $vid . '');
//			return;
			
			$feed = $youTubeService->getUserFavorites($this->username);
			$favoritesFeed = $youTubeService->getUserFavorites($this->username);
			$ve = $youTubeService->getVideoEntry($vid);
			$youTubeService->insertEntry($ve, $favoritesFeed->getSelfLink()->href);
			
//			echo "<pre>";
//			print_r($favoritesFeed);
//			echo "</pre>";
//			return;		

//			echo json_encode(array('num'=>1));
			echo json_encode(true);
		}
		catch (Zend_Gdata_App_Exception $e)
		{	
			writeLog('youtube.php - addtofav: ' . $e->getMessage() . '');
//			echo json_encode(array('num'=>0));
			echo json_encode(false);
		}
	}

	function userfavorites($username,$password,$mine)
	{
		$st = microtime_f();
	
		$maxresults = 12;

		try
		{
			$client = $this->login($username,$password);
			$youTubeService = new Zend_Gdata_YouTube($client);


			if ($mine == true)
			{
				$feed = $youTubeService->getUserFavorites(trim($this->youtubeusername));
			}
			else
			{
				$feed = $youTubeService->getUserFavorites($username);
			}

			$entries = ZendParseEntries($feed);
		
			$items = array();
		
			foreach ($entries as $entry) 
			{
				$url = $entry['url'];
				$title = $entry['title'];
				$thumbnail = $entry['thumbnail'];
		
				$desc = $entry['desc'];
				$author = $entry['author'];
				$length = $entry['length']; 
				$views = $entry['views']; 
				$rating = $entry['rating']; 
				$published= $entry['published']; 
				$keywords = $entry['keywords']; 
				$vid = $entry['vid']; 
		
				$item = array(
					'url' => $url,
					'title' => $title,
					'thumbnail' => $thumbnail,
					'desc' => $desc,
					'author' => $author,
					'length' => $length,
					'published' => $published,
					'views' => $views,
					'vid' => $vid,
					'keywords' => $keywords,
					'rating' => $rating
				);
		
				array_push($items,$item);
			}
		
			$et = microtime_f();

//			p($items);
//			return;
		
//			echo "<pre>";
//			print_r($items);
//			echo "</pre>";
//			return;		
		
			writeLog('youtube.php - userfavorites: ' . floatval($et - $st) . ' ms');
		
//			ob_start("ob_gzhandler");
			echo json_encode(array('num'=>count($items),'items'=>$items));
		}
		catch (Zend_Gdata_App_Exception $e)
		{
			echo json_encode(array('num'=>0));
		}
	}

	function toprated($time = '',$start = 0,$lang)
	{
		$st = microtime_f();
	
//		$maxresults = 18;
		$maxresults = 30;

		$startindex = ($maxresults * $start) + 1;

		switch ($lang)
		{
			case 0: 
				$n = '';
				break;		
			case 1: 
				$n = '';
				break;		
			case 2: 
				$n = '/IT';
				break;		
			case 3: 
				$n = '/FR';
				break;		
			case 4: 
				$n = '/DE';
				break;		
			case 5: 
				$n = '/ES';
				break;		
			case 6: 
				$n = '/JP';
				break;		
		}

	
		if (!isset($time))
			$time = 'today';
	
		$youTubeService = new Zend_Gdata_YouTube();

//		$url = "http://gdata.youtube.com/feeds/api/standardfeeds/IT/top_rated";
		$url = "http://gdata.youtube.com/feeds/api/standardfeeds".$n."/top_rated";
		$feedURL = $url . "?time=".$time."&max-results=".$maxresults . "&start-index=" . $startindex;

		$feed = $youTubeService->getVideoFeed($feedURL);
		
		$entries = ZendParseEntries($feed);
	
		$items = array();
	
		foreach ($entries as $entry) 
		{
			$url = $entry['url'];
			$title = $entry['title'];
			$thumbnail = $entry['thumbnail'];

			if (strlen($entry['desc']) > 200)
				$desc = substr(strip_tags($entry['desc']),0,200) . " ...";
			else
				$desc = $entry['desc'];

			$author = $entry['author'];
			$length = $entry['length']; 
			$views = $entry['views']; 
			$rating = $entry['rating']; 
			$published= $entry['published']; 
			$keywords = $entry['keywords']; 
			$vid = $entry['vid']; 
	
			$item = array(
				'url' => $url,
				'title' => $title,
				'thumbnail' => $thumbnail,
				'desc' => $desc,
				'author' => $author,
				'length' => $length,
				'published' => $published,
				'views' => $views,
				'keywords' => $keywords,
				'vid' => $vid,
				'rating' => $rating
			);
	
			array_push($items,$item);
		}
	
		$et = microtime_f();
	
		writeLog('youtube.php - toprated: ' . floatval($et - $st) . ' ms');
	
		ob_start("ob_gzhandler");
		echo json_encode(array('num'=>count($items),'items'=>$items));
	}

	function mostviewed($time = '',$start = 0,$lang)
	{
		$st = microtime_f();
	
/* 		$maxresults = 18; */
		$maxresults = 30;

		$startindex = ($maxresults * $start) + 1;

		if (!isset($time))
			$time = 'today';

		switch ($lang)
		{
			case 0: 
				$n = '';
				break;		
			case 1: 
				$n = '';
				break;		
			case 2: 
				$n = '/IT';
				break;		
			case 3: 
				$n = '/FR';
				break;		
			case 4: 
				$n = '/DE';
				break;		
			case 5: 
				$n = '/ES';
				break;		
			case 6: 
				$n = '/JP';
				break;		
		}


		$youTubeService = new Zend_Gdata_YouTube();

		$url = "http://gdata.youtube.com/feeds/api/standardfeeds".$n."/most_viewed";
		$feedURL = $url . "?time=".$time."&max-results=".$maxresults . "&start-index=" . $startindex;

		$feed = $youTubeService->getVideoFeed($feedURL);
		
		$entries = ZendParseEntries($feed);
	
		$items = array();
	
		foreach ($entries as $entry) 
		{
			$url = $entry['url'];
			$title = $entry['title'];
			$thumbnail = $entry['thumbnail'];
	
			if (strlen($entry['desc']) > 200)
				$desc = substr(strip_tags($entry['desc']),0,200) . " ...";
			else
				$desc = $entry['desc'];

			$author = $entry['author'];
			$length = $entry['length']; 
			$views = $entry['views']; 
			$rating = $entry['rating']; 
			$published= $entry['published']; 
			$keywords = $entry['keywords']; 
			$vid = $entry['vid']; 
	
			$item = array(
				'url' => $url,
				'title' => $title,
				'thumbnail' => $thumbnail,
				'desc' => $desc,
				'author' => $author,
				'length' => $length,
				'published' => $published,
				'views' => $views,
				'vid' => $vid,
				'keywords' => $keywords,
				'rating' => $rating
			);
	
			array_push($items,$item);
		}

//		p($items);
//		return;
	
		$et = microtime_f();
	
		writeLog('youtube.php - mostviewed: ' . floatval($et - $st) . ' ms');
	
		ob_start("ob_gzhandler");
		echo json_encode(array('num'=>count($items),'items'=>$items));
	}

	function mostpopular($time = '',$start = 0,$lang)
	{
		$st = microtime_f();
	
//		$maxresults = 18;
		$maxresults = 30;
		$startindex = ($maxresults * $start) + 1;
	
		if (!isset($time))
			$time = 'today';

		switch ($lang)
		{
			case 0: 
				$n = '';
				break;		
			case 1: 
				$n = '';
				break;		
			case 2: 
				$n = '/IT';
				break;		
			case 3: 
				$n = '/FR';
				break;		
			case 4: 
				$n = '/DE';
				break;		
			case 5: 
				$n = '/ES';
				break;		
			case 6: 
				$n = '/JP';
				break;		
		}


		$youTubeService = new Zend_Gdata_YouTube();

		$url = "http://gdata.youtube.com/feeds/api/standardfeeds".$n."/most_popular";

		$feedURL = $url . "?time=".$time."&max-results=".$maxresults . "&start-index=" . $startindex;

		$feed = $youTubeService->getVideoFeed($feedURL);
		
		$entries = ZendParseEntries($feed);
	
		$items = array();
	
		foreach ($entries as $entry) 
		{
			$url = $entry['url'];
			$title = $entry['title'];
			$thumbnail = $entry['thumbnail'];
	
			if (strlen($entry['desc']) > 200)
				$desc = substr(strip_tags($entry['desc']),0,200) . " ...";
			else
				$desc = $entry['desc'];

			$author = $entry['author'];
			$length = $entry['length']; 
			$views = $entry['views']; 
			$rating = $entry['rating']; 
			$published= $entry['published']; 
			$keywords = $entry['keywords']; 
			$vid = $entry['vid']; 
	
			$item = array(
				'url' => $url,
				'title' => $title,
				'thumbnail' => $thumbnail,
				'desc' => $desc,
				'author' => $author,
				'length' => $length,
				'published' => $published,
				'views' => $views,
				'vid' => $vid,
				'keywords' => $keywords,
				'rating' => $rating
			);
	
			array_push($items,$item);
		}
	
		$et = microtime_f();
	
		writeLog('youtube.php - mostviewed: ' . floatval($et - $st) . ' ms');
	
		ob_start("ob_gzhandler");
		echo json_encode(array('num'=>count($items),'items'=>$items));
	}

	function search($search,$start = 0,$lang)
	{
		$st = microtime_f();
	
		$maxresults = 18;
	
//		$searchURL = "http://gdata.youtube.com/feeds/api/videos?q=".$search."&orderby=relevance&max-results=".$maxresults."&lr=it";
//		$sxml = simplexml_load_file($searchURL);
//		$entries = parseEntries1($sxml->entry);

		$youTubeService = new Zend_Gdata_YouTube();
		$query = $youTubeService->newVideoQuery();
		$startindex = $maxresults * ($start);
		$query->setStartIndex($startindex);
		$query->setMaxResults($maxresults);
		$query->setQuery($search);
		$query->orderBy = 'relevance';


		switch ($lang)
		{
			case 0: 
				$n = '';
				break;		
			case 1: 
				$n = '';
				break;		
			case 2: 
				$n = '&lr=it';
				break;		
			case 3: 
				$n = '&lr=fr';
				break;		
			case 4: 
				$n = '&lr=de';
				break;		
			case 5: 
				$n = '&lr=es';
				break;		
			case 6: 
				$n = '&lr=ja';
				break;		
		}


		$feedURL = $query->getQueryUrl() . $n;
//		$feedURL = $query->getQueryUrl();

//		$feed = $youTubeService->getVideoFeed($query);
		$feed = $youTubeService->getVideoFeed($feedURL);

		$entries = ZendParseEntries($feed);

		$items = array();
	
		foreach ($entries as $entry) 
		{
			$url = $entry['url'];
			$title = $entry['title'];
			$thumbnail = $entry['thumbnail'];
	
			$desc = $entry['desc'];
			$author = $entry['author'];
			$length = $entry['length']; 
			$rating = $entry['rating']; 
			$published= $entry['published']; 
			$keywords = $entry['keywords']; 
			$vid = $entry['vid']; 
	
			$item = array(
				'url' => $url,
				'title' => $title,
				'thumbnail' => $thumbnail,
				'desc' => $desc,
				'author' => $author,
				'length' => $length,
				'published' => $published,
				'keywords' => $keywords,
				'vid' => $vid,
				'rating' => $rating
			);
	
			array_push($items,$item);
		}

//		p($items);
//		return;
	
		$et = microtime_f();
	
		writeLog('youtube.php - search of '.$search.' : ' . floatval($et - $st) . ' ms');
	
		ob_start("ob_gzhandler");
		echo json_encode(array('num'=>count($items),'items'=>$items));
	}

	function tag($tag)
	{
		$st = microtime_f();
	
		$maxresults = 12;
	
		$searchURL = "http://gdata.youtube.com/feeds/api/videos/-/".$tag."?orderby=relevance&max-results=".$maxresults."&lr=it";
	
		$sxml = simplexml_load_file($searchURL);
		$entries = parseEntries1($sxml->entry);
	
		$items = array();
	
		foreach ($entries as $entry) 
		{
			$url = $entry['url'];
			$title = $entry['title'];
			$thumbnail = $entry['thumbnail'];
	
			$desc = $entry['desc'];
			$author = $entry['author'];
			$length = $entry['length']; 
			$rating = $entry['rating']; 
			$published= $entry['published']; 
			$keywords = $entry['keywords']; 
			$vid = $entry['vid']; 
	
			$item = array(
				'url' => $url,
				'title' => $title,
				'thumbnail' => $thumbnail,
				'desc' => $desc,
				'author' => $author,
				'length' => $length,
				'published' => $published,
				'keywords' => $keywords,
				'vid' => $vid,
				'rating' => $rating
			);
	
			array_push($items,$item);
		}
	
		$et = microtime_f();
	
		writeLog('youtube.php - search of '.$search.' : ' . floatval($et - $st) . ' ms');
	
		ob_start("ob_gzhandler");
		echo json_encode(array('num'=>count($items),'items'=>$items));
	}

	function related($vid)
	{
		try
		{
			$st = microtime_f();
		
			$maxresults = 12;

			$youTubeService = new Zend_Gdata_YouTube($client);
			$feed = $youTubeService->getRelatedVideoFeed($vid);
			$entries = ZendParseEntries($feed);

//			echo "<pre>";
//			print_r($entries);
//			echo "</pre>";


			$items = array();
		
			foreach ($entries as $entry) 
			{
				$url = $entry['url'];
				$title = $entry['title'];
				$thumbnail = $entry['thumbnail'];
		
				$desc = $entry['desc'];
				$author = $entry['author'];
				$length = $entry['length']; 
				$rating = $entry['rating']; 
				$published= $entry['published']; 
				$keywords = $entry['keywords']; 
				$vid = $entry['vid']; 
				$views = $entry['views']; 
		
				$item = array(
					'url' => $url,
					'title' => $title,
					'thumbnail' => $thumbnail,
					'desc' => $desc,
					'author' => $author,
					'length' => $length,
					'published' => $published,
					'vid' => $vid,
					'views' => $views,
					'keywords' => $keywords,
					'rating' => $rating
				);
		
				array_push($items,$item);
			}
		
			$et = microtime_f();
		
			writeLog('youtube.php - search of '.$search.' : ' . floatval($et - $st) . ' ms');
		
			ob_start("ob_gzhandler");
			echo json_encode(array('num'=>count($items),'items'=>$items));
		}
		catch (Zend_Gdata_App_Exception $e)
		{
			echo json_encode(array('num'=>0));
		}
	}

	function getVideo($video_id) 
	{
		$debug = true;
//		$url = "http://it.youtube.com/watch?v=".$video_id;
		$url = "http://www.youtube.com/watch?v=".$video_id;

		$req =& new HTTP_Request($url,array('allowRedirects'=>true));
		$req->addHeader('Host','www.youtube.com');
		$req->addHeader('User-Agent','Mozilla/5.0 (X11; U; Linux x86_64; en-US; rv:1.9.0.8) Gecko/2009032712 Ubuntu/8.10 (intrepid) Firefox/3.0.8');

//		echo "<pre>";
//		print_r($req);
//		echo "</pre>";

		$response = $req->sendRequest();

		if (PEAR::isError($response)) 
		{
//			echo $response->getMessage()."\n";
			echo json_encode(array('video'=>null));
		} 
		else 
		{
			$page = $req->getResponseBody();

			preg_match('~var isHDAvailable = (.*?);~', $page, $match);
			$isHDAvailable = $match[1];

			preg_match('/"video_id": "(.*?)"/', $page, $match);
			$var_id = $match[1];

			preg_match('/"t": "(.*?)"/', $page, $match);
			$var_t = $match[1];
	
			$url = "";
			$url .= $var_id;
			$url .= "&t=";
			$url .= $var_t;
			
			if ($isHDAvailable == 'true')
			{
/*				$fmt = 37;*/
				$fmt = 22;
				$bt = "&bitrate=2000";
			}
			else
			{
				$fmt = 18;
				$bt = '';
			}				

			$v = "http://www.youtube.com/get_video?fmt=".$fmt."&video_id=".$url.$bt;
			$ch = curl_init();

			curl_setopt($ch, CURLOPT_URL, $v);
			curl_setopt($ch, CURLOPT_NOBODY, true);
			curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
			
			curl_exec($ch);
			$info = curl_getinfo($ch);

/*			
			if ($fmt == 37 && $info['http_code'] == '404')
			{
				$fmt = 22;
				$v = "http://www.youtube.com/get_video?fmt=".$fmt."&video_id=".$url.$bt;

				curl_setopt($ch, CURLOPT_URL, $v);
				curl_exec($ch);
				$info = curl_getinfo($ch);				
			}	
*/
			echo json_encode(array('video'=>$info['url'],'type'=>$fmt));
//			echo json_encode(array('video'=>$v));

			writeLog('youtube.php - video url : ' . $info['url'] . ' format: ' . $fmt);
		}
	
	}	

}

$tube = new Youtube();	

if ($_REQUEST['action'] == 'startpage')
{
	if (isset($_REQUEST['numvideos']))
		$nv = $_REQUEST['numvideos'];
	else
		$nv = 3;

	$tube->startpage($_REQUEST['language'],$nv);
}
else if ($_REQUEST['action'] == 'newstartpage')
{
	if (isset($_REQUEST['numvideos']))
		$nv = $_REQUEST['numvideos'];
	else
		$nv = 3;

	$tube->newstartpage($_REQUEST['language'],$nv);
}
else if ($_REQUEST['action'] == 'newstartpage1')
{
	if (isset($_REQUEST['numvideos']))
		$nv = $_REQUEST['numvideos'];
	else
		$nv = 3;

	$tube->newstartpage1($_REQUEST['language'],$nv);
}
else if ($_REQUEST['action'] == 'checkcredentials')
{
	$tube->checkCredentials($_REQUEST['username'],$_REQUEST['password']);
}
else if ($_REQUEST['action'] == 'playlist')
{
	$tube->playlist();
}
else if ($_REQUEST['action'] == 'playlists')
{
	$mine = false;
	if (isset($_REQUEST['mine']))
		$mine = true;
			
	$tube->userplaylists($_REQUEST['username'],$_REQUEST['password'],$mine);
}
else if ($_REQUEST['action'] == 'userprofile')
{
	$mine = false;
	if (isset($_REQUEST['mine']))
		$mine = true;
	
	$tube->userprofile($_REQUEST['username'],$mine);
}
else if ($_REQUEST['action'] == 'usersubscriptions')
{
	$mine = false;
	if (isset($_REQUEST['mine']))
		$mine = true;
		
	$tube->usersubscriptions($_REQUEST['username'],$_REQUEST['password'],$mine);
}
else if ($_REQUEST['action'] == 'useruploads')
{
	$mine = false;
	if (isset($_REQUEST['mine'])) { $mine = true; }

	$tube->useruploads($_REQUEST['username'],$_REQUEST['password'],$mine);
}
else if ($_REQUEST['action'] == 'userfavorites')
{
	$mine = false;
	if (isset($_REQUEST['mine']))
		$mine = true;
		
	$tube->userfavorites($_REQUEST['username'],$_REQUEST['password'],$mine);
}
else if ($_REQUEST['action'] == 'related')
{
	$tube->related($_REQUEST['vid']);
}
else if ($_REQUEST['action'] == 'toprated')
{
	if (isset($_REQUEST['start']))
		$start = $_REQUEST['start'];
	else
		$start = 0;

	$tube->toprated($_REQUEST['time'],$start,$_REQUEST['language']);
}
else if ($_REQUEST['action'] == 'mostviewed')
{
	if (isset($_REQUEST['start']))
		$start = $_REQUEST['start'];
	else
		$start = 0;

	$tube->mostviewed($_REQUEST['time'],$start,$_REQUEST['language']);
}
else if ($_REQUEST['action'] == 'mostpopular')
{
	if (isset($_REQUEST['start']))
		$start = $_REQUEST['start'];
	else
		$start = 0;

	$tube->mostpopular($_REQUEST['time'],$start,$_REQUEST['language']);
}
else if ($_REQUEST['action'] == 'search')
{
	if (isset($_REQUEST['start']))
		$start = $_REQUEST['start'];
	else
		$start = 0;

	$search = implode('+',explode(' ',$_REQUEST['q']));
	$tube->search($search,$start,$_REQUEST['language']);
}
else if ($_REQUEST['action'] == 'tag')
{
	$tag= implode('+',explode(' ',$_REQUEST['tag']));
	$tube->search($tag);
}
else if ($_REQUEST['action'] == 'getvideo')
{
	$tube->getVideo($_REQUEST['vid']);
}
else if ($_REQUEST['action'] == 'getvideoid')
{
	$tube->getVideoEntry($_REQUEST['vid']);
}
else if ($_REQUEST['action'] == 'addtofavorites')
{
	$tube->addtofavorites($_REQUEST['vid']);
}
?>
