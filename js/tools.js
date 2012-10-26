/**
 * @fileoverview
 * <p>General Tools.</p>
 * @author Edoardo Esposito <edoardo.esposito@tvblob.com>
 * @version 1.0
 * @requires YAHOO
 * @requires YAHOO.util.Dom
 * @requires YAHOO.util.Event
 *
 * @constructor
 * @class General Tools.
 */
var intervalId;

var TVB=window.TVB||new Object();
var agt = navigator.userAgent.toLowerCase();
var is_escape = (agt.indexOf("escape") != -1);

TVB.prototype =
{
        Version: '0.3'
}

String.prototype.pad = function(l, s)
{
    return (l -= this.length) > 0 ? (s = new Array(Math.ceil(l / s.length) + 1).join(s)).substr(0, s.length) + this + s.substr(0, l - s.length) : this;
};

function $() 
{
	var elements = new Array();
	for (var i = 0; i < arguments.length; i++) 
	{
		var element = arguments[i];
		if (typeof element == 'string')
			element = document.getElementById(element);

		if (arguments.length == 1)
			return element;

		elements.push(element);
	}

	return elements;
}

var regExs = {
	quotes: /\x22/g,
	startspace: /^\s+/g,
	endspace: /\s+$/g,
	striptags: /<\/?[^>]+>/gi,
	hasbr: /<br/i,
	hasp: /<p>/i,
	rbr: /<br>/gi,
	rbr2: /<br\/>/gi,
	rendp: /<\/p>/gi,
	rp: /<p>/gi,
	base64: /[^A-Za-z0-9\+\/\=]/g,
	syntaxCheck: /^("(\\.|[^"\\\n\r])*?"|[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t])+?$/
}

TVB.Tools = new Object;

/**
 * Creates and executes an XML HTTP Request
 * @param oContainer {HTMLElement} configuration of the link:
 * @param fn {Function*} is the pointer of a method to be called if the Request goes good
 */
TVB.Tools.xmlhttp = function(oContainer,fn)
{
	var oSelf = this;
//	var timeout = 12000;
	var timeout = 8000;
	var method;
	var url;
	var params;
	var retry = 0;
	var tid;

	var loading = 
	{
		start: function()
		{
			$('container').appendChild($T.addElement('div',{id:'loading',appendChild:'loading'}));
		},
		stop: function()
		{
			$('container').removeChild($('loading'));
		}
	};

	this.success = function(o)
	{
//		log('SUCCESS1');
		clearTimeout(tid);

		try
		{
			if(o.responseText !== undefined)
			{
				if (fn)
					fn(o);
				else
					oContainer.innerHTML += o.responseText;
			}
		}
		catch (e)
		{
		}
	};

	this.failure = function()
	{
		log('failure');
	};

	var callback = 
	{ 
		success:this.success,
		failure:this.failure,
		customevents:
		{ 
			onStart:function()
				{
//					log('STARTING');
					loading.start(); 
				},
			onSuccess:function()
				{
					loading.stop();
//					log('SUCCESS');
					clearTimeout(tid);
				},
			onFailure:function()
				{
					loading.stop();
					clearTimeout(tid);
					log('FAILURE');
//					oSelf.request(method,url,params,Number(timeout * 2));
				},
			onAbort: function()
				{
					loading.stop();
					log('TIMEOUT');
					clearTimeout(tid);
//					oSelf.request(method,url,params,Number(timeout * 2));
				}
		}
	}; 

	this.request = function (oMethod,oUrl,oParams,oTimeout)
	{
		if (retry > 4)
			return;

		if (params == undefined)
			params = null;

		method = oMethod;
		url = oUrl;
		params = oParams;
		retry ++;

		if (oTimeout == undefined)
			oTimeout = timeout;
		else
			timeout = oTimeout;

//		log(oTimeout);

		var transaction = YAHOO.util.Connect.asyncRequest(method, url , callback, params);

		tid = setTimeout(function()
			{
				YAHOO.util.Connect.abort(transaction);
				clearTimeout(tid);
				oSelf.request(method,url,params,Number(timeout * 2));
			},oTimeout);
	};

}


