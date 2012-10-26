var currentStart = 0; 
var currentSearch = '';
var isLatest;
var max_bookmarks = 10;

var keyboardMenuStruct = {
	totalElem: 0,
	data: [],
	menuConfig: undefined,
	myMenu: undefined,
	menuType: undefined
};

var latestStruct = {
	totalElem: 0,
	data: [],
	menuConfig: undefined,
	myMenu: undefined,
	menuType: undefined
};

var searchResultsStruct = {
	totalElem: 0,
	data: [],
	menuConfig: undefined,
	myMenu: undefined,
	menuType: undefined
};

var searchUx = 
{
	enter: function() 
	{
		try
		{
			TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.BACK);
			TVB.CustomEvent.subscribeEvent(TVB.remote.button.BACK, searchUx.remoteHandler, searchUx, true);
			searchUx.show();
			_gaq.push(['_trackEvent',"Ricerca","Accesso"]);
		} 
		catch (e) 
		{
			TVB.exception(e,"search.enter");
		}		
	},
	
	enterWithQuery: function(){
		try
		{
			TVB.log('Youtube: search page with query = ' + currentSearch);
			_gaq.push(['_trackEvent',"Ricerca","Ricerca salvata",currentSearch]);
			searchUx.drawInterface();
			
			searchkeyboard.enter();
			searchkeyboard.deactivate();
			
			$('searchresults').innerHTML = "";
			
			setTimeout(function(){
				searchResults.enter(currentSearch);
				TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.BACK);
				TVB.CustomEvent.subscribeEvent(TVB.remote.button.BACK, searchUx.remoteHandler, searchUx, true);
				
			},500);
		} 
		catch (e) 
		{
			TVB.exception(e,"search.enter");
		}
	},

	exit: function() 
	{
		try
		{
			$('searchpage').style.display = 'none';
			
			searchUx.deactivate();
			searchResults.exit();
			latestSearches.exit();

			try
			{
				if($("searchdiv") !== null && $("searchdiv") !== undefined)
				{
					TVB.system.deleteElementById("searchdiv");
				}
			}
			catch(e)
			{
				TVB.exception(e);	
			}
		} 
		catch (e) 
		{
			TVB.exception(e,"search.exit");
		}		
	},

	drawInterface: function()
	{
		var searchdiv = document.createElement('div');
		searchdiv.id = "searchdiv";

		var searchform = document.createElement('div');
		searchform.id = "searchform";
		searchform.innerHTML = "<input type='text' class='searchinput' name='searchinput' id='searchinput' highlight='false'/>" +
		"<a onclick='' id='hidden_link' highlight='false' ></a>";

		var searchremote = document.createElement('div');
		searchremote.id = "searchremote";
		
		var searchleft = document.createElement('div');
		searchleft.id = "searchleft";

		var searchresults = document.createElement('div');
		searchresults.id = "searchresults";

		searchleft.appendChild(searchform);
		searchleft.appendChild(searchremote);
		searchdiv.appendChild(searchleft);
		searchdiv.appendChild(searchresults);

		$('searchpage').appendChild(searchdiv);
	},

	show: function() 
	{
		searchUx.drawInterface();

		searchkeyboard.enter();
		searchkeyboard.deactivate();
		
		setTimeout(function(){
			latestSearches.enter();
			setTimeout(function(){
				latestSearches.deactivate();
				searchUx.activate();
			},500);
		},500);
	},

	activate: function()
	{
		TVB.remote.disableLetters();
		TVB.remote.disableLeftRight();
		TVB.CustomEvent.subscribeEvent(TVB.remote.button.DOWN, this.remoteHandler, this, true);
		TVB.CustomEvent.subscribeEvent(TVB.remote.button.OK, this.remoteHandler, this, true);

		$('searchinput').focus();
	},

	deactivate: function()
	{
		TVB.remote.enableLetters();
		TVB.remote.enableLeftRight();
		TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.DOWN);
		TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.LEFT);
		TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.RIGHT);
		TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.OK);
		
		$('hidden_link').focus();
	},

	remoteHandler: function(type, args)
	{
		try 
		{
			var keyName = args[0].keyName;

			TVB.log('KEY: ' + keyName);

			if (keyName == 'BACK')
			{
				TVB.log('Youtube: Back from search');
				searchUx.exit();
				home.enter();
			}
			else if (keyName == 'OK')
			{
				var search = $('searchinput').value;

				if (search !== '')
				{
					searchUx.deactivate();
					$('searchresults').innerHTML = "";
					setTimeout(function(){
						var search = $('searchinput').value;
						searchResults.enter(search);
					},250);
				}

				isLatest = false;
			}
			else if (keyName == 'DOWN')
			{
				TVB.log('Youtube: from search field to keyboard');
				TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.DOWN);
				searchUx.deactivate();
				searchkeyboard.activate();
			}
		} 
		catch (e) 
		{
			TVB.exception(e,"search.remoteHandler");
		}		
	}
};

