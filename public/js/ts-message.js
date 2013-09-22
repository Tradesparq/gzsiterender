/**
 * Plugin TS-Message
 * Get one conversation and its messages
 * U can write message for this conversation
 * and remove your messages
 * 
 * type = comment
 * target_type = product, feed...
 * target_id = product->id, feed->id...
 * target_owner_id = product->user_id, feed->user_id...
 */
(function($) {
	
	var methods = {

		init : function( options ) {
			var settings = {
				type: 'comment',
				target_type: null,
				target_id: null,
				target_owner_id: null,
				container: this,
				sendUrl:'user/messages/send_comment/',
				conversationUrl:'user/messages/conversation_by_type_and_target_type_and_target_id/',
				messageUrl:'user/messages/message_by_conversation_id_and_timestamp/',
				removeUrl:'user/messages/remove_message',
				status: 'last',
				totalCount: 0,
				totalContainer: null,
				pageNum: 1,
				pageSize: 1,
				showMore: false,
				hideCount: 0,
				hidePageCount: 0,
				hidePageNum: 0
			};
			
			if(options){
				$.extend(settings, options);
			}
			
			_initTmpl(settings);
			
			_registerConversationHeartbeat(settings);
			heartbeat.beatNow();
		},
		onUpdateTotalCount : function(callback){
			if(callback){
				callback(settings.totalCount);
			}
		}
	};
	
	$.fn.message = function(method){
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist.' );
		}
	};
	
	function _registerConversationHeartbeat(settings){
		var url = settings.conversationUrl + settings.type + '/' + settings.target_type + '/' + settings.target_id;  
		heartbeat.register(url, null, function(data){
			data = $.parseJSON(data);
			if(data > 0){
				settings.container.data('conversation_id', data);
				heartbeat.remove(url);
				// begin update message
				_registerMessageHeartbeat(settings, 0);
				heartbeat.beatNow();
			}
		});
	}
	
	// method to register headrbeat function
	function _registerMessageHeartbeat(settings, timestamp){
		var pageNum = settings.status == 'all' ? settings.hidePageNum : 1;
		var pageSize = settings.status == 'all' ? 200 : settings.pageSize;
    	heartbeat.register(settings.messageUrl + settings.container.data('conversation_id'), [timestamp, settings.status, pageNum, pageSize], function(data){
    		updateMessage(data, settings);
	    }, true);
	}

	function updateMessage(data, settings){
		data = $.parseJSON(data);
		if(data.num_rows > 0){
			_initHideCount(data, settings);
			_updateMessageList(data.result, settings);
			if(settings.totalContainer){
				_updateMessageCount(settings);
			}
		}
		// iteration
		_registerMessageHeartbeat(settings, data.timestamp);
	}
	
	/**
	 * Method to update message total count
	 */
	function _updateMessageCount(settings){
		if(settings.status == 'last' || settings.status == 'new'){
			var showCount = settings.container.find('.msg-list .message').not(':hidden').length;
			settings.totalCount = parseInt(settings.hideCount) + showCount;
		}else{
			settings.totalCount = settings.container.find('.msg-list .message').length;
		}
		settings.totalContainer.html(settings.totalCount);
	}
	
	function _initHideCount(data, settings){
		var showAllLink = settings.container.find('a.show-all');
		var hideAllLink = settings.container.find('a.hide-all');
		if(settings.status == 'last'){
			// >= 当只有1条评论时能正确显示total comment，但是原先这里没有=。加上之后会导致 Show All (此处不正确) Comments
			settings.hideCount = data.num_rows >= 1 ? data.num_rows : 0;
			showAllLink.fadeIn(300, function(){
				// 因为有一条last message，所以要显示剩余所有未显示消息总数。已解决上面加了=号之后导致的问题（代码写的太抽抽了－_－^）
				var hideCountText = settings.hideCount >= 1 ? settings.hideCount - 1 : 0;
				$(this).find('span.count').html("("+hideCountText+")");
				hideAllLink.fadeOut();
			});
			settings.status = 'new';
			settings.pageSize = 20;
		}else if(settings.status == 'new'){
			settings.hideCount -= 1;
		}else if(settings.status == 'all'){
			showAllLink.fadeOut(300, function(){
				hideAllLink.fadeIn();
			});
			settings.hideCount = 0;
		}else if(settings.status == 'show' || settings.status == 'hide'){
			settings.hideCount = 0;
		}
	}

	function _updateMessageList(messages, settings){
		var newMessageTmpl = $('#jtmpl_mesgS_C_userXS').tmpl(messages);
		var msgList = settings.container.find('.msg-list');
		// TODO: need to chang here
		if(settings.status == 'last' || settings.status == 'show' || settings.status == 'hide' || settings.status == 'new'){
			msgList.append(newMessageTmpl);
		}else if(settings.status  == 'all'){
			msgList.html(newMessageTmpl);
			settings.status = 'show';
		}
	}
	
	// method to init
	function _initTmpl(settings){
		var msgTmpl = $('#jtmpl_commM').tmpl(settings.type);
		// register enter event and focus/blur function
		var textarea = msgTmpl.find('textarea.msg-text');
		var sendMsgBtn = msgTmpl.find('a.send-msg');
		var charConstantia = msgTmpl.find('.f_char_constantia');
		var moreTip = msgTmpl.find('.f_char_more_than');
		var lessTip = msgTmpl.find('.f_char_less_than');
		textarea.bind('focus', function(){
			var $this = $(this);
//			$this.attr('rows', 4);
			if($this.val() == $this.attr('title')) $this.val('');
//		}).bind('blur', function(){
//			var $this = $(this);
////			$this.attr('rows', 1);
//			if($this.val() == '') $this.val($this.attr('title'));
		}).bind('keydown', function(e){
			if(e.which == 13){
				sendMsgBtn.click();
				e.preventDefault();
			}
		}).bind('keypress', _checkLength).bind('keyup', _checkLength); // TODO：ts-lengthControl.js功能替换
		// check enter char length
		function _checkLength(e){ // keypress doesn't work in ie6
			var charLength = $(this).val().length;
			if(charLength > 250){
				lessTip.hide();
				moreTip.show();
				charConstantia.html(charLength - 250);
			}else{
				moreTip.hide();
				lessTip.show();
				charConstantia.html(250 - charLength);
			}
		}
		// register function to send message button here?
		sendMsgBtn.bind('click', function(e){
			e.preventDefault();
			if(!sendMsgBtn.hasClass('working')){
				var conversation_id = settings.container.data('conversation_id') ? settings.container.data('conversation_id') : 0;
				var message = textarea.val();
				// add a more than 250 chars process function
				if(message.length > 250){
					textarea.addClass('unread');
					setTimeout(function(){textarea.removeClass('unread');}, 1000);
					return;
				}
				if(! message || message.trim() == textarea.attr('title')){
					showCaution('Write a comment first.', null, 'pop');
					return;
				}
				disabledItem(sendMsgBtn);
				_sendComment(conversation_id, message, settings, function(){
					enabledItem(sendMsgBtn);
					textarea.val('').blur();
					moreTip.hide();
					lessTip.show();
					charConstantia.html(250);
				});
			}
		});
		
		var showAllLink = msgTmpl.find('a.show-all');
		var hideAllLink = msgTmpl.find('a.hide-all');
		// register function to show all messages
		showAllLink.bind('click', function(e){
			e.preventDefault();
			if(settings.status == 'new'){
				settings.status = 'all';
				_registerMessageHeartbeat(settings, 0);
				heartbeat.beatNow();
			}else{
				settings.status = 'show';
				_showAll(settings);
			}
//			if(settings.container.find('.msg-list .message').length <= 1) return;
			$(this).fadeOut(300, function(){ hideAllLink.fadeIn(); });
		});
		// register function to hide message all message
		hideAllLink.bind('click', function(e){
			e.preventDefault();
			settings.status = 'hide';
			_hideAll(settings);
//			if(settings.container.find('.msg-list .message').length <= 1) return;
			$(this).fadeOut(300, function(){ showAllLink.fadeIn(); });
		});
		// register function to remove message
		$('a.remove-message').live('click', function(e){
			e.preventDefault();
			var $this = $(this);
			if(!$this.data('binded')){
				var message_id = $this.attr('message_id');
				_removeMessage(settings, message_id, function(data){
					var message = $this.parents('.message');
					message.fadeOut(300, function(){
						message.remove();
						// update message total count
						if(settings.totalContainer){
							_updateMessageCount(settings);
						}
					});
				});
				$this.data('binded', true);
			}
		});
		
		settings.container.append(msgTmpl);
	}
	
	function _showAll(settings){
		var msgList = settings.container.find('.msg-list');
		var messages = msgList.find('.message');
		messages.fadeIn();
//		msgList.find('.message :hidden').fadeIn();
	}
	
	function _hideAll(settings){
		var msgList = settings.container.find('.msg-list');
		var messages = msgList.find('.message');
//		var count = messages.length > 1 ? messages.length - 1 : 0;
		_updateHideCount(settings, messages.length);
		messages.fadeOut();
//		messages.each(function(i, e){
//			if(i < count){
//				$(e).fadeOut();
//			}
//		});
	}
	
	function _updateHideCount(settings, count){
		settings.hideCount = count;
		settings.container.find('span.count').html("("+settings.hideCount+")");
	}
	/**
	 * Method to remove a message
	 * When last message removed
	 * remove conversation id
	 * reget conversation id
	 */
	function _removeMessage(settings, message_id, callback){
		$.post(settings.removeUrl, {message_id:message_id}, function(data){
			data = $.parseJSON(data);
			if(data > 0){
				if(data == 2) _resetConversation(settings);
				if(callback) callback(data);
			}else{
				showCaution('U can\' remove this message.', null, 'pop');
			}
		});
	}
	/**
	 * Method to reset no conversation status
	 */
	function _resetConversation(settings){
		heartbeat.remove(settings.messageUrl + settings.container.data('conversation_id'));
		settings.container.data('conversation_id', 0);
		_registerConversationHeartbeat(settings);
		heartbeat.beatNow();
	}
	
	// sendMessage interface
	function _sendComment(conversation_id, message, settings, callback){
		$.post(settings.sendUrl, {conversation_id : conversation_id, message : message, type : settings.type, target_type : settings.target_type, target_id : settings.target_id, target_owner_id : settings.target_owner_id}, function(data){
			data = $.parseJSON(data);
			if(data > 0){
				heartbeat.beatNow();
			}
			if(callback) callback();
		});
	}

	var doNothing = function(){};
})(jQuery);