/**
 * Creates and returns an 'a' object
 * @param o {Object} configuration of the link:
 *	o.href {String} the url of the link
 *	o.innerHTML {String} the html of the link
 *	o.id {String} the id of the object
 *	o.class {String} the class of the object
 *	o.title {String} the title of the link
 * @param fn {Function*} is the pointer of a method to be called by the onclick callback
 * @param obj {Object} is a list of parameters to be passed to the method TODO
 * @param events {String} is the event to bind
 * @return {Object} the DOM object representing the link
 */
TVB.Tools.link = function(o,fn,obj,e)
{
	var a = document.createElement('a');

	a.href = o.href;
	a.innerHTML = o.innerHTML;
	
	if (o.id != undefined)
		a.setAttribute ('id',o.id);
	
	if (o.className != undefined)
		a.setAttribute ('class',o.className);
	
	if (o.title!= undefined)
		a.setAttribute ('title',o.title);
	
	// TODO obj can be an object of more elements
	if (fn != undefined && fn != null)
	{
		if (YAHOO.lang.isFunction(fn))
		{
			if (e != undefined && typeof(e) == 'string')
				var ev = e;
			else
				var ev = 'click';

			YAHOO.util.Event.addListener(a, ev, fn, obj);
		}
	}
	return a;
};

TVB.Tools.printError = function(oContainer,msg)
{
	clearInterval(intervalId);

	if ($('message'))
		TVB.Tools.removeElement($('message'));

	var div = TVB.Tools.addElement('div',{id:'message',className:'errormsg'});
	var p = TVB.Tools.addElement('p',{appendChild:document.createTextNode(msg)});
	div.appendChild(p);
	$(oContainer).appendChild(div);

	intervalId = setInterval(function(){TVB.Tools.removeElement($('message'));clearInterval(intervalId);}, 10000);

	TVB.Tools.highlightBackground($('message'));
};

TVB.Tools.printInfo = function(oContainer,msg)
{
	clearInterval(intervalId);

	if ($('message'))
		TVB.Tools.removeElement($('message'));

	var div = TVB.Tools.addElement('div',{id:'message',className:'infomsg'});
	var p = TVB.Tools.addElement('p',{appendChild:document.createTextNode(msg)});
	div.appendChild(p);
	$(oContainer).appendChild(div);

	intervalId = setInterval(function(){TVB.Tools.removeElement($('message'));clearInterval(intervalId);}, 10000);
	TVB.Tools.highlightBackground($('message'));
};

/**
 * Creates and returns an HTML Select drop down
 * @param id {String} the id of the new select field
 * @param text {Object} are the fields of the select:
 * 	o.value {String} the value of the option
 * 	o.html {String} the innerHTML of the option
 * @param selected {String} is the selected value
 * @return {Object} the tooltip
 */
TVB.Tools.addSelect = function(id,options,selected,fn)
{
	var sel = document.createElement("select");
	sel.id = id;
	sel.name = id;

	if (YAHOO.lang.isFunction(fn))
		sel.onchange = function(){fn();};

	for (var i = 0; i < options.length; i++)
	{
		var el = document.createElement('option');

		el.value = options[i].value;
		el.innerHTML = options[i].html;

		if (selected == options[i].html)
			el.setAttribute('selected','selected');
	
		if (options[i].onclick != null && options[i].onclick != undefined)
			el.onclick = options[i].onclick;
	
		sel.appendChild(el);
	}

	return sel;
};

/**
 * Returns the selected value from a Select drop down
 * @param form {String} the id of the form
 * @return {String} the selected value
 */
TVB.Tools.getValue = function(form)
{
	var t = $(form).getElementsByTagName('option');
	for (var i=0;i<t.length;i++)
		if (t[i].selected)
			return t[i].value;

	return -1;
}

