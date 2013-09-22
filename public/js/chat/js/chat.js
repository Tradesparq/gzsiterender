/*

Copyright (c) 2009 Anant Garg (anantgarg.com | inscripts.com)

This script may be used for non-commercial purposes only. For any
commercial purposes, please contact the author at 
anant.garg@inscripts.com

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/

var windowFocus = true;
var username;
var chatHeartbeatCount = 0;
var minChatHeartbeat = 5000;
var maxChatHeartbeat = 60000;
var chatHeartbeatTime = minChatHeartbeat;
var originalTitle;
var blinkOrder = 0;
// Add max chat boxes count by Jimmy
var maxChatBoxesCount = 5;

var chatboxFocus = new Array();
var newMessages = new Array();
var newMessagesWin = new Array();
var chatBoxes = new Array();

$(document).ready(function(){
	originalTitle = document.title;
	startChatSession();
	// test online contacts sys
	var container = $('div.chat_cont');
	container.plchat({
		container:container
	});

	$([window, document]).blur(function(){
		windowFocus = false;
	}).focus(function(){
		windowFocus = true;
		document.title = originalTitle;
	});
});
function restructureChatBoxes() {
	align = 0;
	for (x in chatBoxes) {
		chatboxtitle = chatBoxes[x];

		if ($("#chatbox_"+chatboxtitle).css('display') != 'none') {
			if (align == 0) {
				$("#chatbox_"+chatboxtitle).css('right', '20px');
			} else {
				width = (align)*(225+7)+20;
				$("#chatbox_"+chatboxtitle).css('right', width+'px');
			}
			align++;
		}
	}
}

function chatWith(chatbox) {
	createChatBox(chatbox);
	$("#chatbox_"+chatbox.id+" .chatboxtextarea").focus();
}

function createChatBox(chatbox, minimizeChatBox) {
	if ($("#chatbox_"+chatbox.id).length > 0) {
		if ($("#chatbox_"+chatbox.id).css('display') == 'none') {
			$("#chatbox_"+chatbox.id).css('display','block');
			restructureChatBoxes();
		}
		$("#chatbox_"+chatbox.id+" .chatboxtextarea").focus();
		return;
	}

	$(" <div />" ).attr("id","chatbox_"+chatbox.id)
	.addClass("chatbox")
	.html('<div class="chatboxhead"><div class="chatboxtitle">'+chatbox.title+'</div><div class="chatboxoptions"><a href="javascript:void(0)" onclick="javascript:toggleChatBoxGrowth(\''+chatbox.id+'\')">&nbsp;-&nbsp;</a>&nbsp;<a href="javascript:void(0)" onclick="javascript:closeChatBox(\''+chatbox.id+'\')">&nbsp;X&nbsp;</a></div><br clear="all"/></div><div class="chatboxcontent"></div><div class="chatboxinput"><textarea class="chatboxtextarea" onkeydown="javascript:return checkChatBoxInputKey(event,this,\''+chatbox.id+'\');"></textarea></div>')
	.appendTo($( "body" ));
	

	
	
	$("#chatbox_"+chatbox.id).css('bottom', '0px');
	
	chatBoxeslength = 0;

	for (x in chatBoxes) {
		if ($("#chatbox_"+chatBoxes[x]).css('display') != 'none') {
			chatBoxeslength++;
		}
	}

	if (chatBoxeslength == 0) {
		$("#chatbox_"+chatbox.id).css('right', '20px');
	} else {
		width = (chatBoxeslength)*(225+7)+20;
		$("#chatbox_"+chatbox.id).css('right', width+'px');
	}
	
	chatBoxes.push(chatbox.id);

	if (minimizeChatBox == 1) {
		minimizedChatBoxes = new Array();

		if ($.cookie('chatbox_minimized')) {
			minimizedChatBoxes = $.cookie('chatbox_minimized').split(/\|/);
		}
		minimize = 0;
		for (j=0;j<minimizedChatBoxes.length;j++) {
			if (minimizedChatBoxes[j] == chatbox.id) {
				minimize = 1;
			}
		}

		if (minimize == 1) {
			$('#chatbox_'+chatbox.id+' .chatboxcontent').css('display','none');
			$('#chatbox_'+chatbox.id+' .chatboxinput').css('display','none');
		}
	}

	chatboxFocus[chatbox.id] = false;

	$("#chatbox_"+chatbox.id+" .chatboxtextarea").blur(function(){
		chatboxFocus[chatbox.id] = false;
		$("#chatbox_"+chatbox.id+" .chatboxtextarea").removeClass('chatboxtextareaselected');
	}).focus(function(){
		chatboxFocus[chatbox.id] = true;
		newMessages[chatbox.id] = false;
		$('#chatbox_'+chatbox.id+' .chatboxhead').removeClass('chatboxblink');
		$("#chatbox_"+chatbox.id+" .chatboxtextarea").addClass('chatboxtextareaselected');
	});

	$("#chatbox_"+chatbox.id).click(function() {
		if ($('#chatbox_'+chatbox.id+' .chatboxcontent').css('display') != 'none') {
			$("#chatbox_"+chatbox.id+" .chatboxtextarea").focus();
			// Read Chat
			readChat(chatbox.id);
		}
	});

	$("#chatbox_"+chatbox.id).show();
}

/**
 * Method to read chat
 * @param chatboxtitle
 */