var searchResults = 
{
	enter: function(search) 
	{
		try
		{
			isLatest = false;
			currentSearch = search;
			//searchResults.activate();
			searchResults.show(search);
			TVB.CustomEvent.subscribeEvent(TVB.remote.button.LEFT, this.remoteHandler, this, true);
			
		} 
		catch (e) 
		{
			TVB.exception(e);
		}		
	},

	exit: function() 
	{
		try
		{
			searchResults.deactivate();
		} 
		catch (e) 
		{
			TVB.exception(e);
		}		
	},

	show: function(search)
	{
		latestSearches.exit();

		hl_loading.show();

		$('searchresults').innerHTML = "";
		$('searchinput').value = "";

		TVB.log('Youtube: Search for  ' + search);
		
		searchResults.save();
		try
		{
			search = search.replace(/\s/,'+');

			_gaq.push(['_trackEvent',"Ricerca","Ricerca",search]);

			var req = new HTTPRelay();
			var res = req.get(clientLocation + '/youtube.php?action=search&q='+search+'&start='+currentStart + '&language=' + youtubelanguage);
			var json = TVB.json.parse(res);
			var items= json.items;

			if(items.length > 0)
			{
				currentStart = 0;
				searchResultsStruct.totalElem = items.length;
				searchResultsStruct.menuType = 'search';
				searchResultsStruct.data = [];
					
				for (var i in items) 
				{
					searchResultsStruct.data.push(items[i]);
				}
	
				searchResultsMenu();
			}
			else
			{
				latestSearches.enter();
				TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.LEFT);
				TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.UP);
				TVB.CustomEvent.subscribeEvent(TVB.remote.button.LEFT, latestSearches.remoteHandler, latestSearches, true);
				TVB.CustomEvent.subscribeEvent(TVB.remote.button.UP, latestSearches.remoteHandler, latestSearches, true);
				$('searchresultslabel').innerHTML = "<h2 id='searchresultslabel'>No results for query \"" + search + "\". Latest Searches:</h2>";
			}

			hl_loading.remove();
		}
		catch(e)
		{
			latestSearches.enter();
			TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.LEFT);
			TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.UP);
			TVB.CustomEvent.subscribeEvent(TVB.remote.button.LEFT, latestSearches.remoteHandler, latestSearches, true);
			TVB.CustomEvent.subscribeEvent(TVB.remote.button.UP, latestSearches.remoteHandler, latestSearches, true);
			hl_loading.remove();
			$('searchresultslabel').innerHTML = "<h2 id='searchresultslabel'>No results for query \"" + search + "\". Latest Searches:</h2>";
			TVB.exception(e);
		}
	},

	activate: function()
	{
		if (searchResultsStruct.myMenu !== undefined)
		{
			searchResultsStruct.myMenu.get();
			searchResultsStruct.myMenu.setFocus(searchResultsStruct.myMenu.currentElement);
		}

		TVB.CustomEvent.subscribeEvent(TVB.remote.button.LEFT, this.remoteHandler, this, true);
	},

	deactivate: function()
	{
		if (searchResultsStruct.myMenu !== undefined)
		{
			$('TVBLOB_mainMenu_'+searchResultsStruct.myMenu.currentElement).className = 'riga';
			searchResultsStruct.myMenu.deactivate();
		}

		TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.LEFT);
	},

	remoteHandler: function(type, args)
	{
		try 
		{
			var keyName = args[0].keyName;
			
//			TVB.log('key pressed ' + args[0].keyName);
			
			if (keyName == 'UP')
			{
			}
			else if (keyName == 'LEFT')
			{
				TVB.log('Youtube: from search results to search field');
				searchResults.deactivate();
				searchUx.activate();
			}
		} 
		catch (e) 
		{
			TVB.exception(e);
		}		
	},
	
	save: function()
	{
		try
		{
			var expires = new Date ('2078','12','30');
			if (TVB.Tools.existCookie("youtube_last_searches")) 
			{
				var vc = TVB.Tools.getCookie("youtube_last_searches");
				var tmp = vc.split("%YTSPLIT%");
				
				for(var i=0; i < tmp.length; i++){
					if(tmp[i] === currentSearch)
						return;
				}
				
				if (tmp.length > max_bookmarks -1) 
				{
					tmp = tmp.slice(0, max_bookmarks -1);
					vc = tmp.join("%YTSPLIT%");
				}

				vc = currentSearch + "%YTSPLIT%" + vc;
	
				TVB.Tools.setCookie("youtube_last_searches", vc, expires);
			}
			else 
			{
				TVB.Tools.setCookie("youtube_last_searches", currentSearch, expires);
			}
		}
		catch(e)
		{
			TVB.exception(e);
		}	
		
	}
}

