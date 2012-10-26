function getYoutubeVideo(uid) 
{
	if (uid == undefined || uid == null) return; 

	try
	{
		var url = decodeURIComponent(getYoutubeVideoByScraping(uid));
		return url;
	}
	catch(e)
	{
		TVB.error(e);
		return undefined;
	}
}

function getYoutubeVideoByGetInfo(videoId) 
{
	try 
	{
		var vid1 = videoId.split('&');
		videoId = vid1[0];
		var req = new HTTPRelay();
		TVB.log("http://www.youtube.com/get_video_info?&video_id=" + videoId);
		var res = req.get("http://www.youtube.com/get_video_info?&video_id=" + videoId);

		var ures = unescape(res);
		var urls = ures.split("fmt_stream_map")[1];

		if(res.search(",37%7C") !== -1)
		{
			urls = urls.split("37|")[1];
			url = urls.split("||")[0];
		}
		else if(res.search(",22%7C") !== -1){
			urls = urls.split("22|")[1];
			url = urls.split("||")[0];
		}
		else if(res.search(",18%7C") !== -1)
		{
			urls = urls.split("18|")[1];
			url = urls.split("||")[0];
		}
		else if(res.search(",36%7C") !== -1)
		{
			urls = urls.split("36|")[1];
			url = urls.split("||")[0];
		}
		else if(res.search(",34%7C") !== -1){
			urls = urls.split("34|")[1];
			url = urls.split("||")[0];
		}
		else
		{
			TVB.log("Impossible to get youtube url using Youtube Info... passing URL to scraper");
			return null;
		}

		return url;

	} 
	catch (e) 
	{
		TVB.error(e);
		return null;
	}
}

function getYoutubeVideoByScraping(vid){
	try 
	{
		var vid1 = vid.split('&');
		var v1 = vid1[0];

		var req = new HTTPRelay();
		var res = req.get('http://www.youtube.com/watch?v='+v1);
		var htmlFive = false;
		if (res.search("html5-player") !== -1)
		{
			htmlFive = true;
		}

		if (!htmlFive) 
		{
//			TVB.log('FOUND HTML 5 PAGE');

			formatURLMap = res.split("url_encoded_fmt_stream_map=")[1].split("&")[0];

			// replace HTML encodings
			formatURLMap = unescape(formatURLMap);
			formatURLMap = formatURLMap.replace(/%2C/g, ",");
			formatURLMap = formatURLMap.replace(/%2F/g, "/");
			formatURLMap = formatURLMap.replace(/%3A/g, ":");
			formatURLMap = formatURLMap.replace(/%3F/g, "?");
			formatURLMap = formatURLMap.replace(/%3D/g, "=");

/*************************************************************************************************************/
			var formats = new Array();
			var formatNumbers = new Array();

			var formatURLMapArray = formatURLMap.split(",");

			for (var i = 0; i < formatURLMapArray.length-1; i++) {
				var formatURLSArray = formatURLMapArray[i].split('url=');

				if (formatURLSArray[1] != undefined) {
					var y = formatURLSArray[1];
					formatNumbers.push([parseInt(y.split('itag=')[1],10), null]);
					formats.push([parseInt(y.split('itag=')[1],10),y ]);
				}
			}

			// add other formats to array
			for (var i = 0; i < formats.length; i++) 
			{
				if(formats[i][0] == "37"){
					var url = formats[i][1];
//					TVB.log('URL 37: ' + url);
					return url;
				}
				else if(formats[i][0] == "22"){
					var url = formats[i][1];
//					TVB.log('URL 22: ' + url);
					return url;
				}
				else if(formats[i][0] == "18"){
					var url = formats[i][1];
//					TVB.log('URL 18: ' + url);
					return url;
				}
				else if(formats[i][0] == "36"){
					var url = formats[i][1];
//					TVB.log('URL 36: ' + url);
					return url;
				}
				else
				{
					continue;
				}
			}
		}
		else
		{
//			TVB.log('FOUND HTML 4 PAGE');

			var formats = res.split('videoPlayer.setAvailableFormat("');

			// remove first piece, doesn't relate to formats
			formats.splice(0, 1);

			// clean up formats
			for (var i = 0; i < formats.length; i++) {
				formats[i] = formats[i].split('");')[0];
				formats[i] = formats[i].split('", "');
			}

			for (var i = 0; i < formats.length; i++) {
				var videoURL = formats[i][0];
				if(formats[i][3] === "37")
				{
					var url = formats[i][1];
					return url;

				}
				else if(formats[i][3] === "22")
				{
					var url = formats[i][1];
					return url;

				}
				else if(formats[i][3] === "18"){
					var url = formats[i][1];
					return url;

				}
				else if(formats[i][3] === "36"){
					var url = formats[i][1];
					return url;
				}
				else
				{
					continue;
				}
			}

		}
		return null;
	} 
	catch (e) 
	{
		TVB.error(e);
		return null;
	}
}