/**
 * Trims starting and trailing white space from a string.
 * @param {String} str The string to trim
 */
TVB.Tools.trim = function(str) 
{
	return str.replace(regExs.startspace, '').replace(regExs.endspace, '');
}

/**
 * Removes all HTML tags from a string.
 * @param {String} str The string to remove HTML from
 */
TVB.Tools.stripTags = function(str) 
{
	return str.replace(regExs.striptags, '');
}

/**
 * printf function written in Javascript
 * var test = "You are viewing messages {0} - {1} out of {2}";
 * TVB.Tools.printf(test, '5', '25', '500');
 * This will return a string like:
 * "You are view messages 5 - 25 out of 500"
 * Thanks to Dav Glass
 * @param {String} string
 * @returns Parsed String
 * @type String
 */
TVB.Tools.printf = function() 
{
	var num = arguments.length;
	var str = arguments[0];
	    
	for (var i = 1; i < num; i++) 
	{
		var pattern = "\\{" + (i-1) + "\\}";
		var re = new RegExp(pattern, "g");
		str = str.replace(re, arguments[i]);
	}
	return str;
}

/**
 * Trims starting and trailing white space from a string.
 * @param {HTMLElement/Array/String} el Single element, array of elements or id string to apply the style string to
 * @param {String} str The CSS string to apply to the elements
 * Example:
 * color: black; text-decoration: none; background-color: yellow;
 * Thanks to Dav Glass
 */
TVB.Tools.setStyleString = function(el, str) 
{

	if (typeof str != 'string')
		return -1;

	var _tmp = str.split(';');

	for (x in _tmp) 
	{
		if (x) 
		{
			__tmp = TVB.Tools.trim(_tmp[x]);
			__tmp = _tmp[x].split(':');

			if (__tmp[2])
			{
				var ___tmp = [__tmp[0],__tmp[1] + ":" + __tmp[2]];
				__tmp = ___tmp;
			}

			if (__tmp[0] && __tmp[1]) 
			{
				var _attr = TVB.Tools.trim(__tmp[0]);
				var _val = TVB.Tools.trim(__tmp[1]);

				if (_attr && _val) 
				{
					if (_attr.indexOf('-') != -1) 
					{

						function styleToCamel(str) 
						{
							for (var i = 1, _tmp = str.split('-'); i < _tmp.length; i++)
								_tmp[0] += _tmp[i].substring(0, 1).toUpperCase() + _tmp[i].substring(1, _tmp[i].length); 
							
							return _tmp[0];
						}

						_attr = styleToCamel(_attr);
					}

					$D.setStyle(el, _attr, _val);
				}
			}
		}
	}
}

/**
* Usage:
* div = TVB.Tools.addElement('div', 'Some text.', 
*	{
*           className:'test1',
*           style:'font-size: 20px'
*       }
* );
*
* div = TVB.Tools.addElement('td',{appendChild:[detailsbtn,' | ',deletebtn]});
*
* NOTE: if element with ID exists, the method returns it
*
* @param {String} tag Tag name to create
* @param {Object} attrs Element attributes in object notation
* @returns A reference to the newly created element
*/
TVB.Tools.addElement = function(tag) 
{
	var op = false;

	tag = tag.toLowerCase();
	var el = document.createElement(tag);
	
	if (!el) 
		return false;
	    
	for (var i = 1; i < arguments.length; i++) 
	{
		op = arguments[i];		
		if (typeof op == 'string')
			el.innerHTML = op;
		else if (typeof op == 'object') 
		{
			for (var j in op) 
			{
				switch (j.toLowerCase()) 
				{
					case 'id':
						if ($(op[j]))
							return $(op[j]);
						
						el.setAttribute('id',op[j]);
						break;
					case 'appendchild': 
						if (YAHOO.lang.isArray(op[j]))
						{
							for (k in op[j])
//								if (op[j] != undefined
								if (typeof(op[j][k]) == 'string')
									el.appendChild(document.createTextNode(op[j][k]));
								else if (typeof(op[j][k]) == 'object')
									el.appendChild(op[j][k]);
						}
						else 
						{
							if (typeof(op[j]) == 'object')
								el.appendChild(op[j]);
							else if (typeof(op[j]) == 'string')
								el.appendChild(document.createTextNode(op[j]));
						}
						break;
					case 'class':
					case 'classname':
						el.className = op[j];
						break;
					case 'style':
//						console.log(op[j]);
						TVB.Tools.setStyleString(el, op[j]);
						break;
					case 'events':
						for (k in op[j])
							YAHOO.util.Event.addListener(el, k , op[j][k], null);
						break;
					default:
						el.setAttribute(j,op[j]);
						break;
				}
			}
		}
	}

	return el;
}

