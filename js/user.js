var loginUx = 
{
	enter: function() 
	{
		try
		{
			TVB.CustomEvent.subscribeEvent(TVB.remote.button.OK, this.remoteHandler, this, true);
			TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.BACK);
			TVB.CustomEvent.subscribeEvent(TVB.remote.button.BACK, this.remoteHandler, this, true);
			TVB.remote.disableLetters();
			loginUx.show();
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
			if ($('buttondiv') !== null && $('buttondiv') !== undefined)
			{
				TVB.system.deleteElementById('buttondiv');
			}

			if ($('logindiv') !== null && $('logindiv') !== undefined)
			{
				TVB.system.deleteElementById('logindiv');
			}

			$('loginpage').style.display = 'none';
			TVB.remote.enableLetters();

			TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.OK);
			TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.BACK);
		} 
		catch (e) 
		{
			TVB.exception(e);
		}		
	},

	drawInterface: function()
	{
		var text = '<div id="logindiv">';
		text += "<h2>"+locales.logintitle+"</h2>";
		text += "<p>"+locales.logintext+"<span id='errormsg'></span></p><br/>";
		
		text += '<div class="option"><label for="username">Username </label><input id="username" value="'+youtubeusername+'" highlight="false" onmouseover="document.getElementById(\'username\').focus();" /></div>';
		text += '<div class="option"><label for="Password">Password </label><input type="password" id="password" value="'+youtubepassword+'" onmouseover="document.getElementById(\'password\').focus();" highlight="false"/></div>';

		text += '<div class="option" id="buttondiv"></div>';

		text += '</div>';

		$('loginpage').innerHTML = text;

		var elem = document.createElement('a');
		elem.className = 'button';
		elem.id = 'button';
		elem.setAttribute('highlight','false');
		elem.onfocus = function()
			{
				$D.setStyle($('button'), 'color', '#fff');
				$D.setStyle($('button'), 'background', 'transparent url(http://static.tvblob.com/img/youtube/'+youtubetheme+'/button_sprite.png) no-repeat 0 -60px');
			}
		elem.onblur= function()
			{
				$D.setStyle($('button'), 'color', '#6c6c6c');
				$D.setStyle($('button'), 'background', 'transparent url(http://static.tvblob.com/img/youtube/'+youtubetheme+'/button_sprite.png) no-repeat 0 0');
			}
		elem.onclick= function()
			{
				savecredentials();
				return false;
			}
	
		elem.setAttribute('href','#');
		elem.innerHTML = "<span>"+locales.menulogin+"</span>";

		$('buttondiv').appendChild(elem);

		$('username').focus();
	},

	logout: function()
	{
		TVB.log("Youtube: requested logout");

		youtubeusername = "";
		youtubepassword = "";

		TVB.Tools.deleteCookie('youtube_username');
		TVB.Tools.deleteCookie('youtube_password');

		loginUx.exit();
		home.enter();
		home.draw();

		return false;
	},

	show: function() 
	{
		loginUx.drawInterface();
	},

	remoteHandler: function(type, args)
	{
		try 
		{
			var keyName = args[0].keyName;
			
			TVB.log('key pressed ' + args[0].keyName);
			
			if (keyName == 'BACK')
			{
				loginUx.exit();
				home.enter()
			}
			else if (keyName == 'OK')
			{
			}
		} 
		catch (e) 
		{
			TVB.exception(e);
		}		
	}
};

function savecredentials()
{
	var uname = $('username').value;
	var pwd = $('password').value;

	var req = new HTTPRelay();
	var res = req.get(clientLocation + '/youtube.php?action=checkcredentials&username='+uname+'&password='+pwd);

	var result = TVB.json.parse(res);

	if (result == false || result == null)
	{
		_gaq.push(['_trackEvent',"Login","","",0]);
		$('errormsg').innerHTML = "<br/>Il nome utente o la password non sono corretti.";
		$('username').focus();
		return false;	
	}

	var expires = new Date ('2078','12','30');
	TVB.Tools.setCookie('youtube_username', uname,expires);
	TVB.Tools.setCookie('youtube_password', pwd,expires);

	youtubeusername = uname;
	youtubepassword = pwd;

	_gaq.push(['_trackEvent',"Login","","",1]);

	TVB.log('Youtube: username: ' + uname);
	TVB.log('Youtube: password: ' + pwd);

	loginUx.exit();
	home.enter();
	home.draw();

	return false;
}