function readChat(chatboxtitle){
	if($('#chatbox_'+chatboxtitle).data('unread')){
		$('#chatbox_'+chatboxtitle).data('unread', false);
		$.post("user/chat/readchat", {chatbox: chatboxtitle} , function(data){
		});
	}
}

function chatHeartbeat(){
	if (windowFocus == false) {
		var blinkNumber = 0;
		var titleChanged = 0;
		for (x in newMessagesWin) {
			if (newMessagesWin[x].isNew == true) {
				++blinkNumber;
				if (blinkNumber >= blinkOrder) {
					document.title = newMessagesWin[x].title+' says...';
					titleChanged = 1;
					break;	
				}
			}
		}
		
		if (titleChanged == 0) {
			document.title = originalTitle;
			blinkOrder = 0;
		} else {
			++blinkOrder;
		}

	} else {
		for (x in newMessagesWin) {
			newMessagesWin[x].isNew
			= false;
		}
	}
	for (x in newMessages) {
		if (newMessages[x].isNew == true) {
			if (chatboxFocus[x].isNew == false) {
				//FIXME: add toggle all or none policy, otherwise it looks funny
				$('#chatbox_'+x+' .chatboxhead').toggleClass('chatboxblink');
				$('#chatbox_'+x).data('unread', true);
			}
		}
	}
	$.ajax({
	  url: "user/chat/chatheartbeat",
	  cache: false,
	  dataType: "json",
	  success: function(data){
		  processHeartBeatData(data, true);
		  setTimeout('chatHeartbeat();',chatHeartbeatTime);
	  }
	});
}

function processHeartBeatData(data, isNew) {
	var itemsfound = 0;
	if(data && data.result){
		$.each(data.result, function(i,item){
			if (item && item.unread_messages.num_rows > 0)	{ // fix strange ie bug
				var chatbox = {};
				chatbox.id = item.id;
				chatbox.title = item.subject;
				
				if($("#chatbox_"+chatbox.id).length <= 0){
					createChatBox(chatbox);
				}
				if($("#chatbox_"+chatbox.id).css('display') == 'none') {
					$("#chatbox_"+chatbox.id).css('display','block');
					restructureChatBoxes();
				}
					
				for(i=0; i < item.unread_messages.result.length; i++) {
					if(isNew){
						newMessages[chatbox.id] = true;
						//newMessagesWin[chatbox.id] = true;
						newMessagesWin[chatbox.id] = {};
						newMessagesWin[chatbox.id].isNew = true;
					}
					var msg = item.unread_messages.result[i];
					if(i==item.unread_messages.result.length - 1 && newMessagesWin[chatbox.id] && newMessagesWin[chatbox.id].isNew == true){
						newMessagesWin[chatbox.id].title = msg.from_user.full_name;
					}
					$("#chatbox_"+chatbox.id+" .chatboxcontent").append('<div class="chatboxmessage"><span class="chatboxmessagefrom">'+msg.from_user.full_name+':&nbsp;&nbsp;</span><span class="chatboxmessagecontent">'+msg.message+'</span></div>');
				}
				
				$("#chatbox_"+chatbox.id+" .chatboxcontent").scrollTop($("#chatbox_"+chatbox.id+" .chatboxcontent")[0].scrollHeight);
				itemsfound += 1;
			}
		});
	}

	chatHeartbeatCount++;

	if (itemsfound > 0) {
		chatHeartbeatTime = minChatHeartbeat;
		chatHeartbeatCount = 1;
	} else if (chatHeartbeatCount >= 10) {
		chatHeartbeatTime *= 2;
		chatHeartbeatCount = 1;
		if (chatHeartbeatTime > maxChatHeartbeat) {
			chatHeartbeatTime = maxChatHeartbeat;
		}
	}
}

function closeChatBox(chatboxtitle) {
	$('#chatbox_'+chatboxtitle).css('display','none');
	restructureChatBoxes();

	$.post("user/chat/closechat", { chatbox: chatboxtitle } , function(data){
		$('#chatbox_'+chatboxtitle).remove();
		for (i=0;i<chatBoxes.length;i++){
			if(chatboxtitle == chatBoxes[i]){
				chatBoxes.splice(i, 1);
			}
		}
	});
}