var latestSearches = 
{
	items: null,
	defaults: ['Musica','Sport','Blobbox Promo'],
	
	enter: function() 
	{
		try
		{
			isLatest = true;
			latestSearches.show();
		} 
		catch (e) 
		{
			TVB.exception(e);
		}		
	},

	exit: function() 
	{
		try
		{
			latestSearches.deactivate();
		} 
		catch (e) 
		{
			TVB.exception(e);
		}		
	},
	
	getLatestSearches: function()
	{
		try
		{
			latestSearches.items = TVB.Tools.getCookie("youtube_last_searches").split("%YTSPLIT%");

			if(latestSearches.items.length === 0)
			{
				latestSearches.items= latestSearches.defaults;
			}

			return latestSearches.items;
		}
		catch(e)
		{
			latestSearches.items = [];
			return latestSearches.items;
		}
	},

	show: function()
	{
			latestSearches.getLatestSearches();

			if (latestSearches.items.length == 0)
			{
				return;
			}
			
			try
			{
				latestStruct.totalElem = latestSearches.items.length;
				latestStruct.menuType = 'search';
				latestStruct.data = [];
					
				for (var i in latestSearches.items) 
				{
					latestStruct.data.push(latestSearches.items[i]);
				}
	
				latestMenu();
			}
			catch(e)
			{
				TVB.error(e);
			}
		
	},

	activate: function()
	{
		if (latestStruct.myMenu !== undefined)
		{
			latestStruct.myMenu.get();
			latestStruct.myMenu.setFocus(latestStruct.myMenu.currentElement);
		}

		TVB.CustomEvent.subscribeEvent(TVB.remote.button.LEFT, this.remoteHandler, this, true);
		TVB.CustomEvent.subscribeEvent(TVB.remote.button.UP, this.remoteHandler, this, true);
	},

	deactivate: function()
	{
		TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.LEFT);
		TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.UP);

		if (latestStruct.myMenu !== undefined)
		{
			try{
				latestStruct.myMenu.deactivate();
				var idToBlur = 'TVBLOB_' + latestStruct.myMenu.menuName + '_' + latestStruct.myMenu.currentElement;
				var lineBlurred = latestStruct.myMenu.currentElement;
			latestStruct.myMenu.onBlurCB(document.getElementById(idToBlur), lineBlurred);
			}catch(e){
				TVB.error(e);
			}
		}
	},

	remoteHandler: function(type, args)
	{
		try 
		{
			var keyName = args[0].keyName;
			
			if (keyName == 'UP')
			{
			}
			else if (keyName == 'LEFT')
			{
				TVB.log('Youtube: from latest searches to search field');
				latestSearches.deactivate();
				//searchkeyboard.activate();
				searchUx.activate();
			}
		} 
		catch (e) 
		{
			TVB.exception(e);
		}		
	}
}