/**
 * Remove the element from the document.
 * @param {HTMLElement/Array/String} el Single element, array of elements or id string to remove from the document
 * TODO extend function to remove child elements and listeners
 */
TVB.Tools.removeElement = function(el) 
{
	if (!(el instanceof Object ))
		el = $(el);

	if (el.parentNode)
		el.parentNode.removeChild(el);
}

/**
 * Verify if cookie exists.
 * @param {String} name The name of the cookie to be set
 * @param {Booleen} secure Booleen True or False
 */
TVB.Tools.existCookie = function(name){
	var prefix = name + "="
	var start = document.cookie.indexOf(prefix);

	if (start == -1) {
			return false;
	}

	return true;
}

/**
 * Set a cookie.
 * @param {String} name The name of the cookie to be set
 * @param {String} value The value of the cookie
 * @param {String} expires A valid Javascript Date object
 * @param {String} path The path of the cookie (Deaults to /)
 * @param {String} domain The domain to attach the cookie to
 * @param {Booleen} secure Booleen True or False
 */
TVB.Tools.setCookie = function(name, value, expires, path, domain, secure) 
{
	var argv = arguments;
	var argc = arguments.length;
	var expires = (argc > 2) ? argv[2] : null;
	var path = (argc > 3) ? argv[3] : '/';
	var domain = (argc > 4) ? argv[4] : null;
	var secure = (argc > 5) ? argv[5] : false;

	document.cookie = name + "=" + escape (value) +
		((expires == null) ? "" : ("; expires=" + expires.toGMTString())) +
		((path == null) ? "" : ("; path=" + path)) +
		((domain == null) ? "" : ("; domain=" + domain)) +
		((secure == true) ? "; secure" : "");
}

/**
 * Get the value of a cookie.
 * @param {String} name The name of the cookie to get
 */
TVB.Tools.getCookie = function(name) 
{
	var dc = document.cookie;
	var prefix = name + '=';
	var begin = dc.indexOf('; ' + prefix);

	if (begin == -1) 
	{
	    begin = dc.indexOf(prefix);
	    	if (begin != 0) return null;
	} 
	else
	    begin += 2;

	var end = document.cookie.indexOf(';', begin); 
	if (end == -1)
	    end = dc.length;

	return unescape(dc.substring(begin + prefix.length, end));
}
/**
 * Delete a cookie
 * @param {String} name The name of the cookie to delete.
 */
TVB.Tools.deleteCookie = function(name, path, domain) 
{
	if (TVB.Tools.getCookie(name))
	{
		var expires = new Date ('2078','12','30');
		TVB.Tools.setCookie(name,'',expires);
	}
}

/**
 * User Agent Based Browser Detection<br>
 * This function uses the userAgent string to get the browsers information.<br>
 * The returned object will look like:<br>
 * <pre>
 *   obj {
 *       ua: 'Full UserAgent String'
 *       opera: boolean
 *       safari: boolean
 *       firefox: boolean
 *       mozilla: boolean
 *       msie: boolean
 *       mac: boolean
 *       win: boolean
 *       unix: boolean
 *       version: string
 *       flash: version string
 *   }
 * </pre><br>
 * @return Browser Information Object
 * @type Object
 */
