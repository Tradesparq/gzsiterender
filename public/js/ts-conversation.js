/**
 * Plugin ts-conversation.js
 * 
 * 
 */
(function($) {
	
	var methods = {
			
		init : function( options ) {
			var settings = {
				container: this,
				containerClass : '',
				keyword: '',
				type: 'message', // message, comment, request, invitation
				targetType: null, // product, feed...
				toward: null, // all, for, by
				timestamp: 0,
				pagination: true,
				pageNum: 1,
				pageSize: 20,
				conversationsUrl: 'user/messages/j_conversations/',
				removeConversationUrl: 'user/messages/delete_conversation/',
				messagesUrl: 'user/messages/j_messages/',
				readUrl: 'user/messages/read/',
				replyUrl: 'user/messages/reply/',
				removeMessage: false,
				removeMessageUrl: 'user/messages/remove_message',
				readList : []
			};
			
			if(options){
				$.extend(settings, options);
			}
		
			_init(settings);
			
			$(this).data('settings', settings);

			heartbeat.beatNow();
		},
		search : function(keyword){
			var settings = $(this).data('settings');
			_resetContainer(settings);
			settings.keyword = keyword;
			settings.container.empty();
			_registerConversationHeartbeat(settings);
			heartbeat.beatNow();
		}
	};
	
	$.fn.conversation = function(method){
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist.' ); // LANG: 
		}
	};
	
	function _init(settings){
		_registerEvents(settings);
		settings.container.addClass('loading');
		_registerConversationHeartbeat(settings);
	}
	
	function _registerConversationHeartbeat(settings){
		var url = _getCurrentConversationsUrl(settings);
		heartbeat.register(url, [settings.keyword, settings.timestamp, settings.pageNum, settings.pageSize], function(data){
			if(settings.container.hasClass('loading')){
				settings.container.removeClass('loading');
			}
			_updateConversations(data, settings);
		});
	}
	
	function _registerMessageHeartbeat(conversationId, status, timestamp, settings){
		heartbeat.register(settings.messagesUrl + conversationId, [status, timestamp], function(data){
			_updateMessages(data, settings);
		}, true); // TODO: once can chagned?
	}
	
	function _updateConversations(data, settings){
		var dataRaw = data;
		data = $.parseJSON(data);
		if(!dataRaw || dataRaw == 'null') {
			if( ! settings.container.data('showNull')){
				// TODO: if data == 'null' show null result;
				settings.container.html('No result.'); // LANG: 
				settings.container.data('showNull', true);
			}
			return;
		}
		
		if(data.result != undefined){
			settings.container.data('showNull', true);
			
			var container = settings.container;
			// init conversations
			for(var i = data.result.length - 1; i >= 0; i--){
				var conversation = data.result[i];
				var oldTmpl = container.find('.conversation[conversation_id=' + conversation.id +']');
				var newTmpl = $("#jtmpl_convM").tmpl(conversation);

				// Mark any conversation as read according to the readlist
				for(var j = 0; j < settings.readList.length; j++){
					var item = settings.readList[j];
					if(item.id == conversation.id && item.count >= conversation.message_count){
						newTmpl.removeClass('unread');
					}
				}

				if(oldTmpl.length == 0){
					container.prepend(newTmpl);
					conversation.status = 'empty';
					newTmpl.data('conversation', conversation);
				}else{
					var oldData = oldTmpl.data('conversation');
					if(oldData.status == 'open'){
						var messages = newTmpl.find('.messages');
						oldTmpl.find('.messages').append(messages.find('.message'));
						oldTmpl.find('.last-message').replaceWith(newTmpl.find('.last-message'));
						oldTmpl.find('.last-message').hide();
						if(newTmpl.hasClass('unread')) oldTmpl.addClass('unread');
						// 更新unread-count？
						if(newTmpl.find('.unread-count').length > 0){
							oldTmpl.find('.unread-count').replaceWith(newTmpl.find('.unread-count'));
						}else{
							oldTmpl.find('.unread-count').remove();
						}
						// 更新comment-total
						if(newTmpl.find('.f_message_count').length > 0){
							oldTmpl.find('.f_message_count').replaceWith(newTmpl.find('.f_message_count'));
						}
						
						$.extend(oldData, conversation);
						oldTmpl.data('conversation', oldData);
						continue;
					}else{
						// 替换旧的消息还有textarea的时候 ckeditor 失去焦点无法使用
						/*
						var rich = oldTmpl.find('.reply textarea.richtext');
						if(rich.data('hasEditor')){
							rich.ckeditorGet().destroy();
							rich.data('hasEditor', false);
						}
						*/
						conversation.status = 'empty';
						oldData = conversation;
					}
					oldTmpl.replaceWith(newTmpl);
					newTmpl.data('conversation', oldData);
				}
				
			}
			
			// init pagination
			if(settings.pagination){
				// close old conversation not open
				container.find('.conversation[old=true]').each(function(){
					var $this = $(this);
					var data = $this.data('conversation');
					if(data.status != 'open'){
						$this.remove();
					}
				});
				container.find('.conversation').attr('old', true);
				
				var pagn = container.find('.pagination');
				var pagnTmpl = $('#jtmpl_pagnM').tmpl({pagination : pagination(data)});
				// move page link click function here 防止影响全局其他ajax分页
				pagnTmpl.find('a[page]').bind('click', function(e){
					e.preventDefault();
					var pagenum = $(this).attr('page');
					container.empty();
					settings.container.addClass('loading');
					settings.pageNum = pagenum;
					settings.timestamp = 0;
					settings.newPage = true; // new page mark
					_registerConversationHeartbeat(settings);
					heartbeat.beatNow();
				});
				
				if(pagn.length < 1){
					container.append(pagnTmpl);
				}else{
					pagn.replaceWith(pagnTmpl);
				}
			}
			settings.timestamp = data.timestamp;
			settings.pageNum = data.page_num;
			settings.pageSize = data.page_size;
			_registerConversationHeartbeat(settings);
		}
		// TODO: test update total
		if(settings.type == 'message' && !settings.toward && !settings.targetType){
			$('a[filter="null"]').next('span.f_total').html(data['total_all']).show();
			$('a[filter="product"]').next('span.f_total').html(data['total_product']).show();
		}
		
		if(settings.type == 'comment' && settings.toward == 'all' && !settings.targetType){
			$('span.f_total_for_me').html(data['total_for']).show();
			$('span.f_total_by_me').html(data['total_by']).show();
			$('span.f_total_all').html(data['total_all']).show();
			$('span.f_total_on_my_products').html(data['total_my_product']).show();
		}
		
		// croll top to container when change page TODO: need - 60 ? 18/7/2011 Jimmy
		if(settings.newPage){
			$('html, body').animate({scrollTop:settings.container.offset().top - 60});
			settings.newPage = false;
		}

	}
	
	function _updateMessages(data, settings){
		if(!data || data == 'null') return;
		var messages = $.parseJSON(data);
		var conversationTmpl = $('div.conversation[conversation_id=' + messages.conversation_id + ']');
		if(conversationTmpl.length > 0){
			conversationTmpl.find('.subject').removeClass('loading');
			var conversationData = conversationTmpl.data('conversation');
			
			if(messages.result.length > 0){
				var pointer = null;
				for(var i=0; i < messages.result.length; i++){
					var message = messages.result[i];
					for(var j=0; j < conversationData.users.length; j++){
						var user = conversationData.users[j];
						if(user.id == message.from_user_id){
							message.from_user = user;
						}
					}
					
					var mesgDiv = conversationTmpl.find('.messages div.message[message_id=' + message.id + ']');
					var output = $('#jtmpl_mesgM').tmpl({message:message, toward:settings.toward, remove:settings.removeMessage, type:settings.type});
					if(mesgDiv.length == 0){
						mesgDiv = output;
					}else{
						mesgDiv.replaceWith(output);
						mesgDiv = conversationTmpl.find('.messages div.message[message_id=' + message.id + ']');
					}
					if(pointer == null){
						conversationTmpl.find('.messages').append(mesgDiv);
					}else{
						pointer.after(mesgDiv);
					}
					pointer = mesgDiv;
				}
				_showMessages(conversationTmpl, settings);
			}
			
			conversationData.timestamp = messages.timestamp;
			_registerMessageHeartbeat(messages.conversation_id, conversationData.type, messages.timestamp, settings);
			_executeRead(settings);
		}
	}
	
	function _executeRead(settings){
		var hasRead = false;
		// update last_read_index to user
		for(var i = 0 ; i < settings.readList.length; i++){
			var item = settings.readList[i];
			if(!item.sent){
				$.post(settings.readUrl + item.id + '/' + item.count);
				item.sent = true;
				hasRead = true;
			}
		}
		if(hasRead) heartbeat.beatNow();
	}	
	
	function _showMessages(div, settings){
		var data = div.data('conversation');
		
		var count = data.message_count - div.find('.messages .message').length;
		if(count > 0){
			div.find('a.show-all').show().find('span.count').html(count);
		}else{
			div.find('a.show-all').hide();
		}
		
		div.find('.messages').show();
		div.find('div.reply').show();
		data.status = 'open';
		div.find('div.last-message').hide();
		_registerMessageHeartbeat(data.id, data.type, data.timestamp, settings);
	}
	
	function _hideMessages(div, settings){
		var data = div.data('conversation');
		heartbeat.remove(settings.messagesUrl + data.id);
		div.find('a.show-all').hide();
		div.find('.messages').hide();
		div.find('div.reply').hide();
		data.status = 'hidden';
		div.find('div.last-message').show();
	}
	
	function _markConversationRead(div, settings){
		var data = div.data('conversation');
		div.removeClass('unread');
		div.find('span.unread-count').empty();
//		heartbeat.register(settings.readUrl + data.id + '/' + data.message_count, [], function(data){console.log(data);}, true);
//		$.get(settings.readUrl + data.id + '/' + data.message_count);
		if(data.unread_count > 0) settings.readList.push({id: data.id, count: data.message_count, sent: false});
	}
	
	function _markConversationUnread(div){
		var data = div.data('conversation');
		div.addClass('unread');
		div.find('span.unread-count').html(div.unread_count);
	}
	
	function _removeMessage(message_id, settings, callback){
		$.post(settings.removeMessageUrl, {message_id:message_id}, function(data){
			data = $.parseJSON(data);
			if(data){
				if(callback) callback(data);
			}else{
				showCaution('Remove message failed.', null, 'pop'); // LANG: 
			}
		});
	}
	
	/**
	 * Clear CKEDITOR instances
	 */
	function _emptyCKEDITOR(){
		if(CKEDITOR && CKEDITOR.instances){
			for(var editor in CKEDITOR.instances){
				CKEDITOR.instances[editor].destroy();
			}
		}
	}
	
	function _getCurrentConversationsUrl(settings){
		return settings.conversationsUrl + settings.type + '/' + settings.targetType + '/' + settings.toward;
	}
	
	function _resetContainer(settings){
		heartbeat.remove(_getCurrentConversationsUrl(settings));
		settings.timestamp = 0;
		settings.pageNum = 1;
		settings.pageSize = 20;
		settings.container.data('showNull', false);
	}
	
	function _registerEvents(settings){
		if(settings.type == 'request'){
			settings.container.find('a.write-reference').live('click', function(e){
				e.preventDefault();
				var data = $(this).parents('div.conversation[conversation_id]').data('conversation');
				var starter = data.starter;
				// change to plugin ts-reference.write function : don't forget to import js and jtmpl files 
				$(this).reference('write', starter.id, starter.full_name);
			});
		}
		
		// init comment menu change function 
		if(settings.type == 'comment'){
			var container = settings.container;
			var commentMenu = $('#jtmpl_comm_menu').tmpl(settings);
			container.before(commentMenu);
			
			commentMenu.find('a.comment-menu').each(function(index, item){
				$(item).bind('click', function(e){
					e.preventDefault();
					// clear ckeditor
//					_emptyCKEDITOR();
					// clear current conversations TODO: need a function to clear not open conversations ?
					settings.container.empty();
					
					commentMenu.find('a.current').removeClass('current');
					$(this).addClass('current');
					_resetContainer(settings);
					settings.toward = $(this).attr('toward');
					settings.targetType = $(this).attr('target_type');
					_registerConversationHeartbeat(settings);
					heartbeat.beatNow();
				});
			});
		}
		
		// init message add user function
		if(settings.type == 'message'){
			// init message filter all and product
			var messageFilter = $('#jtmpl_mesg_filter').tmpl({type:settings.targetType});
			settings.container.before(messageFilter);
			
			messageFilter.find('a.f_message_filter').each(function(index, item){
				$(item).bind('click', function(e){
					e.preventDefault();
					// clear ckeditor
//					_emptyCKEDITOR();
					// clear current conversations TODO: need a function to clear not open conversations ?
					settings.container.empty();
					
					messageFilter.find('a.current').removeClass('current');
					$(this).addClass('current');
					_resetContainer(settings);
					settings.targetType = $(this).attr('filter');
					_registerConversationHeartbeat(settings);
					heartbeat.beatNow();
				});
			});
			
			// 添加好友到当前话题 register add new users function
			$('a.add-to-user').live('click', function(e){
				e.preventDefault();
				var $this = $(this);
				var current_conversation = $this.parents('div.conversation');
				var current_conversation_id = current_conversation.attr('conversation_id');
				var current_user = getCurrentUser();
				var exist_users = [];
				exist_users.push(current_user.id);
				// TODO: here is changed : need a new function to get users exists
				current_conversation.find('.user-list a[user_id]').each(function(i, e){
					var user_id = $(e).attr('user_id');
					exist_users.push(user_id);
				});
				var addToUserHtml = $('#jtmpl_conv_add_user').tmpl({conversation_id:current_conversation_id, users:exist_users});
				
				var addToUserForm = addToUserHtml.find('form');
				addToUserForm.validate({
					submitHandler:function(form){
						var data = addToUserForm.serialize();
						if(data){
							$.post('user/messages/add_user/', data, function(data){
								data = $.parseJSON(data);
								if(data){
									var userListTmpl = current_conversation.find('div.users p.user-list');
									$('div.msg-to-user').each(function(i, e){
										var user = $(e).data('user');
										userListTmpl.append($("#jtmpl_user_name").tmpl(user)); // TODO: change jtmpl
										userListTmpl.append(',');
									});
									addToUserHtml.dialog('close');
								}else{
									showCaution('Problem communicating with server, please try again later.', null, 'pop'); // LANG: 
								}
							});
						}
					}
				});

				addToUserHtml.find('.f_cancel').click(function(e) {
					addToUserHtml.dialog('close');
				});
		
				addToUserHtml.find('.f_submit').click(function(e) {
					addToUserForm.submit();
				});				
				addToUserHtml.dialog({
					dialogClass : 'dialog-no-title dialog-content', 
					modal: true,
					draggable: false,
					resizable : false,
					width: 600,
					close: function(){addToUserHtml.remove();}
					// Leeke: 统一dialog
				});
				
				var toUserCount = addToUserHtml.find('input[name="to-user-count"]'); 
				var toUser = addToUserHtml.find('input[name=to-user]');
				toUser.autoComp('user', null, function(item){
					if(item.id > 0){
						if(addToUserHtml.find('input[value="'+item.id+'"]').length > 0){
							showCaution(item.value + ' allready add.', null, 'pop');
							return;
						}
						var user = {user_id:item.id, url:'user/profile/view/'+item.id, full_name:item.value, picture:item.picture};
						var html = $('#jtmpl_msg_to_user').tmpl(user);
						html.data('user', user);
						toUser.after(html);
						// hack to[] validate
						toUserCount.val($('div.msg-to-user').length);
						var labelToUser = $('label[for="to-user-count"]');
						if(labelToUser)	labelToUser.hide();
					}
				}).focus(function(){
					$(this).val('');
				});
				
				// register remove user function
				$('a.remove-to-user').live('click', function(e){
					e.preventDefault();
					$(this).parents('div.msg-to-user').remove();
					var userCount = $('div.msg-to-user').length > 0 ? $('div.msg-to-user').length : '';
					toUserCount.val(userCount);
					if(userCount == 0){
						var labelToUser = $('label[for="to-user-count"]');
						if(labelToUser)	labelToUser.show();
					}
				});
			});
			
		}
		
		// test here to add remove conversation function 
		if(settings.type == 'message' || settings.type == 'comment'){
			/*
			// TODO: 只在message时候加载 forward时候加载？
			$('.richtext').live('focus', function(e){
				e.preventDefault();
				$this = $(this);
				if( ! $this.data('hasEditor')){
					currentCkInstanceName = $this.attr('name');
					if(CKEDITOR.instances[currentCkInstanceName]) CKEDITOR.instances[currentCkInstanceName].destroy();
					
					$this.ckeditor(function() { 
						/* callback code *
						$(this).focus();
						$this.data('hasEditor', true);
					}, {
						customConfig : 'js/ckeditor/config_comment.js'
					});
				}
			});
			*/
			// register print function
			$(settings.containerClass + ' a.f_print').live('click', function(e){
				e.preventDefault();
				$this = $(this);
				var message_id = $this.parents('.message').attr('message_id');
				window.open(
					"user/messages/print_message/message/" + message_id,
					"Print a message", 
					"toolbar=no, " +
					"location=no, " +
					"directories=no, " +
					"status=yes, " +
					"menubar=no, " +
					"resizable=yes, " +
					"copyhistory=no, " +
					"scrollbars=no, " +
					"width=800, " +
					"height=300"
				);
			});
			
			// register print all function
			$(settings.containerClass + ' a.f_print_all').live('click', function(e){
				e.preventDefault();
				$this = $(this);
				var conversation_id = $this.parents('.conversation').attr('conversation_id');
				window.open(
					"user/messages/print_message/covnersation/" + conversation_id,
					"Print all message",
					"toolbal=no, " +
					"location=no, " +
					"directories=no, " +
					"status=yes, " +
					"menubar=no, " +
					"resizable=yes, " +
					"copyhistory=no, " +
					"scrollbars=no, " +
					"width=800, " +
					"height=600, "
				);
			});
			
			// 转发当前整个conversation
			$(settings.containerClass + ' a.f_forward_all').live('click', function(e){
				e.preventDefault();
				$this = $(this);
				var conversation = $this.parents('.conversation');
				var conversation_id = conversation.attr('conversation_id');
//				获取整个conversation当前所有消息
//				加载到转发整个jtmpl
				$.getJSON(settings.messagesUrl + conversation_id + "/all/0", null, function(data){
					if(data.num_rows > 0){
						var subject = $this.parents('.conversation').find('.f_subject_body').html();
						var forwardDialog = $('#jtmpl_dialog_mesg_forward').tmpl({message:data.result, subject:subject});
						var forwardForm = forwardDialog.find('form');
						// reg select contacts fn
						forwardDialog.find('.f_cnns_cntr').plcnns({
							cntr: forwardDialog.find('.f_cnns_cntr'),
							userFieldName: 'to_users[]',
							emailFieldName: 'to_emails[]'
						});
						
						forwardForm.validate({
							submitHandler:function(form){
								var sendData = $(form).serialize();
								$.post('user/messages/send_compose', sendData, function(data){
									if(data > 0){
										heartbeat.beatNow();
										forwardDialog.find('.f_notice').text(function(){return $(this).attr('msg_s');});
										forwardDialog.parent().fadeOut(2000, function(){
											forwardDialog.dialog('close');
										});
									}else{
										forwardDialog.find('.f_notice').text(function(){return $(this).attr('msg_f');});
									}
								});
							}
						});
						// register submit function
						forwardDialog.find('a.f_submit').bind('click', function(e){
							e.preventDefault();
							// check touser/toemail
							if(forwardForm.find("input[name='to_users[]'],input[name='to_emails[]']").length <= 1){
								var email = forwardForm.find("input[name='to_emails[]']").val();
								if(!is_email(email)){
									showCaution('Enter a valid email address or select your contacts first!', null, 'pop'); // LANG: 
									return;
								}
							}
							if(forwardForm.find('textarea[name=message]').val().trim().length == 0){
								showCaution('Enter some messages please!', null, 'pop'); // LANG: 
								return;
							}
							forwardForm.submit();
						});
						// register cancel function
						forwardDialog.find('.f_cancel').bind('click', function(e){
							forwardDialog.dialog('close');
						});
						// show forward dialog
						forwardDialog.dialog({
							dialogClass: 'dialog-no-title dialog-content',
							modal: true,
							draggable: true,
							resizeable: false,
							width: 700,
							height: 'auto',
							closeOnEscape: false,
							close: function(){
//								forwardDialog.find('.richtext').ckeditorGet().destroy();
								forwardDialog.remove();
							}
						});
						// register ckeditor must here : after dialog already show
						forwardDialog.find('.richtext').focus();
					}else{
						showCaution('Try again.', null, 'pop');
					}
				});
			});
			
			// 转发 单条message
			$(settings.containerClass + ' a.f_forward').live('click', function(e){
				e.preventDefault();
				$this = $(this);
				var subject = $this.parents('.conversation').find('.f_subject_body').html();
				var message = $this.parents('.message');
				var message_body = message.find('.f_message_body').html();
				var from_user_name = message.find('.f_from_user a[user_id]').html();
				var forwardDialog = $('#jtmpl_dialog_mesg_forward').tmpl({message:message_body, subject:subject, from_user_name:from_user_name});
				var forwardForm = forwardDialog.find('form');
				forwardForm.validate({
					submitHandler:function(form){
						var data = forwardForm.serialize();
						if(data){
							$.post('user/messages/send', data, function(data){
								if(data > 0){
									showNotice("Message forwarded successfully.", null, 'pop', null, true); // LANG:
									forwardDialog.parent().fadeOut(1500, function(){
										forwardDialog.dialog('close');
									});
								}else{
									showCaution("We could not send out the forward message, please try again later.", null, 'pop', null, true); // LANG:
								}
							});
						}
					}
				});
				// register add to user function
				var toUserCount = forwardDialog.find('input[name="f_to_user_count"]'); 
				var toUser = forwardDialog.find('input[name=f_to_user]');
				toUser.autoComp('user', null, function(item){
					if(item.id > 0){
						if(forwardDialog.find('input[value="'+item.id+'"]').length > 0){
							showCaution(item.value + ' allready add.', null, 'pop');
							return;
						}
						var user = {user_id:item.id, url:'user/profile/view/'+item.id, full_name:item.value, picture:item.picture};
						var html = $('#jtmpl_msg_to_user').tmpl(user);
						html.data('user', user);
						toUser.after(html);
//						 hack to[] validate
						toUserCount.val($('div.msg-to-user').length);
						var labelToUser = $('label[for="f_to_user_count"]');
						if(labelToUser)	labelToUser.hide();
					}
				}).focus(function(){
					$(this).val('');
				});
				// register remove user function
				$('a.remove-to-user').live('click', function(e){
					e.preventDefault();
					$(this).parents('div.msg-to-user').remove();
					var userCount = $('div.msg-to-user').length > 0 ? $('div.msg-to-user').length : '';
					toUserCount.val(userCount);
					if(userCount == 0){
						var labelToUser = $('label[forUncaught [CKEDITOR.editor] The instance "message_81032" already exists.="f_to_user_count"]');
						if(labelToUser)	labelToUser.show();
					}
				});
				// register submit function
				forwardDialog.find('a.f_submit').bind('click', function(e){
					forwardForm.submit();
				});
				// register cancel function
				forwardDialog.find(' a.f_cancel').bind('click', function(e){
					forwardDialog.dialog('close');
				});
				// show forward dialog
				forwardDialog.dialog({
					title: 'Forward this message',
					modal: true,
					draggable: false,
					width: 550,
					close: function(){
//						forwardDialog.find('.richtext').ckeditorGet().destroy();
						forwardDialog.remove();
					}
				});
				// register ckeditor must here : after dialog already show
				forwardDialog.find('.richtext').focus();
			});
		}

		// test here to add remove conversation function 
		if(settings.type == 'message' || settings.type == 'comment' || (settings.type == 'request' && settings.targetType == 'reference')){
			// register remove conversation function
			$(settings.containerClass + ' a.remove-conv').live('click', function(e){
				e.preventDefault();
				var $this = $(this);
				var current_conversation = $this.parents('div.conversation');
				var conversation_id = current_conversation.attr('conversation_id');
				$.post(settings.removeConversationUrl, {conversation_id:conversation_id}, function(data){
					data = $.parseJSON(data);
					if(data){
						current_conversation = $('.conversation[conversation_id='+conversation_id+']');
						heartbeat.remove(settings.messagesUrl + conversation_id);
						current_conversation.fadeOut(400, function(){
							current_conversation.remove();
						});
					}else{
						showCaution('Problem communicating with server, please try again later.', null, 'pop', null, true); // LANG:
					}
				});
			});
		}
		
		// register pagination function
		/*
		if(settings.pagination == true){
			$('a[page]').live('click', function(e){
				e.preventDefault();
				var pagenum = $(this).attr('page');
				settings.pageNum = pagenum;
				_registerConversationHeartbeat(settings.timestamp, settings.pageNum, settings.pageSize);
				heartbeat.beatNow();
			});
		}
		*/
		
		// register common events
		$(settings.containerClass + ' a.remove-message').live('click', function(e){
			e.preventDefault();
			var $this = $(this);
			var message_id = $this.attr('message_id');
			_removeMessage(message_id, settings, function(data){
				var message = $this.parents('div.message[message_id=' + message_id + ']');
				var messages = message.parents('div.messages');
				var conversation = message.parents('div.conversation');
				message.fadeOut(300, function(){
					message.remove();
					if(messages.find('div.message').length == 0){
						conversation.fadeOut(300, function(){conversation.remove();});
					}
				});
				
			});
		});
		
		// register extend conversation function
		$(settings.containerClass + ' div.subject a').live('click', function(){
			var div = $(this).parents('.conversation');
			var data = div.data('conversation');
			if(data.status == 'open'){
				_hideMessages(div, settings);
			}else if(data.status == 'hidden'){
				_showMessages(div, settings);
				_markConversationRead(div, settings);
				_executeRead(settings);
			}else{
				$(this).addClass('loading');
				data.type = data.unread_count > 0 ? 'unread' : 'recent';
				_markConversationRead(div, settings);
				_registerMessageHeartbeat(data.id, data.type, 0, settings);
				heartbeat.beatNow();
			}
		});
		
		$(settings.containerClass + ' a.show-all').live('click', function(e){
			e.preventDefault();
			var div = $(this).parents('div.conversation');
			var data = div.data('conversation');
			data.type = 'all';
			_registerMessageHeartbeat(data.id, data.type, 0, settings);
			div.find('a.show-all').hide();
			heartbeat.beatNow();
		});
		
		$(settings.containerClass + ' div.reply a.send').live('click', function(e){
			e.preventDefault();
			var div = $(this).parents('div.conversation');
			var data = div.data('conversation');
			var textarea = div.find('div.reply textarea');
			var message = textarea.val();
			if(message.length > 0){
				/*
				// destroy ckeditor instance
				if(settings.type == 'message'){
					textarea.ckeditorGet().destroy();
					textarea.data('hasEditor', false);
				}
				*/
				textarea.val('');
				
				$.post(settings.replyUrl + data.id, {message:message}, function(data){
					heartbeat.beatNow();
				});
			}
		});
		
		$(settings.containerClass + ' div.unread div.reply textarea').live('focus', function(){
			var div = $(this).parents('.conversation');
			var data = div.data('conversation');
			if(data.status == 'open'){
				_markConversationRead(div, settings);
				_executeRead(settings);
			}
		});
	}
	
	var doNothing = function(){};
})(jQuery);