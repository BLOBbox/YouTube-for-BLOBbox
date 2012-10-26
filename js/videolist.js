var mainStatus;
var currentStatus = [];

var videolist = {
		category: "mostpopular",
		url: undefined,
		username: undefined,
		title: undefined,
		times: "today",
		old_time: "today",
		currentStart : 0,
		
		enter: function(category,url,title)
		{
			document.getElementById("videolist").style.display = "";

			switch(category)
			{
				case "piuvisti":
					videolist.category = "mostviewed";
					break;
				case "piuvotati":
					videolist.category = "toprated";
					break;
				case "popolari":
					videolist.category = "mostpopular";
					break;
				case "myplaylists":
					videolist.category = "myplaylists";
					break;
				case "myfavorites":
					videolist.category = "myfavorites";
					break;
				case "myvideos":
					videolist.category = "myvideos";
					break;
				case "mychannels":
					videolist.category = "mychannels";
					break;
				case "useruploads":
					videolist.category = "useruploads";
					videolist.username = url;
					break;
				case "playlist":
					videolist.category = "playlist";
					videolist.url = url;
					videolist.title = title;
					break;
			}

			_gaq.push(['_trackEvent',getCategoryForAnalytics(category), "Lista" ]);

			TVB.remote.disableBack();
			TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.BACK);
		    TVB.CustomEvent.subscribeEvent(TVB.remote.button.BACK, videolist.backhandler);
		    this.draw();
		},

		backhandler: function()
		{
			TVB.log('Youtube: Exit from videolist');

			if (videolist.category == 'playlist')
			{
				videolist.exitnohome();	
				videolist.enter('myplaylists');
			}
			else if (videolist.category == 'useruploads')
			{
				videolist.exitnohome();	
				videolist.enter('mychannels');
			}
			else
			{
				videolist.exit();	
			}
		},
		
		exitnohome: function()
		{
			currentStatus[videolist.category] = 
			{
				currentPage: mainStatus.myMenu.getCurrentPage(),
				currentLine: mainStatus.myMenu.getCurrentLine()
			};

			resetMenu();

			try
			{
				$("frecciagiu").style.display = "none";
				$("frecciasx").style.display = "none";
				$("frecciadx").style.display = "none";
			}
			catch (e) {}

			TVB.log(currentStatus);

			try
			{
				if ($("videolistmenubar"))
				{
					TVB.system.deleteElementById("videolistmenubar");
				}
			}
			catch(e)
			{
				TVB.exception(e);	
			}
		},
		
		exit: function()
		{
			try
			{
				resetMenu();
				if ($("videolistmenubar"))
				{
					TVB.system.deleteElementById("videolistmenubar");
				}
			}
			catch(e)
			{
				TVB.exception(e);	
			}

			document.getElementById("videolist").style.display = "none";
			home.enter();
		},
		
		draw: function()
		{
			try
			{
				hl_loading.show();
				$("frecciagiu").style.display = "none";

				$('videolistcont').innerHTML = '';

				this.drawMenu();

				var json = this.getList(videolist.category, videolist.times, videolist.currentStart);

				if (json.num == 0)
				{
					if (videolist.category == "myplaylists")
					{
						$('videolistcont').innerHTML = "<p>"+locales.nessunaplaylist+"</p>";
					}
					else if (videolist.category == "myfavorites")
					{
						$('videolistcont').innerHTML = "<p>"+locales.nessunfavorito+"</p>";
					}
					else if (videolist.category == "myvideos")
					{
						$('videolistcont').innerHTML = "<p>"+locales.nessunmiovideo+"</p>";
					}
					else if (videolist.category == "mychannels")
					{
						$('videolistcont').innerHTML = "<p>"+locales.nessunmiocanale+"</p>";
					}
				}
				else
				{
					var items= json.items;

					mainStatus = new Object();
					mainStatus.totalElem = items.length;
					mainStatus.menuType = this.times;
		
					mainStatus.data = [];
						
					for (var i in items) 			
					{
						mainStatus.data.push(items[i]);
					}
									
					drawMainMenu();

					setTimeout(function(){
						videolistonclickcb(document.getElementById(videolist.old_time));
					},500);
					TVB.remote.enableLeftRight();
					TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.RIGHT);
				    TVB.CustomEvent.subscribeEvent(TVB.remote.button.RIGHT, menuController.right);
				    TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.LEFT);
				    TVB.CustomEvent.subscribeEvent(TVB.remote.button.LEFT, menuController.left);
				}
				
				this.old_time = this.times;
				hl_loading.remove();

				$("frecciagiu").style.display = "block";
			}
			catch(e)
			{
				TVB.exception(e);
				hl_loading.remove();
			}
		},
		
		drawMenu: function()
		{
			if (videolist.category == "mostviewed" || videolist.category == "toprated" || videolist.category == "mostpopular")
			{
				var html = '';
				html += '<div id="frecciasx"></a></div>';
				html += '<ul id="videolistmenubar" class="menubar" >';
				html += '<li><a highlight="false" onclick="videolistonclickcb(this);videolist.redraw();" class="videolistmenu" onblur="videolistonblurcb(this);return false;" onfocus="videolistonfocuscb(this);return false;" navigatedown="hf" navigateleft="sempre" id="today">'+locales.oggi+'</a></li>';
				html += '<li><a highlight="false" onclick="videolistonclickcb(this);videolist.redraw();" class="videolistmenu"   onblur="videolistonblurcb(this);return false;" onfocus="videolistonfocuscb(this);return false;" navigatedown="hf" id="this_week">'+locales.settimana+'</a></li>';
				html += '<li><a highlight="false" onclick="videolistonclickcb(this);videolist.redraw();" class="videolistmenu"  onblur="videolistonblurcb(this);return false;" onfocus="videolistonfocuscb(this);return false;"navigatedown="hf" id="this_month">'+locales.mese+'</a></li>';
				html += '<li><a highlight="false" onclick="videolistonclickcb(this);videolist.redraw();" class="videolistmenu"  onblur="videolistonblurcb(this);return false;" onfocus="videolistonfocuscb(this);return false;" navigateright="sempre" navigatedown="hf" id="all_time">'+locales.sempre+'</a></li>';
				html += '<li><a highlight="false" onblur="" onfocus="videolist.enterOld()" navigateright="sempre" id="hf"></a></li></ul>';
				html += '<div id="frecciadx"></a></div>';
				
				document.getElementById("videolistmenu").innerHTML = html;
			}
			else
			{
				if (videolist.category == "myplaylists")
				{
					document.getElementById("videolistmenu").innerHTML = "<h2>"+locales.titlemieplaylist+"</h2>";
				}
				else if (videolist.category == "myfavorites")
				{
					document.getElementById("videolistmenu").innerHTML = "<h2>"+locales.titlemieipreferiti+"</h2>";
				}
				else if (videolist.category == "myvideos")
				{
					document.getElementById("videolistmenu").innerHTML = "<h2>"+locales.titlemieivideo+"</h2>";
				}
				else if (videolist.category == "mychannels")
				{
					document.getElementById("videolistmenu").innerHTML = "<h2>"+locales.titlemieicanali+"</h2>";
				}
				else if (videolist.category == "playlist")
				{
					document.getElementById("videolistmenu").innerHTML = "<h2>"+locales.titlemieplaylist+" - "+videolist.title+"</h2>";
				}
				else if (videolist.category == "useruploads")
				{
					document.getElementById("videolistmenu").innerHTML = "<h2>"+locales.canaledi.replace('%USERNAME%',videolist.username) +"</h2>";
				}
				else
				{
					document.getElementById("videolistmenu").innerHTML = "";
				}
			}
		},
		
		getList: function(category, times, currentStart)
		{
			var req = new HTTPRelay();
			var res = undefined;

			if (category == 'myplaylists')
			{
				res = req.get(clientLocation + '/youtube.php?action=playlists&mine=true&username='+youtubeusername+'&password='+youtubepassword+'&start='+currentStart+'&language=' + youtubelanguage);
			}
			else if (category == 'myfavorites')
			{
				res = req.get(clientLocation + '/youtube.php?action=userfavorites&mine=true&username='+youtubeusername+'&password='+youtubepassword+'&start='+currentStart);
			}
			else if (category == 'myvideos')
			{
				res = req.get(clientLocation + '/youtube.php?action=useruploads&mine=true&username='+youtubeusername+'&password='+youtubepassword+'&start='+currentStart);
			}
			else if (category == 'mychannels')
			{
				res = req.get(clientLocation + '/youtube.php?action=usersubscriptions&mine=true&username='+youtubeusername+'&password='+youtubepassword+'&start='+currentStart);
			}
			else if (category == 'useruploads')
			{
				res = req.get(clientLocation + '/youtube.php?action=useruploads&username='+videolist.username+'&start='+currentStart);
			}
			else if (category == 'playlist')
			{
				res = req.get(clientLocation + '/youtube.php?action=playlist&username='+youtubeusername+'&password='+youtubepassword+'&playlistid=' + videolist.url);
			}
			else
			{
				res = req.get(clientLocation + '/youtube.php?action=' + category + '&time=' + times+ '&start='+currentStart+'&language=' + youtubelanguage);
			}

			return TVB.json.parse(res);
		},
		
		redraw: function()
		{
			$("frecciagiu").style.display = "none";
			if(videolist.old_time !== videolist.times){
				document.getElementById(videolist.old_time).style.color = "#656565";
				document.getElementById(videolist.old_time).style.backgroundPosition = "0 -30px";;
				$('videolistcont').innerHTML = '';
				hl_loading.show();
				videolist.currentStart = 0;
				setTimeout(function(){
					var json = videolist.getList(videolist.category, videolist.times, videolist.currentStart);
					var items= json.items;
					mainStatus.totalElem = items.length;
					mainStatus.data = [];
		
					for (var i in items)
					{
						mainStatus.data.push(items[i]);
						var config = mainStatus.data[i];
					}
					hl_loading.remove();
					mainStatus.myMenu.currentPage = 0;
					mainStatus.myMenu.currentElement = 0;
					mainStatus.myMenu.changeElementNumber(items.length);
		
					$('videolistcont').innerHTML = '';
					$('videolistcont').appendChild(mainStatus.myMenu.menuDiv);
					
					mainStatus.myMenu.setFocus(0);
					TVB.remote.enableOk();
					TVB.remote.enableUpDown();
					videolist.old_time = videolist.times;
					$("frecciagiu").style.display = "block";
				},250);
			}else{
				mainStatus.myMenu.setFocus(mainStatus.myMenu.currentElement);
				TVB.remote.enableOk();
				TVB.remote.enableUpDown();
			}
				
		},
		
		enterOld: function(){
			videolistonblurcb(document.getElementById(videolist.times));
			switch(videolist.old_time){
			case "today":
				menuController.actual = 0;
				break;
			case "this_week":
				menuController.actual = 1;
				break;
			case "this_month":
				menuController.actual = 2;
				break;
			case "all_time":
				menuController.actual = 3;
				break;
			}
			videolistonclickcb(document.getElementById(videolist.old_time));
			mainStatus.myMenu.setFocus(mainStatus.myMenu.currentElement);
			TVB.remote.enableOk();
			TVB.remote.enableUpDown();
		}
		
}

