/**
 * Plugin TS-Reference
 * Request reference function
 * Write reference function
 * Ask reference function
 * 
 */
(function($) {
	
	var methods = {

		init : function( options ) {
			
			var settings = {
				container		 : this,
				toward 			 : 'by', // by , for
				timestamp 		 : 0,
				pageNum 		 : 1,
				pageSize		 : 20,
				getReferencesUrl : 'user/references/j_references/',
				tipMessages		 : {
					removeConfirmTitle : 'Delete Reference', 
					removeConfirmMsg   : 'Are you sure you want to delete this reference?'
				}
			};
			
			if(options){
				$.extend(settings, options);
			}
			
			_init(settings);
		},
		request : function(contact, userId, userName, message, callback){
			if(typeof(contact) == 'undefined') contact = true;
			_request(contact, userId, userName, message);
			if(callback) callback();
		},
		write : function(userId, userName, callback){
			_write(userId, userName);
			if(callback) callback();
		}
	};
	
	function _init(settings){
		settings.container.addClass('loading');
		_registerReferencesHeartbeat(settings);
	}
	
	function _registerReferencesHeartbeat(settings, cleanUp){
		heartbeat.register(settings.getReferencesUrl + settings.toward, [settings.timestamp, settings.pageNum, settings.pageSize], function(data){
			if(settings.container.hasClass('loading')){
				settings.container.removeClass('loading');
			}
			if(cleanUp){
				settings.container.empty();
			}
			_updateReferences(data, settings);
		}, true);
	}
	
	function _updateReferences(data, settings){
		data = $.parseJSON(data);
		if(data && data.num_rows > 0){
			var jtmpl = settings.toward == 'by' ? '#jtmpl_refeF' : '#jtmpl_refeT'; 
			for(var i = data.result.length - 1; i >= 0 ; i--){
				var reference = data.result[i];
				if(settings.container.find('.reference[refe_id="'+reference.id+'"]').length == 0){
					settings.container.prepend($(jtmpl).tmpl(reference));
				}else{
					// test here
//					console.log('.reference[refe_id="'+reference.id+'"] Already exists.');
				}
			}
			// init pagination
			var pagn = settings.container.find('.pagination');
			var pagnTmpl = $('#jtmpl_pagnM').tmpl({pagination : pagination(data)});
			if(pagn.length < 1){
				settings.container.append(pagnTmpl);
			}else{
				if(pagnTmpl) pagn.replaceWith(pagnTmpl);
			}
			
			// register events
			_registerEvents(settings);
			
			// update timestamp
			settings.timestamp = data.timestamp;
		}
		// TODO: show no reference by me jtmpl
//		if(settings.container.find('.reference[refe_id]').length == 0){
//			settings.container.html('No reference by me.');
//		}
		// repeat call
		_registerReferencesHeartbeat(settings);
	}
	
	function _registerEvents(settings){
		// move page link click function here 防止影响全局其他ajax分页
		settings.container.find('a[page]').bind('click', function(e){
			e.preventDefault();
			var pagenum = $(this).attr('page');
			settings.pageNum = pagenum;
			settings.timestamp = 0;
			_registerReferencesHeartbeat(settings, true);
			heartbeat.beatNow();
			settings.container.children().fadeOut(300);
		});
		
		// register remove reference function
		settings.container.find('a.remove-reference').unbind('click').bind('click', function(e){
			e.preventDefault();
			$this = $(this);
			_remove($this.attr('refe_id'), $this.attr('val'), settings);
		});
		
		// register display reference function
		settings.container.find('input[name=display-reference]').unbind('click').bind('click', function(e){
			$this = $(this);
			$this.parent().addClass('loading');
			$this.attr('disabled', "disabled");
			var refeId = $this.attr('refe_id');
			var display = Math.abs(1 - $this.attr('val'));
			_display(refeId, display, settings.container);
		});
		
		// register read function
		settings.container.find('.unread .f_reference_content').unbind('click').bind('click', function(e){
			e.preventDefault();
			$this = $(this).parents('.reference');
			if($this.hasClass('unread')){
				$this.removeClass('unread');
				_read($this.attr('refe_id'));
			}
		});
		
		// 遍历 找出高度超过 row3 的msg
		settings.container.find('.f_msg').each(function(i, e){
			var msgContainer = $(e).parents('.f_msg_container');
			if($(e).height() > msgContainer.height()){
				if(msgContainer.hasClass('row3')){
					msgContainer.parents('.f_message').find('.f_extend').show();
				}else{
					msgContainer.parents('.f_message').find('.f_less').show();
				}
			}
		});
		
		settings.container.find('.f_extend').unbind('click').bind('click', function(e){
			e.preventDefault();
			$this = $(this);
			$this.parents('.f_message').find('.f_msg_container').removeClass('row3');
			$this.hide();
			$this.parents('.f_message').find('.f_less').show();
		});
		
		settings.container.find('.f_less').unbind('click').bind('click', function(e){
			e.preventDefault();
			$this = $(this);
			$this.parents('.f_message').find('.f_msg_container').addClass('row3');
			$this.hide();
			$this.parents('.f_message').find('.f_extend').show();
		});
	}
	
	function _remove(refeId, remove, settings){
		showConfirm(settings.tipMessages.removeConfirmTitle, settings.tipMessages.removeConfirmMsg, null, function(){
			var currentBtn = settings.container.find('.remove-reference[refe_id="'+refeId+'"]');
			currentBtn.attr('disabled', "disabled").parent().addClass('loading');			
			$.post("user/references/remove", {id:refeId, remove:remove}, function(data){
				currentBtn.removeAttr('disabled').parent().removeClass('loading');				
				data = $.parseJSON(data);
				if(data > 0){
					var currentReference = settings.container.find('.reference[refe_id="'+data+'"]');
					currentReference.fadeOut('300', function(){ currentReference.remove(); });
				}else{
					showCaution('Delete reference failed.');
				}
			});
		});
	}
	
	function _display(refeId, display, container){
		$.post("user/references/display", {id:refeId, display:display}, function(data){
			var currentInput = container.find('.reference[refe_id="'+refeId+'"]').find('input[name=display-reference]');
			currentInput.removeAttr('disabled').parent().removeClass('loading');			
			data = $.parseJSON(data);
			if(data > 0){
				currentInput.attr('val', display).fadeOut(400, function(){
					if(currentInput.attr('val') == 0){
						currentInput.removeAttr('checked');
					}else{
						currentInput.attr('checked', 'checked');
					}
					currentInput.fadeIn();
				});
			}else{
				showCaution('Display reference failed.');
			}
		});
	}
	
	function _read(refeId, callback){
		$.post('user/references/read', {id:refeId}, function(data){
			data = $.parseJSON(data);
			// TODO: nothing to do?
			if(callback) callback();
		});
	}
	
	function _request(contact, userId, userName, message){
		var referenceDialog= $('#jtmpl_refeR').tmpl({contact:contact, userId:userId, userName:userName, message:message});
		var referenceForm = referenceDialog.find('form');
		var dialogInfo = referenceDialog.find('#show_dialog_info');
		var input_user = referenceDialog.find("input[name=references[user]]");
		var input_user_id = referenceDialog.find("input[name=references[user_id]]");
		if(contact){
			// register contacts
			var contacts = referenceDialog.find(".f_contacts");
			contacts.contacts();
		}
		
		referenceForm.validate({
			submitHandler: function(form){
				dialogInfo.text('Saving your request.');
				var to_user_id = input_user_id.val();
				var msg = referenceDialog.find('#msg').val();
				
				if(contact){
					var toUsers = contacts.contacts('selectUsers');
					var toEmails = contacts.contacts('selectEmails');
					if( ! toUsers && ! toEmails){
						showCaution('Select a connection user first.', null, 'pop');
						return;
					}
				}
				
				$.post("user/references/request", {to_user_id:to_user_id, to_users:toUsers, to_emails:toEmails, msg:msg}, function(data){
					if(data > 0){
						dialogInfo.text('Reference save successful.');
						// TODO: change the parent() function
						referenceDialog.parent().fadeOut('1200', function(){
							referenceDialog.dialog('close');
						});
					}else{
						dialogInfo.text('Reference save failed.');
					}
				});
			}
		});
		referenceDialog.find('a.f_submit').click(function(e){
			e.preventDefault();
			referenceForm.submit();
		});
		referenceDialog.find('a.f_cancel').bind('click', function(e){
			e.preventDefault();
			referenceDialog.dialog('close');
		});
		// init dialog
		referenceDialog.dialog({
			dialogClass : 'dialog-no-title ', //dialog-content
			modal: true,
			draggable: true,
			width: 850,
			height: 600,
			close: function(){ referenceDialog.remove(); }
		});
		
		// register auto complete function
		input_user.autoComp('user',	input_user_id, function(data){
			referenceDialog.find('img.user-picture').attr('src', urlThumbnail(data.id, 50));
			referenceDialog.find('.user-fullname').html(data.value);
			referenceForm.valid();
		});
		
		if(userId){
			input_user_id.val(userId);
			referenceDialog.find('img.user-picture').attr('src', urlThumbnail(userId, 50));
		}
		if(userName){
			input_user.val(userName).attr('disabled', 'disabled');
			referenceDialog.find('.user-fullname').html(userName);
		}
		if(message){
			referenceDialog.find('#msg').val(message);
		}
	}
	
	function _write(userId, userName){
		var referenceDialog= $('#jtmpl_refeW').tmpl();
		var referenceForm = referenceDialog.find('form');
		var dialogInfo = referenceDialog.find('#show_dialog_info');
		var input_user = referenceDialog.find("input[name=references[user]]");
		var input_user_id = referenceDialog.find("input[name=references[user_id]]");
		referenceForm.validate({
			submitHandler: function(form){
				dialogInfo.text('Saving your reference.');
				var to_user_id = input_user_id.val();
				var msg = referenceDialog.find('#msg').val();
				if(msg.length > 1500){
					showCaution("<?=lang('more_than_1500_characters.')?>", null, 'pop');
				}else{
					$.post("user/references/save", {to_user_id:to_user_id, msg:msg}, function(data){
						if(data > 0){
							dialogInfo.text('Reference save successful.');
							// TODO: change the parent() function
							referenceDialog.parent().fadeOut('1200', function(){
								referenceDialog.dialog('close');
								heartbeat.beatNow();
							});
						}else{
							dialogInfo.text('Reference save failed.');
						}
					});
				}
			}
		});
		referenceDialog.find('a.f_submit').click(function(e){
			e.preventDefault();
			referenceForm.submit();
		});
		referenceDialog.find('a.f_cancel').bind('click', function(e){
			e.preventDefault();
			referenceDialog.dialog('close');
		});
		// init dialog
		referenceDialog.dialog({
			dialogClass : 'dialog-no-title ', //dialog-content
			modal: true,
			draggable: false,
			width: 550,
			close: function(){ referenceDialog.remove(); }
		});
		
		// register auto complete function
		input_user.autoComp('user',	input_user_id, function(data){
			referenceDialog.find('img.user-picture').attr('src', urlThumbnail(data.id, 50));
			referenceDialog.find('.user-fullname').html(data.value);
			referenceForm.valid();
		});
		
		if(userId){
			input_user_id.val(userId);
			referenceDialog.find('img.user-picture').attr('src', urlThumbnail(userId, 50));
		}
		if(userName){
			input_user.val(userName).attr('disabled', 'disabled');
			referenceDialog.find('.user-fullname').html(userName);
		}
	}
	
	
	$.fn.reference = function(method){
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist.' );
		}
	};
	
	var doNothing = function(){};
})(jQuery);