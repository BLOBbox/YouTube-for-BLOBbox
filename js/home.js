
var home = {
		section : null,
		
		enter: function(){
			TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.BACK);
			TVB.CustomEvent.subscribeEvent(TVB.remote.button.BACK, backhandler);

			document.getElementById("homepage").style.display = "";
			document.getElementById('item_0').focus();
			TVB.remote.disableNav();
		},
		
		exit: function(){
			document.getElementById("homepage").style.display = "none";
		},
		
		draw: function(){
			$('hometitle').innerHTML = locales.titlepiuvisti;
			yt_loading.show();	
			home.section = "piuvisti";
			
			try{
				if(document.getElementById("hometmpmenu") !== null)
					TVB.system.deleteElementById("hometmpmenu");
			}catch(e){
				
			}
			
			setTimeout(function(){
				home.render();
				home.drawMenu();}, 500);
		},
		
		drawMenu: function(){
			var html = '<ul id="menubar" class="menubar">';
			html += '<li><a highlight="false" onblur="homeonblurcb(this);return false;" onfocus="homeonfocuscb(this);return false;" navigateleft="ftm" id="fm">'+locales.menupiuvisti+'</a></li>';
			html += '<li><a highlight="false"  onblur="homeonblurcb(this);return false;" onfocus="homeonfocuscb(this);return false;" id="sm">'+locales.menumyyoutube+'</a></li>';
			html += '<li><a highlight="false"  onblur="homeonblurcb(this);return false;" onfocus="homeonfocuscb(this);return false;" id="tm">'+locales.menucerca+'</a></li>';
			html += '<li><a highlight="false"  onblur="homeonblurcb(this);return false;" onfocus="homeonfocuscb(this);return false;" navigateright="fm" id="ftm">'+locales.menuopzioni+'</a></li></ul>';

			html += '<ul id="firstmenu" style="display: none;">';
			html += '<li><a highlight="false" class="menuItem" navigateleft="ftm" navigateright="sm" onfocus="sectionMenu.focus(this)" onblur="sectionMenu.blur(this)" id="piuvisti"  title="'+locales.titlepiuvisti+'"  onclick="firstmenucb(this);return false;">'+locales.menupiuvisti+'</a></li>';
			html += '<li><a highlight="false" class="menuItem" navigateleft="ftm" navigateright="sm" onfocus="sectionMenu.focus(this)" onblur="sectionMenu.blur(this)" id="piuvotati" title="'+locales.titlepiuvotati+'" onclick="firstmenucb(this);return false;">'+locales.menupiuvotati+'</a></li>';
			html += '<li><a highlight="false" class="menuItem" navigateleft="ftm" navigateright="sm" onfocus="sectionMenu.focus(this)" onblur="sectionMenu.blur(this)" id="popolari"  title="'+locales.titlepiupopolari+'"  onclick="firstmenucb(this);return false;">'+locales.menupiupopolari+'</a></li></ul>';

			html += '<ul id="mymenu" style="display: none;">';

			if (youtubeusername !== undefined && youtubeusername !== null && youtubepassword !== null && youtubepassword !== undefined && youtubeusername !== "" && youtubepassword !== "")
			{
				html += '<li><a highlight="false" class="menuItem" navigateleft="fm" navigateright="tm" onfocus="sectionMenu.focus(this)" onblur="sectionMenu.blur(this)"  onclick="home.exit();videolist.enter(\'myplaylists\');return false;" href="#">'+locales.menumieplaylist+'</a></li>';
				html += '<li><a highlight="false" class="menuItem" navigateleft="fm" navigateright="tm"  onfocus="sectionMenu.focus(this)" onblur="sectionMenu.blur(this)"  onclick="home.exit();videolist.enter(\'myfavorites\');return false;" href="#">'+locales.menumieipreferiti+'</a></li>';
				html += '<li><a highlight="false" class="menuItem" navigateleft="fm" navigateright="tm"  onfocus="sectionMenu.focus(this)" onblur="sectionMenu.blur(this)"  onclick="home.exit();videolist.enter(\'mychannels\');return false;" href="#">'+locales.menumieicanali+'</a></li>';
				html += '<li><a highlight="false" class="menuItem" navigateleft="fm" navigateright="tm"  onfocus="sectionMenu.focus(this)" onblur="sectionMenu.blur(this)"  onclick="home.exit();videolist.enter(\'myvideos\');return false;" href="#">'+locales.menumieivideo+'</a></li>';
				html += '<li><a highlight="false" class="menuItem" navigateleft="fm" navigateright="tm"  onfocus="sectionMenu.focus(this)" onblur="sectionMenu.blur(this)"   onclick="home.exit();loginUx.logout(); return false;" href="#">'+locales.menuesci+'</a></li>';
			}
			else
			{
				html += '<li><a highlight="false" class="menuItem" navigateleft="fm" navigateright="tm" onfocus="sectionMenu.focus(this)" onblur="sectionMenu.blur(this)" onclick="drawLogin(); return false;" href="#">'+locales.menulogin+'</a></li>';
			}
			html += '</ul>';

			html += '<ul id="searchmenu" style="display: none;">';
			html += '<li><a highlight="false" class="menuItem" navigateleft="sm" navigateright="ftm" onfocus="sectionMenu.focus(this)" onblur="sectionMenu.blur(this)"  onclick="drawSearch();return false;">'+locales.menucerca+'</a></li>';
			
			var items = latestSearches.getLatestSearches();
			for(var i=0;i < items.length && i < 4; i++){
				html += '<li><a highlight="false" class="menuItem" navigateleft="sm" navigateright="ftm" onfocus="sectionMenu.focus(this)" onblur="sectionMenu.blur(this)"  onclick="startSearch(this.innerHTML);return false;">' + items[i] + '</a></li>';
			}
			
			html += '</ul><ul id="optmenu"  style="display: none;">';
			html += '<li><a highlight="false" class="menuItem" navigateleft="tm" navigateright="fm" onfocus="sectionMenu.focus(this)" onblur="sectionMenu.blur(this)"  onclick="drawOptions(); return false;">'+locales.menupreferenze+'</a></li></ul>';
			
			document.getElementById("homemenubar").innerHTML = "<div id='hometmpmenu'>" + html + "</div>";
			
		},
		
		render: function(){

			document.getElementById('hometopbar').innerHTML = '';

			try
			{
				try
				{
					var req = new HTTPRelay();
					var res = req.get(clientLocation + '/youtube.php?action=newstartpage&language=' + youtubelanguage +'&numvideos=' + numvideos);
					var json = TVB.json.parse(res);
				}
				catch (e1)
				{
					TVB.log(e1.message);
					var res = '';
					var json = '';
				}

				if (json == null || json == undefined)
				{
					json = '';
				}

				yt_loading.remove();

				if (json !== '')
				{
					for(i in json[home.section])
					{
						document.getElementById('hometopbar').appendChild(hpcell(json[home.section][i],i));
					}
				}
				else
				{
					TVB.warning('Youtube: json feed IS EMPTY, not drawing anything in home');
				}

				var elem = document.createElement('a');
				elem.onclick= function()
					{
						hl_loading.show();
						setTimeout(function(){
							home.exit();
							videolist.enter(home.section);
							hl_loading.remove();
						},250);
						return false;
					}
				elem.onfocus = function()
					{
						document.getElementById('homeselected').innerHTML = "Altri video";
						this.style.backgroundPosition = "0 0";
					}
				elem.onblur = function()
				{
					this.style.backgroundPosition = "0 -103px";
				}
			
				elem.id = 'item_' + json.length;

				elem.setAttribute('navigateRight','item_0');
				elem.setAttribute('className','other');
				elem.setAttribute('highlight','false');
				//elem.setAttribute('href','');
				elem.innerHTML = "<img src='http://static.tvblob.com/img/youtube/altrivideo_icon.png' />";
				document.getElementById('hometopbar').appendChild(elem);

				document.getElementById('item_0').focus();
			}
			catch (e)
			{
				yt_loading.remove();
				TVB.error(e.message);
			}	
		}
}