var menuController ={
	actual : 0,
	timeout: null,
	
	
	left: function(){
		clearTimeout(menuController.timeout);
		TVB.log("left " + menuController.actual);
		var idToBlur = 'TVBLOB_' +  mainStatus.myMenu.menuName + '_' +  mainStatus.myMenu.currentElement;
		mainStatus.myMenu.onBlurCB(document.getElementById(idToBlur), mainStatus.myMenu.currentElement);
		TVB.remote.disableOk();
		TVB.remote.disableUpDown();
	
		switch(menuController.actual){
		case 0:
			videolist.times = "all_time";
			document.getElementById("all_time").focus();
			break;
			
		case 1:
			videolist.times = "today";
			document.getElementById("today").focus();
			break;
			
		case 2:
			videolist.times = "this_week";
			document.getElementById("this_week").focus();
			break;
			
		case 3:
			videolist.times = "this_month";
			document.getElementById("this_month").focus();
			break;
		
		}
		menuController.actual--;
		if(menuController.actual < 0)
			menuController.actual = 3;
	},
	
	right: function(){
		clearTimeout(menuController.timeout);

		var idToBlur = 'TVBLOB_' +  mainStatus.myMenu.menuName + '_' +  mainStatus.myMenu.currentElement;
		mainStatus.myMenu.onBlurCB(document.getElementById(idToBlur), mainStatus.myMenu.currentElement);
		TVB.remote.disableOk();
		TVB.remote.disableUpDown();
		
		switch(menuController.actual){
			case 0:
				videolist.times = "this_week";
				document.getElementById("this_week").focus();
				break;
				
			case 1:
				videolist.times = "this_month";
				document.getElementById("this_month").focus();
				break;
				
			case 2:
				videolist.times = "all_time";
				document.getElementById("all_time").focus();
				break;
				
			case 3:
				videolist.times = "today";
				document.getElementById("today").focus();
				break;
		}
		menuController.actual++;
		if(menuController.actual > 3)
		{
			menuController.actual = 0;
		}
	}
}