var searchkeyboard = 
{
	enter: function() 
	{
		try
		{
			searchkeyboard.show();
		} 
		catch (e) 
		{
			TVB.exception(e,"searchkeyboard.enter");
		}		
	},

	activate: function()
	{
		keyboardMenuStruct.myMenu.get();
		keyboardMenuStruct.myMenu.currentElement = 0;
		keyboardMenuStruct.myMenu.setFocus(keyboardMenuStruct.myMenu.currentElement);
		TVB.CustomEvent.subscribeEvent(TVB.remote.button.UP, this.remoteHandler, this, true);
		TVB.CustomEvent.subscribeEvent(TVB.remote.button.RIGHT, this.remoteHandler, this, true);
	},

	deactivate: function()
	{
		keyboardMenuStruct.myMenu.deactivate();
		var idToBlur = 'TVBLOB_' + keyboardMenuStruct.myMenu.menuName + '_' + keyboardMenuStruct.myMenu.currentElement;
		var lineBlurred = keyboardMenuStruct.myMenu.currentElement;
		keyboardMenuStruct.myMenu.onBlurCB(document.getElementById(idToBlur), lineBlurred);
		TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.UP);
		TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.RIGHT);
	},

	exit: function() 
	{
		try
		{
			$('TVBLOB_gridMenu_'+keyboardMenuStruct.myMenu.currentElement).className = 'tasto';
			keyboardMenuStruct.myMenu.deactivate();
		} 
		catch (e) 
		{
			TVB.exception(e,"searchkeyboard.exit");
		}		
	},

	show: function() 
	{
		var searchremote = $('searchremote');
		var keys = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','0','1','2','3','4','5','6','7','8','9','@','_','+','-','.',',','&larr;',' ' ,'OK' ];
		keyboardMenuStruct.data = keys;
		keyboardMenu();
	},

	remoteHandler: function(type, args)
	{
		try 
		{
			var keyName = args[0].keyName;
					
			if (keyName == 'UP')
			{
				if (keyboardMenuStruct.myMenu.currentElement > 40)
				{
					TVB.log('Youtube: from keyboard to search field');
					searchkeyboard.deactivate();
					searchUx.activate();				
				}
			}else if (keyName == 'RIGHT')
			{
				if ((keyboardMenuStruct.myMenu.currentElement) % 6 === 0)
				{
					searchkeyboard.deactivate();
					if(isLatest)
					{
						TVB.log('Youtube: from keyboard to latest searches');
						latestSearches.activate();
					}
					else
					{
						TVB.log('Youtube: from keyboard to search results');
						searchResults.activate();
					}
				}
			}
		} 
		catch (e) 
		{
			TVB.exception(e,"searchkeyboard.remoteHandler");
		}		
	}

};