function firstmenucb(el)
{
	TVB.log("Youtube: carico " + el.title);
	$('fm').innerHTML = el.innerHTML;
	$('hometitle').innerHTML = el.title;
	document.getElementById('hometopbar').innerHTML = '';
	yt_loading.show();
	
	home.section = el.id;
	setTimeout(function(){
		home.render();
	},250);
}

var sectionMenu = {
		
		focus: function(el){
	
			el.style.backgroundPosition = "0 -60px";
			el.style.color = "white";
			
		},
		
		blur: function(el){
			
			el.style.backgroundPosition = "0 -30px";
			el.style.color = "#656565";
		}
		
}


function homeonfocuscb(el)
{
	try
	{
		var focused = el.id;

		switch (focused)
		{
			case 'fm':
				$D.setStyle($('firstmenu'), 'display', 'block');
				$D.setStyle($('mymenu'), 'display', 'none');
				$D.setStyle($('optmenu'), 'display', 'none');
				$D.setStyle($('searchmenu'), 'display', 'none');
				break;
			case 'sm':
				$D.setStyle($('mymenu'), 'display', 'block');
				$D.setStyle($('firstmenu'), 'display', 'none');
				$D.setStyle($('optmenu'), 'display', 'none');
				$D.setStyle($('searchmenu'), 'display', 'none');
				break;
			case 'tm':
				$D.setStyle($('searchmenu'), 'display', 'block');
				$D.setStyle($('mymenu'), 'display', 'none');
				$D.setStyle($('firstmenu'), 'display', 'none');
				$D.setStyle($('optmenu'), 'display', 'none');
				break;
			case 'ftm':
				$D.setStyle($('optmenu'), 'display', 'block');
				$D.setStyle($('searchmenu'), 'display', 'none');
				$D.setStyle($('firstmenu'), 'display', 'none');
				$D.setStyle($('mymenu'), 'display', 'none');
				break;
		}
		
		el.style.backgroundPosition = "0 -60px";
		el.style.color = "white";
	}
	catch (e)
	{
		TVB.exception(e);
	}
}

