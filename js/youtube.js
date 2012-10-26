var currentPage;
var currentSearch = '';
var browser;
var numvideos = 6; 
var reducedView;

var yt_loading =
{
        show: function()
        {
                var loading = document.createElement('div');
                loading.id = 'yt_loading';
                $('container').appendChild(loading);
        },

        remove: function()
        {
                if ($('yt_loading'))
                {
                        TVB.system.deleteElementById('yt_loading');
                }
        }
};

var hl_loading =
{
        show: function()
        {
                var loading = document.createElement('div');
                loading.id = 'hl_loading';
                $('container').appendChild(loading);
        },

        remove: function()
        {
                if ($('hl_loading'))
                {
                        TVB.system.deleteElementById('hl_loading');
                }
        }
};

function interruptCbk() 
{
	TVB.log('Youtube: application put to sleep by user request.');
}

function resumeCbk() 
{
	TVB.log('Youtube: application resumed.');
}

var clientLocation;
function getClientLocation()
{
	clientLocation = location.href;

	if(clientLocation.match(".html"))
	{
		clientLocation = clientLocation.substring(0, clientLocation.length - 11);
	}
}

function init()
{
	try 
	{
		tvblob.logInfo("Youtube version 2.0.4.1 for Espial rev 6768");
	} catch (e) {
		try {
			console.log("Youtube version 2.0.4.1 for Espial rev 6768");
		} catch (e) {}
	}

	try 
	{
		interruptMgr = new BlobInterruptManager();
		interruptMgr.setInterruptedHandler("interruptCbk");
		interruptMgr.setResumedHandler("resumeCbk");
	} 
	catch (e) {}

	try
	{
		browser = TVB.Tools.getBrowser();
	}
	catch (e) {}

	try
	{
		TVB.remoteInit();
		TVB.remote.disableNav();
		TVB.remote.disableBack();
	}
	catch (e) {}

	if (document.body.offsetWidth < "700") 
	{
		reducedView = true;
		reduce();
	}
	else 
	{
		reducedView = false;
	}

	getClientLocation();

	_gaq.push(['_trackEvent',"Home Page", "Accesso"]);
	_gaq.push(['_trackEvent',"Home Page", "Lingua",getLanguageForAnalytics(youtubelanguage) ]);
	_gaq.push(['_trackEvent',"Home Page", "Tema",youtubetheme ]);
	_gaq.push(['_trackEvent',"Home Page", "Qualità",youtubequality]);

	home.draw();

	TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.BACK);
	TVB.CustomEvent.subscribeEvent(TVB.remote.button.BACK, backhandler);
}

function getNameForAnalytics(name)
{
	var n = '';

	switch (name)
	{
		case 'piuvisti':
			n = "Più visti";
			break;
		case 'piuvotati':
			n = "Più votati";
			break;
		case 'popolari':
			n = "Popolari";
			break;
	}

	return n;
}

function getLanguageForAnalytics(lang)
{
	var l = "";
	switch (lang)
	{	
		case "1": 
			  l="English"; break;
		case "2": 
			  l="Italiano"; break;
		case "3": 
			  l="Français"; break;
		case "4": 
			  l="Deutsch"; break;
		case "5": 
			  l="Español"; break;
		case "6": 
			  l="Japanese"; break;
	}

	return l;
}

function getCategoryForAnalytics(cat)
{
	var c = '';

	switch (cat)
	{
		case "piuvisti":
			c = "Più visti";
			break;
		case "piuvotati":
			c = "Più votati";
			break;
		case "popolari":
			c = "Popolari";
			break;
		case "myplaylists":
			c = "Le mie playlist";
			break;
		case "myfavorites":
			c = "I miei preferiti";
			break;
		case "myvideos":
			c = "I miei video";
			break;
		case "mychannels":
			c = "Le mie iscrizioni";
			break;
		case "useruploads":
			c = "I miei video";
			break;
		case "playlist":
			c = "Playlist";
			break;
	}

	return c;
}

function backhandler()
{
	TVB.log('Youtube: exiting from application');
	TVB.system.goBackOrExitBrowser();
}

function reduce(){
	numvideos = 4;
}

function drawSearch()
{
	$D.setStyle($('homepage'), 'display', 'none');
	$D.setStyle($('searchpage'), 'display', 'block');

	setTimeout(searchUx.enter, 250);
	//search('keyword');
}

function startSearch(el)
{
	$D.setStyle($('homepage'), 'display', 'none');
	$D.setStyle($('searchpage'), 'display', 'block');
	currentSearch = el;

	setTimeout(function()
			{
				home.exit();
				searchUx.enterWithQuery();
			}, 250);
}

function drawLogin()
{
	$D.setStyle($('homepage'), 'display', 'none');
	$D.setStyle($('loginpage'), 'display', 'block');

	setTimeout(function()
			{
				home.exit();
				loginUx.enter();
			}, 250);
}

function drawOptions()
{
	$D.setStyle($('homepage'), 'display', 'none');
	$D.setStyle($('optionspage'), 'display', 'block');

	setTimeout(function()
			{
				home.exit();
				optionsUx.enter();
			}, 250);
}

function getElementByFocus()
{
	return document.activeElement.id;
}

function escapeHtmlEntities(str)
{
   var tmp = document.createElement("DIV");
   tmp.innerHTML = str;
   return tmp.textContent||tmp.innerText;   
}

function getViewportSize()
{
	var viewportwidth;
	var viewportheight;

	if (typeof window.innerWidth != 'undefined')
	{
	     viewportwidth = window.innerWidth;
	     viewportheight = window.innerHeight;
	}
	else if (typeof document.documentElement !== 'undefined' && typeof document.documentElement.clientWidth !== 'undefined' && document.documentElement.clientWidth !== 0)
	{
	      viewportwidth = document.documentElement.clientWidth;
	      viewportheight = document.documentElement.clientHeight;
	}
	else
	{
	      viewportwidth = document.getElementsByTagName('body')[0].clientWidth;
	      viewportheight = document.getElementsByTagName('body')[0].clientHeight;
	}

	return {'w':viewportwidth,'h':viewportheight};
}

function remoteHandler(type, args) 
{
	try 
	{
		var keyName = args[0].keyName;
		
		TVB.log('Key Pressed ' + args[0].keyName + ' in ' + currentPage);
		
	} 
	catch (e) 
	{
		TVB.error("Youtube: remoteHandler: " + e.message);
	}
}