function keyboardMenu()
{
	try 
	{
		keyboardMenuStruct.menuConfig = {};
		keyboardMenuStruct.menuConfig = 
		{
			menuName: 'gridMenu',
			rows: 8,
			updateMode: 'manipulate',
			disableChannelDown: false,
			disableChannelUp: false,
			disableUpDown: false,
			disableLeftRight: false,
			disableOk: false,
			menuType: 'paged',
			drawSingleCellCB: function(line, isFirstCol) 
			{
				return keyboardMenuItem(line,isFirstCol);
			},
			
			onSelectCB: function(line) 
			{
				var item = keyboardMenuStruct.data[line];
				addtoform(item);
			},
			onFocusCB: function(obj, line) 
			{
				if (youtubetheme == 'light')
				{
					obj.style.background = 'transparent url(images/light/keyboard_button_on.png) no-repeat';
					obj.style.color = '#fff';
				}
				else
				{
					obj.style.background = 'transparent url(images/light/keyboard_button_on.png) no-repeat';
				}
			},
			onBlurCB: function(obj, line) 
			{
				if (youtubetheme == 'light')
				{
					obj.style.background = "transparent url('')";
					obj.style.color = '#000';
				}
				else
				{
					obj.style.background = "transparent url('')";
					obj.style.color = '#fff';
				}
			},
			onUpdateCB: function(obj, line) 
			{
				obj.innerHTML = "Item #" + line + " UPDATED!!!";
			}
		};

		keyboardMenuStruct.menuConfig.cols = 6;
		keyboardMenuStruct.menuConfig.numElements = 45;
		keyboardMenuStruct.myMenu = new TVB.gridMenu(keyboardMenuStruct.menuConfig);

		$('searchremote').appendChild(keyboardMenuStruct.myMenu.get());
	} 
	catch (e) 
	{
		TVB.exception(e);
	}
}

function keyboardMenuItem(line,isFirstCol)
{
	var item = keyboardMenuStruct.data[line];

	var elem = document.createElement('div');

	elem.innerHTML = item;
	elem.className = 'tasto';
	return elem;
}


function addtoform(key)
{
	if (key == "&larr;")
	{
		var str = $('searchinput').value;
	   	str = str.slice(0, -1)
		$('searchinput').value = str;
	}
	else if (key == "OK")
	{
		$('searchresults').innerHTML = "LOADING";
		searchkeyboard.deactivate();
		setTimeout(function(){
			var search = $('searchinput').value;
			searchResults.enter(search);
		},250);
		
		
	}
	else
	{
		$('searchinput').value += key;
	}
	
	return false;
}