var optionsUx = 
{
	enter: function() 
	{
		try
		{
			TVB.CustomEvent.subscribeEvent(TVB.remote.button.OK, this.remoteHandler, this, true);
			TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.BACK);
			TVB.CustomEvent.subscribeEvent(TVB.remote.button.BACK, this.remoteHandler, this, true);
			optionsUx.show();
			_gaq.push(['_trackEvent',"Opzioni", "Accesso"]);
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
			$('dummy').focus();

			if ($('buttondiv') !== undefined && $('buttondiv') !== null)
			{
				TVB.system.deleteElementById('buttondiv');
			}

			if ($('logindiv') !== undefined && $('logindiv') !== null)
			{
				TVB.system.deleteElementById('logindiv');
			}

			$('loginpage').style.display = 'none';

			TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.OK);
			TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.BACK);
		} 
		catch (e) 
		{
			TVB.exception(e);
		}		
	},

	drawInterface: function()
	{
		var text = '<div id="optionsdiv">';
		text += "<h2>"+locales.opzionititle+"</h2>";
		text += "<p>"+locales.opzionitext+"</p><br/><span id='errormsg'></span>";

		text += '<div class="option"><label for="language">'+locales.opzionilingua+'</label><select id="language" highlight="true">';
		c = '';
		if (youtubelanguage == 2)  { c = 'selected="selected"'; }
		text += '<option '+c+' value="2">Italiano</option>';

		c = '';
		if (youtubelanguage == 1) { c = 'selected="selected"'; }
		text += '<option '+c+' value="1">English</option>';

		c = '';
		if (youtubelanguage == 3)  { c = 'selected="selected"'; }
		text += '<option '+c+' value="3">Fran&ccedil;ais</option>';

		c = '';
		if (youtubelanguage == 4)  { c = 'selected="selected"'; }
		text += '<option '+c+' value="4">Deutsch</option>';

		c = '';
		if (youtubelanguage == 5) { c = 'selected="selected"'; }
		text += '<option '+c+' value="5">Espa&ntilde;ol</option>';

		c = '';
		if (youtubelanguage == 6)  { c = 'selected="selected"'; }
		text += '<option '+c+' value="6">Japanese</option>';

		text += '</select>';
		text += '</div>';

		text += '<div class="option"><label for="theme">'+locales.opzionitema+'</label><select id="theme" highlight="true">';

		c = (youtubetheme == 'light')  ? 'selected="selected"' : '';
		text += '<option '+c+' value="light">'+locales.temachiaro+'</option>';
		c = (youtubetheme == 'dark')  ? 'selected="selected"' : '';
		text += '<option '+c+' value="dark">'+locales.temascuro+'</option>';

		text += '</select>';
		text += '</div>';

		text += '<div class="option"><label for="quality">'+locales.opzioniqualita+'</label><select id="quality" highlight="true">';

		c = (youtubequality == 'low')  ? 'selected="selected"' : '';
		text += '<option '+c+' value="low">'+locales.bassa+'</option>';
		c = (youtubequality == 'high')  ? 'selected="selected"' : '';
		text += '<option '+c+' value="high">'+locales.alta+'</option>';

		text += '</select>';
		text += '</div>';

		text += '<div class="break"></div>';

		text += '<div class="option" id="buttondiv"></div>';

		text += '</div>';

		$('optionspage').innerHTML = text;

		var elem = document.createElement('a');
		elem.className = 'button';
		elem.id = 'button';
		elem.setAttribute('highlight','false');
		elem.onfocus = function()
			{
				$D.setStyle($('button'), 'color', '#fff');
				$D.setStyle($('button'), 'background', 'transparent url(http://static.tvblob.com/img/youtube/'+youtubetheme+'/button_sprite.png) no-repeat 0 -60px');
			}
		elem.onblur= function()
			{
				$D.setStyle($('button'), 'color', '#6c6c6c');
				$D.setStyle($('button'), 'background', 'transparent url(http://static.tvblob.com/img/youtube/'+youtubetheme+'/button_sprite.png) no-repeat 0 0');
			}
		elem.onclick= function()
			{
				saveoptions();
				return false;
			}
	
		elem.setAttribute('href','#');
		elem.innerHTML = "<span>"+locales.save+"</span>";

		$('buttondiv').appendChild(elem);
		$D.setStyle($('button'), 'margin-left', '22px');

		$('language').focus();
	
	},

	show: function() 
	{
		optionsUx.drawInterface();
	},

	remoteHandler: function(type, args)
	{
		try 
		{
			var keyName = args[0].keyName;
			
			TVB.log('key pressed ' + args[0].keyName);
			
			if (keyName == 'BACK')
			{
				optionsUx.exit();
				home.enter()
			}
			else if (keyName == 'OK')
			{
			}
		} 
		catch (e) 
		{
			TVB.exception(e);
		}		
	}
};

function saveoptions()
{
	var lang = $('language').value;
	var theme = $('theme').value;
	var quality = $('quality').value;
	var expires = new Date ('2078','12','30');
	TVB.Tools.setCookie('youtube_language', lang,expires);
	TVB.Tools.setCookie('youtube_theme', theme,expires);
	TVB.Tools.setCookie('youtube_quality', quality,expires);
	youtubelanguage = lang;

	document.getElementById('dummy').focus();

	if (youtubetheme !== theme)
	{
		TVB.log('Youtube: changed skin');

		$('errormsg').innerHTML = locales.riavvio;

		setTimeout(function() 
				{
					reloadApplication();
					return;
				},2000);

		return;
	}

	youtubetheme = theme;
	youtubequality = quality;

	optionsUx.exit();
	home.enter();
	home.draw();

	return false;
}

function reloadApplication()
{
	TVB.log('reload');
	history.go(0);
	return;
}
