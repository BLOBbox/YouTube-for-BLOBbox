var aftervideoUX = 
{
	enter: function() 
	{
		try
		{
			videolist.exitnohome();
			TVB.CustomEvent.subscribeEvent(TVB.remote.button.OK, this.remoteHandler, this, true);
			TVB.CustomEvent.unsubscribeEvent(TVB.remote.button.BACK);
			TVB.CustomEvent.subscribeEvent(TVB.remote.button.BACK, this.remoteHandler, this, true);
			aftervideoUX.show();
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
		text += '<div class="option" id="buttondiv"></div>';
		text += '</div>';

		$('videolistcont').innerHTML = text;

		var elem = document.createElement('a');
		elem.className = 'button';
		elem.id = 'button';
		elem.setAttribute('highlight','false');
		elem.onfocus = function()
			{
				$D.setStyle($('button'), 'color', '#fff');
				$D.setStyle($('button'), 'background', 'transparent url(http://static.tvblob.com/img/youtube/light/button_sprite.png) no-repeat 0 -60px');
			}
		elem.onblur= function()
			{
				$D.setStyle($('button'), 'color', '#6c6c6c');
				$D.setStyle($('button'), 'background', 'transparent url(http://static.tvblob.com/img/youtube/light/button_sprite.png) no-repeat 0 0');
			}
		elem.onclick= function()
			{
				return false;
			}
	
		elem.setAttribute('href','#');
		elem.innerHTML = "<span>Preferito</span>";

		$('buttondiv').appendChild(elem);

		$('button').focus();

	},

	show: function() 
	{
		aftervideoUX.drawInterface();
	},

	remoteHandler: function(type, args)
	{
		try 
		{
			var keyName = args[0].keyName;
			
			TVB.log('key pressed ' + args[0].keyName);
			
			if (keyName == 'BACK')
			{
				TVB.log("BACK");
			}
			else if (keyName == 'OK')
			{
				TVB.log("OK");
			}
		} 
		catch (e) 
		{
			TVB.exception(e);
		}		
	}
};