function searchResultsMenu() 
{
	try 
	{
		searchResultsStruct.menuConfig = 
		{
			menuName: 'mainMenu',
			visibleElements: 3,
			numElements: searchResultsStruct.totalElem,
			updateMode: 'manipulate',
			disableLeftRight: true,
			menuType: 'dynamic',
			drawSingleLineCB: function(line) 
			{
				var config = searchResultsStruct.data[line];
				return searchResultsRow(config,line);
			},
			onSelectCB: function(line) 
			{
				hp_loading.show($('TVBLOB_mainMenu_' + line));
				try
				{
					var vid = searchResultsStruct.data[line].vid;
					var newuri = getYoutubeVideo(vid);
					tvblob.playURI(newuri,searchResultsStruct.data[line].title,searchResultsStruct.data[line].desc);
					hp_loading.remove();
				}
				catch(e)
				{
					TVB.exception(e);
					hp_loading.remove();
				}

				return;
			},
			onFocusCB: function(obj, line) 
			{
				try
				{
					if (obj)
					{
		                obj.className = 'riga_sel';
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
		                obj.className = 'riga';
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
				if (currentStart === 0 && dir === 1) 
				{
					searchResultsStruct.myMenu.currentPage = 0;
					searchResultsStruct.myMenu.setFocus(0);
					return;
				}
				
				var req = new HTTPRelay();
				
				try
				{
					if (dir == 0) 
					{
						currentStart++;
					}
					else if (dir == 1) 
					{
						if (currentStart != 0) 
						{
							currentStart--;
						}
					}

					var res = req.get(clientLocation + '/youtube.php?action=search&q=' + currentSearch + '&start=' + currentStart + '&language=' + youtubelanguage);
					var json = TVB.json.parse(res);
					var items= json.items;

					searchResultsStruct.totalElem = items.length;
					searchResultsStruct.data = [];

					for (var i in items)
					{
						searchResultsStruct.data.push(items[i]);
						var config = searchResultsStruct.data[i];
					}

					if (dir == 0) 
					{
						searchResultsStruct.myMenu.currentPage = 0;
					}
					else if (dir == 1) 
					{
						searchResultsStruct.myMenu.currentPage = parseInt(searchResultsStruct.myMenu.getTotalPages() - 1);
					}

					searchResultsStruct.myMenu.currentElement = 0;
					searchResultsStruct.myMenu.changeElementNumber(items.length);

					$('searchresults').innerHTML = '';
					$('searchresults').appendChild(searchResultsStruct.myMenu.menuDiv);

					if (dir == 0) 
					{
						searchResultsStruct.myMenu.setFocus(0);
					}
					else if (dir == 1) 
					{
						searchResultsStruct.myMenu.setFocus(items.length - 1);
					}
				}catch (e)
				{
					TVB.error(e);
				}
			}
		};

		if (searchResultsStruct.totalElem == undefined) 
		{
			searchResultsStruct.menuConfig.numElements = 0;
		}
		else 
		{
			searchResultsStruct.myMenu = new TVB.menu(searchResultsStruct.menuConfig);
		}

		$('searchresults').innerHTML = '<h2 id="searchresultslabel">'+locales.haicercato+' \"'+currentSearch+'\"</h2>';
		$('searchresults').appendChild(searchResultsStruct.myMenu.get());
	} 
	catch (e) 
	{
		TVB.error("Youtube: searchResultsMenu: " + e.message);
	}
}

function searchResultsRow(config,numline) 
{
	try 
	{
		var searchpage = document.createElement('div');

		var text = '<div id="itemdiv_'+numline+'" class="itemdiv">';

		if (config.length !== undefined && config.length !== null)
		{
			var len = config.length;
			var min = Math.floor(len/60);
			var secs = parseFloat(len % 60).toFixed().pad(2,"0");
			text += '<span class="len">['+min+':'+secs+']</span>';
		}

		text += '<span class="searchthumb" id="thumb_'+numline+'"><img width="128" height="87" class="thumb" src="' + config.thumbnail + '"/></span>';

		if (reducedView)
			text += '<div class="textdiv43">';
		else
			text += '<div class="textdiv">';

		text += '<h2 id="searchresultslabel">' + config.title.trim(60,'...') + '<br/><span class="author">' + config.author + '</span></h2>';

		text += '</div>';
		text += '</div>';

		

		searchpage.innerHTML = text;

		searchpage.className = 'riga';
		return searchpage;
	} 
	catch (e) 
	{
		TVB.error("Youtube: searchResultsRow: " + e.message);
	}
}

function latestMenu() 
{
	try 
	{
		latestStruct.menuConfig = 
		{
			menuName: 'latestSearches',
			visibleElements: 10,
			numElements: latestStruct.totalElem,
			updateMode: 'manipulate',
			disableLeftRight: true,
			menuType: 'paged',
			drawSingleLineCB: function(line) 
			{
				var config = latestStruct.data[line];
				return latestResultsRow(config,line);
			},
			onSelectCB: function(line) 
			{
				latestSearches.deactivate();
				searchResults.enter(latestStruct.data[line]);
				return;
			},
			onFocusCB: function(obj, line) 
			{
				if (obj !== undefined && obj !== null)
				{
					obj.className = 'latest_sel';
				}
			},
			onBlurCB: function(obj, line) 
			{
				if (obj !== undefined && obj !== null)
				{
					obj.className = 'latest';
				}
			},
			onUpdateCB: function(obj, line) 
			{
				TVB.log("Youtube: updating line " + line);
			}
		};

		latestStruct.myMenu = new TVB.menu(latestStruct.menuConfig);

		$('searchresults').innerHTML = '<h2 id="searchresultslabel" id="searchresultslabel">'+locales.mieultimericerche+'</h2>';
		$('searchresults').appendChild(latestStruct.myMenu.get());
	} 
	catch (e) 
	{
		TVB.error("Youtube: latestMenu: " + e.message);
	}
}

function latestResultsRow(config,numline) 
{
	try 
	{
		var searchpage = document.createElement('div');

		searchpage.innerHTML = "<div class='wrap'>" + config + "</div>";

		searchpage.className = 'latest';
		return searchpage;
	} 
	catch (e) 
	{
		TVB.error("Youtube: latestResultsRow: " + e.message);
	}
}