function homeonblurcb(el)
{
	try
	{
		var focused = el.id;//getElementByFocus();
		//TVB.log("Blur " + focused + " " + getElementByFocus());
		switch (focused)
		{
			case 'fm':
				$D.setStyle($('mymenu'), 'display', 'none');
				$D.setStyle($('optmenu'), 'display', 'none');
				$D.setStyle($('searchmenu'), 'display', 'none');
				break;
			case 'sm':
				$D.setStyle($('firstmenu'), 'display', 'none');
				$D.setStyle($('optmenu'), 'display', 'none');
				$D.setStyle($('searchmenu'), 'display', 'none');
				break;
			case 'tm':
				$D.setStyle($('mymenu'), 'display', 'none');
				$D.setStyle($('firstmenu'), 'display', 'none');
				$D.setStyle($('optmenu'), 'display', 'none');
				break;
			case 'ftm':
				$D.setStyle($('searchmenu'), 'display', 'none');
				$D.setStyle($('firstmenu'), 'display', 'none');
				$D.setStyle($('mymenu'), 'display', 'none');
				break;
			case 'item_0':
				$D.setStyle($('mymenu'), 'display', 'none');
				$D.setStyle($('firstmenu'), 'display', 'none');
				$D.setStyle($('searchmenu'), 'display', 'none');
				$D.setStyle($('optmenu'), 'display', 'none');
				break;
		}
		
		el.style.backgroundPosition = "0 0px";
		el.style.color = "#656565";
	}
	catch (e)
	{
		TVB.exception(e);
	}
}

var hp_loading =
{
        show: function(el)
        {
			var loading = document.createElement('div');
			loading.id = 'hp_loading';
			el.appendChild(loading);

			loading.style.top = (el.offsetHeight / 2) - (loading.offsetHeight / 2) + "px";
			loading.style.left = (el.offsetWidth / 2) - (loading.offsetWidth / 2) + "px";

			loading.style.background = "transparent url('http://static.tvblob.com/img/youtube/loading_yt.gif') no-repeat";
//			TVB.log("W: " + loading.offsetWidth);
//			TVB.log("W: " + el.offsetWidth);
//			TVB.log("H: " + el.offsetHeight);
        },

        remove: function()
        {
			if ($('hp_loading'))
			{
			        TVB.system.deleteElementById('hp_loading')
			}
        }
};

function hpcell(item,i)
{
	var elem = document.createElement('a');
	elem.className = 'item';
	elem.id = "item_" + i;
	elem.setAttribute('highlight',"false");
	elem.setAttribute('title',item.title[0]);
	elem.onfocus = function()
		{
			$('homeselected').innerHTML = elem.title;
			this.style.backgroundPosition = "0 0";
			$D.setStyle($('mymenu'), 'display', 'none');
			$D.setStyle($('firstmenu'), 'display', 'none');
			$D.setStyle($('searchmenu'), 'display', 'none');
			$D.setStyle($('optmenu'), 'display', 'none');
		}
	
	elem.onblur = function()
	{
		this.style.backgroundPosition = "0 -103px";
	}
	elem.onclick = function()
	{
		hp_loading.show(this);

		try { 
			var vid = item.vid;
			var newuri = getYoutubeVideo(vid,youtubequality);

			TVB.log('Youtube: URL to play: ' + newuri);

			_gaq.push(['_trackEvent',getNameForAnalytics(home.section),'Playback da home',item.title[0]]);

			tvblob.playURI(newuri,escapeHtmlEntities(item.title[0]),'');
		}
		catch(e)
		{
			TVB.exception(e);
		}
		
		hp_loading.remove();
		return false;
	}

	elem.setAttribute('href','');
	elem.innerHTML = "<img src='"+item.thumbnail[0]+"' width='120' />";

	return elem;
}