TVB.Tools.getBrowser = function() 
{
	var ua = navigator.userAgent.toLowerCase();
	var opera = ((ua.indexOf('opera') != -1) ? true : false);
	var espial = ((ua.indexOf('escape') != -1) ? true : false);
	var safari = ((ua.indexOf('safari') != -1) ? true : false);
	var firefox = ((ua.indexOf('firefox') != -1) ? true : false);
	var msie = ((ua.indexOf('msie') != -1) ? true : false);
	var mac = ((ua.indexOf('mac') != -1) ? true : false);
	var unix = ((ua.indexOf('x11') != -1) ? true : false);
	var win = ((mac || unix) ? false : true);
	var version = false;
	var mozilla = false;
	
	if (!firefox && !safari && (ua.indexOf('gecko') != -1)) {
		mozilla = true;
		var _tmp = ua.split('/');
		version = _tmp[_tmp.length - 1].split(' ')[0];
	}

	if (firefox) 
	{
		var _tmp = ua.split('/');
		version = _tmp[_tmp.length - 1].split(' ')[0];
	}
	if (msie) 
		version = ua.substring((ua.indexOf('msie ') + 5)).split(';')[0];

	if (safari) 
	{
/* 		version = this.getBrowserEngine().version; */
		version = undefined;
	}

	if (opera)
	{
		version = ua.substring((ua.indexOf('opera/') + 6)).split(' ')[0];
	}
	
	/**
	* Return the Browser Object
	* @type Object
	*/
	var browsers = {
	    ua: navigator.userAgent,
	    opera: opera,
	    espial: espial,
	    safari: safari,
	    firefox: firefox,
	    mozilla: mozilla,
	    msie: msie,
	    mac: mac,
	    win: win,
	    unix: unix,
	    version: version
	}
	return browsers;
}

/**
 * Inserts an HTML Element after another in the DOM Tree.
 * @param    {HTMLElement}   elm The element to insert
 * @param    {HTMLElement}    curNode The element to insert it before
 */
TVB.Tools.insertAfter = function(el, curNode) 
{
	if (curNode.nextSibling)
		curNode.parentNode.insertBefore(el, curNode.nextSibling);
	else
		curNode.parentNode.appendChild(el);
}

/**
 * Validates that the value passed is in the Array passed.
 * @param    {Array}   arr The Array to search (haystack)
 * @param    {String}    val The value to search for (needle)
 * @returns True if the value is found
 * @type Boolean
 */
TVB.Tools.inArray = function(arr, val) 
{
	if (arr instanceof Array) 
		for (var i = (arr.length -1); i >= 0; i--) 
			if (arr[i] === val) 
				return true;

	return false;
}

/**
 * Validates that the value passed in is a boolean.
 * @param    {Object}    str The value to validate
 * @return true, if the value is valid
 * @type Boolean
 */
TVB.Tools.checkBoolean = function(str) 
{
	return ((typeof str == 'boolean') ? true : false);
}

/**
 * Validates that the value passed in is a number.
 * @param    {Object}    str The value to validate
 * @return true, if the value is valid
 * @type Boolean
 */
TVB.Tools.checkNumber = function(str) 
{
	return ((isNaN(str)) ? false : true);
}

/**
*
* Secure Hash Algorithm (SHA1)
* http://www.webtoolkit.info/
*
**/