function resetMenu()
{
	try
	{
		if (mainStatus.myMenu !== undefined && mainStatus.myMenu !== null) 
		{
			mainStatus.myMenu.deactivate();
		}
	}
	catch (e) 
	{
		TVB.log('Youtube: no menu found');
	}
}

function drawMainMenu() 
{
	try 
	{
		document.getElementById("videolist").style.display = "";

		mainStatus.menuConfig = 
		{
			menuName: 'mainMenu',
			visibleElements: 3,
			numElements: mainStatus.totalElem,
			updateMode: 'manipulate',
			disableLeftRight: true,
			menuType: 'dynamic',
			drawSingleLineCB: function(line) 
			{
				var config = mainStatus.data[line];
				return drawSingleRow(config,line);
			},
			onSelectCB: function(line) 
			{
				try
				{
					hp_loading.show($('TVBLOB_mainMenu_' + line));

					var vid = mainStatus.data[line].vid;
		
					if (videolist.category == 'myplaylists')
					{
						var url = mainStatus.data[line].url;
						var title = mainStatus.data[line].title;
						TVB.log("Youtube: View playlist: " + url);
						videolist.exitnohome();
						videolist.enter('playlist',url,title);
					}
					else if (videolist.category == 'mychannels')
					{
						var user = mainStatus.data[line].author;
						videolist.exitnohome();
						videolist.enter('useruploads',user);
					}
					else
					{
						if (mainStatus.data[line].length !== null)
						{
							var newuri = getYoutubeVideo(vid);
							TVB.log('Youtube: URL to play: ' + newuri);

							_gaq.push(['_trackEvent',getCategoryForAnalytics(videolist.category),'Playback da lista',mainStatus.data[line].title]);

							tvblob.playURI(newuri,escapeHtmlEntities(mainStatus.data[line].title),mainStatus.data[line].desc);
						}
						else
						{
							TVB.widget.messageBar(locales.errornoplay);
							hp_loading.remove();
						}
					}

//					hl_loading.remove();
					hp_loading.remove();
				}
				catch(e)
				{
					TVB.exception(e);
					TVB.widget.messageBar(locales.errornoplay);
					hp_loading.remove();
				}
			},
			onFocusCB: function(obj, line) 
			{
				try
				{
					if (obj)
					{
						obj.className = "riga_selected";
					}
				}
				catch (e)
				{
					TVB.error("Youtube: onFocusCB " + e);
				}
			},
			onBlurCB: function(obj, line) 
			{
				try
				{
					if (obj)
					{
						obj.className = "riga";
					}
				}
				catch (e)
				{
					TVB.error("Youtube: onBlurCB " + e);
				}
			},
			onUpdateCB: function(obj, line) 
			{
				TVB.log("Youtube: updating line " + line);
			},
			onRemoteUpdateCB: function(dir) 
			{
				if (currentPage === 'playlist') 
				{
					return;
				}
		
				$("frecciagiu").style.display = "none";
				
				TVB.log("Youtube: gathering next set of results");

				if (videolist.currentStart === 0 && dir === 1) 
				{
					mainStatus.myMenu.currentPage = 0;
					mainStatus.myMenu.setFocus(0);
					return;
				}

				$('videolistcont').innerHTML = '';
				hl_loading.show();
				
				if (dir == 0) 
				{
					videolist.currentStart++;
				}
				else if (dir == 1) 
				{
					if (videolist.currentStart != 0) 
					{
						videolist.currentStart--;
					}
				}
				
				var json = videolist.getList(videolist.category, videolist.times, videolist.currentStart);
				var items= json.items;
				mainStatus.totalElem = items.length;
				mainStatus.data = [];

				for (var i in items)
				{
					mainStatus.data.push(items[i]);
					var config = mainStatus.data[i];
				}

				if (dir == 0) 
				{
					mainStatus.myMenu.currentPage = 0;
				}
				else if (dir == 1) 
				{
					mainStatus.myMenu.currentPage = parseInt(mainStatus.myMenu.getTotalPages() - 1);
				}

				mainStatus.myMenu.currentElement = 0;
				mainStatus.myMenu.changeElementNumber(items.length);

				$('videolistcont').innerHTML = '';
				hl_loading.remove();
				$('videolistcont').appendChild(mainStatus.myMenu.menuDiv);
				if (dir == 0) 
				{
					mainStatus.myMenu.setFocus(0);
				}
				else if (dir == 1) 
				{
					mainStatus.myMenu.setFocus(items.length - 1);
				}
	
				$("frecciagiu").style.display = "block";
						
			}
		};

		if (mainStatus.totalElem == undefined) 
		{
			mainStatus.menuConfig.numElements = 0;
		}
		else 
		{
			mainStatus.myMenu = new TVB.menu(mainStatus.menuConfig);
		}

		hl_loading.remove();
		$('videolistcont').appendChild(mainStatus.myMenu.get());
	} 
	catch (e) 
	{
		TVB.exception(e.message);
	}
}