function toggleChatBoxGrowth(chatboxtitle) {
	if ($('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display') == 'none') {
		
		var minimizedChatBoxes = new Array();
		
		if ($.cookie('chatbox_minimized')) {
			minimizedChatBoxes = $.cookie('chatbox_minimized').split(/\|/);
		}

		var newCookie = '';

		for (i=0;i<minimizedChatBoxes.length;i++) {
			if (minimizedChatBoxes[i] != chatboxtitle) {
				newCookie += chatboxtitle+'|';
			}
		}

		newCookie = newCookie.slice(0, -1)


		$.cookie('chatbox_minimized', newCookie);
		$('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display','block');
		$('#chatbox_'+chatboxtitle+' .chatboxinput').css('display','block');
		$("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);
		// FIX #552
		$("#chatbox_"+chatboxtitle+" .chatboxoptions a").eq(0).html('&nbsp;-&nbsp;');
	} else {
		
		var newCookie = chatboxtitle;

		if ($.cookie('chatbox_minimized')) {
			newCookie += '|'+$.cookie('chatbox_minimized');
		}


		$.cookie('chatbox_minimized',newCookie);
		$('#chatbox_'+chatboxtitle+' .chatboxcontent').css('display','none');
		$('#chatbox_'+chatboxtitle+' .chatboxinput').css('display','none');
		// FIX #552
		$("#chatbox_"+chatboxtitle+" .chatboxoptions a").eq(0).html('&nbsp;+&nbsp;');
	}
	
}

function checkChatBoxInputKey(event,chatboxtextarea,chatboxtitle) {
	// check max length
	if($(chatboxtextarea).val().length > 250){
		$(chatboxtextarea).val($(chatboxtextarea).val().substring(0, 250));
		return;
	}
	 
	if(event.keyCode == 13 && event.shiftKey == 0)  {
		message = $(chatboxtextarea).val();
		message = message.replace(/^\s+|\s+$/g,"");

		$(chatboxtextarea).val('');
		$(chatboxtextarea).focus();
		$(chatboxtextarea).css('height','44px');
		if (message != '') {
			$.post("user/chat/sendchat", {to: chatboxtitle, message: message} , function(data){
				processHeartBeatData($.parseJSON(data), false);
			});
		}
		chatHeartbeatTime = minChatHeartbeat;
		chatHeartbeatCount = 1;

		return false;
	}

	var adjustedHeight = chatboxtextarea.clientHeight;
	var maxHeight = 94;

	if (maxHeight > adjustedHeight) {
		adjustedHeight = Math.max(chatboxtextarea.scrollHeight, adjustedHeight);
		if (maxHeight)
			adjustedHeight = Math.min(maxHeight, adjustedHeight);
		if (adjustedHeight > chatboxtextarea.clientHeight)
			$(chatboxtextarea).css('height',adjustedHeight+8 +'px');
	} else {
		$(chatboxtextarea).css('overflow','auto');
	}
	 
}

function startChatSession(){  
	$.ajax({
	  url: "user/chat/startChatSession",
	  cache: false,
	  dataType: "json",
	  success: function(data) {
		username = data.username;
		var his = data.history;
		if(data.result){
			$.each(data.result, function(i,item){
				if (item && item.unread_messages.num_rows > 0)	{ // fix strange ie bug
					var chatbox = {};
					chatbox.id = item.id;
					chatbox.title = item.subject;
					
					if($("#chatbox_"+chatbox.id).length <= 0){
						createChatBox(chatbox);
					}
					
					for(i=0; i < item.unread_messages.result.length; i++) {
						if( ! $.inArray(chatbox.id, his)){
							newMessages[chatbox.id] = true;
							newMessagesWin[chatbox.id] = {};
							newMessagesWin[chatbox.id].isNew = true;
						}
						var msg = item.unread_messages.result[i];
						if(i==item.unread_messages.result.length - 1 && newMessagesWin[chatbox.id] && newMessagesWin[chatbox.id].isNew == true){
							newMessagesWin[chatbox.id].title = msg.from_user.full_name;
						}
						$("#chatbox_"+chatbox.id+" .chatboxcontent").append('<div class="chatboxmessage"><span class="chatboxmessagefrom">'+msg.from_user.full_name+':&nbsp;&nbsp;</span><span class="chatboxmessagecontent">'+msg.message+'</span></div>');
					}
				}
			});
		}
		// 滚轮滚动到最底部
		for (i=0;i<chatBoxes.length;i++) {
			chatboxtitle = chatBoxes[i];
			$("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);
			setTimeout('$("#chatbox_"+chatboxtitle+" .chatboxcontent").scrollTop($("#chatbox_"+chatboxtitle+" .chatboxcontent")[0].scrollHeight);', 100); // yet another strange ie bug
		}
		// 开启心跳
		setTimeout('chatHeartbeat();',chatHeartbeatTime);
	  }
	});
}

/**
 * Cookie plugin
 *
 * Copyright (c) 2006 Klaus Hartl (stilbuero.de)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

jQuery.cookie = function(name, value, options) {
    if (typeof value != 'undefined') { // name and value given, set cookie
        options = options || {};
        if (value === null) {
            value = '';
            options.expires = -1;
        }
        var expires = '';
        if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
            var date;
            if (typeof options.expires == 'number') {
                date = new Date();
                date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
            } else {
                date = options.expires;
            }
            expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
        }
        // CAUTION: Needed to parenthesize options.path and options.domain
        // in the following expressions, otherwise they evaluate to undefined
        // in the packed version for some reason...
        var path = options.path ? '; path=' + (options.path) : '';
        var domain = options.domain ? '; domain=' + (options.domain) : '';
        var secure = options.secure ? '; secure' : '';
        document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
    } else { // only name given, get cookie
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
};