TVB.Tools.SHA1 = function (msg) 
{
	function rotate_left(n,s) 
	{
		var t4 = ( n<<s ) | (n>>>(32-s));
		return t4;
	};

	function lsb_hex(val) 
	{
		var str="";
		var i;
		var vh;
		var vl;
		
		for( i=0; i<=6; i+=2 ) 
		{
			vh = (val>>>(i*4+4))&0x0f;
			vl = (val>>>(i*4))&0x0f;
			str += vh.toString(16) + vl.toString(16);
		}
		return str;
	};
	
	function cvt_hex(val) 
	{
		var str="";
		var i;
		var v;
		
		for( i=7; i>=0; i-- ) 
		{
			v = (val>>>(i*4))&0x0f;
			str += v.toString(16);
		}
		return str;
	};
	
	function Utf8Encode(string) 
	{
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
		
		for (var n = 0; n < string.length; n++) 
		{
			var c = string.charCodeAt(n);
			
			if (c < 128)
				utftext += String.fromCharCode(c);
			else if((c > 127) && (c < 2048)) 
			{
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
			}
			else 
			{
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
			}
	
		}
	
		return utftext;
	};
	
	var blockstart;
	var i, j;
	var W = new Array(80);
	var H0 = 0x67452301;
	var H1 = 0xEFCDAB89;
	var H2 = 0x98BADCFE;
	var H3 = 0x10325476;
	var H4 = 0xC3D2E1F0;
	var A, B, C, D, E;
	var temp;
	
	msg = Utf8Encode(msg);
	
	var msg_len = msg.length;
	
	var word_array = new Array();
	for( i=0; i<msg_len-3; i+=4 ) 
	{
		j = msg.charCodeAt(i)<<24 | msg.charCodeAt(i+1)<<16 |
		msg.charCodeAt(i+2)<<8 | msg.charCodeAt(i+3);
		word_array.push( j );
	}
	
	switch( msg_len % 4 ) 
	{
		case 0:
		i = 0x080000000;
		break;
		case 1:
		i = msg.charCodeAt(msg_len-1)<<24 | 0x0800000;
		break;
		case 2:
		i = msg.charCodeAt(msg_len-2)<<24 | msg.charCodeAt(msg_len-1)<<16 | 0x08000;
		break;
		case 3:
		i = msg.charCodeAt(msg_len-3)<<24 | msg.charCodeAt(msg_len-2)<<16 | msg.charCodeAt(msg_len-1)<<8    | 0x80;
		break;
	}
	
	word_array.push( i );

	while( (word_array.length % 16) != 14 ) word_array.push( 0 );

	word_array.push( msg_len>>>29 );
	word_array.push( (msg_len<<3)&0x0ffffffff );


	for ( blockstart=0; blockstart<word_array.length; blockstart+=16 ) 
	{
		
		for( i=0; i<16; i++ ) W[i] = word_array[blockstart+i];
		for( i=16; i<=79; i++ ) W[i] = rotate_left(W[i-3] ^ W[i-8] ^ W[i-14] ^ W[i-16], 1);
		
		A = H0;
		B = H1;
		C = H2;
		D = H3;
		E = H4;
		
		for( i= 0; i<=19; i++ ) 
		{
			temp = (rotate_left(A,5) + ((B&C) | (~B&D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}
		
		for( i=20; i<=39; i++ ) 
		{
			temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}
		
		for( i=40; i<=59; i++ ) 
		{
			temp = (rotate_left(A,5) + ((B&C) | (B&D) | (C&D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}
		
		for( i=60; i<=79; i++ ) 
		{
			temp = (rotate_left(A,5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
			E = D;
			D = C;
			C = rotate_left(B,30);
			B = A;
			A = temp;
		}
		
		H0 = (H0 + A) & 0x0ffffffff;
		H1 = (H1 + B) & 0x0ffffffff;
		H2 = (H2 + C) & 0x0ffffffff;
		H3 = (H3 + D) & 0x0ffffffff;
		H4 = (H4 + E) & 0x0ffffffff;

	}

	var temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
	
	return temp.toLowerCase();
}

$D = YAHOO.util.Dom;
$E = YAHOO.util.Event;
$T = TVB.Tools;
$ = YAHOO.util.Dom.get;
$$ = YAHOO.util.Dom.getElementsByClassName;