function drawSingleRow(config,numline) 
{
	try 
	{
		var container = document.createElement('div');

		if (config.views == undefined) 
		{
			var views = '';
		}
		else 
		{
			var views = ' ' + config.views + ' visualizzazioni - ';
		}

		var text = '<div id="itemdiv_'+numline+'" class="itemdiv">';

		if (config.length !== undefined && config.length !== null)
		{
			var len = config.length;
			var min = Math.floor(len/60);
			var secs = parseFloat(len % 60).toFixed().pad(2,"0");
			text += '<span class="len grey">['+min+':'+secs+']</span>';
		}

		text += '<span id="thumb_'+numline+'"></span>';
		text += '<div class="textdiv">';

		if (videolist.category == "myplaylists") 
		{
			text += config.title;
		}
		else if (videolist.category == 'mychannels')
		{
			text += locales.videodi + ' ' + config.author;
		}
		else if (config.length == null)
		{
			text += config.title.trim(45, '...') + ' ('+locales.videorimosso+')';
		}
		else 
		{
			text += config.title.trim(60, '...') ;
		}

		text += '</div>';

		if (config.author !== null)
		{
			text += '<div class="foot">';
			text += '<span class="white">'+views + '' + config.author + '</span>';
			text += '</div>';
		}

		text += '</div>';

		var ts = setTimeout(function()
			{
				try
				{
					if ($('thumb_' + numline) != undefined) 
					{
						if (config.thumbnail !== undefined && config.thumbnail !== null)
						{
							$('thumb_' + numline).innerHTML = '<img width="128" height="96" class="thumb" src="' + config.thumbnail + '"/>';
						}
						else
						{
							$('thumb_' + numline).innerHTML = '<img width="128" height="96" class="thumb" src="http://static.tvblob.com/img/youtube/genericvideo_icon.png"/>';
						}
					}

					clearTimeout(ts);
				}
				catch(e)
				{
					TVB.exception(e);
				}
			},600);

		container.innerHTML = text;
		container.className = 'riga';

		return container;
	} 
	catch (e) 
	{
		TVB.exception(e);
	}
}

function videolistonfocuscb(el)
{
	try
	{
		el.style.color = "white";
		el.style.backgroundPosition = "0 -60px";
		
	}
	catch (e)
	{
		TVB.exception(e);
	}
}

function videolistonblurcb(el)
{
	try
	{
		if (el !== undefined && el !== null)
		{
			if(el.id === videolist.old_time){
				el.style.color = "#656565";
				el.style.backgroundPosition = "0 0px";
			}else{
				el.style.color = "#656565";
				el.style.backgroundPosition = "0 -30px";
			}
		}
	}
	catch (e)
	{
		TVB.exception(e);
	}
}

function videolistonclickcb(el)
{
	try
	{

		if (el !== undefined && el !== null)
		{
			el.style.backgroundPosition = "0 0px";
			el.style.color = "#656565";
		}
	}
	catch (e)
	{
		TVB.exception(e);
	}
}

