/**
 * Plugin TS-Contacts
 * Get select users of my friends 
 * Get select emails of my search
 * 
 */
(function($) {
	
	var stepOneTmpl = null;
	var stepTwoTmpl = null;
	var stepThreeTmpl = null;
	
	var is_shift = false;
	var start_index = -1;
	var end_index = -1;
	
	var methods = {

		init : function( options ) {
			var settings = {
				container : this,
				connections : true,
				imports : true,
				registered : true,
				removeImport : false
			};
			
			if(options){
				$.extend(settings, options);
			}
			
			_initTmpl(settings);
			
		},
		selectUsers : function(){
			var to = new Array();
			stepOneTmpl.find('.f_connections-list .f_connection-item').each(function(index, item){
				if($(item).attr('selected') == 1){
					to.push($(item).attr('to'));
				}
			});
			return to.length > 0 ? JSON.stringify(to) : null;
		},
		selectEmails : function(){
			var email = new Array();
			stepOneTmpl.find('.f_imported-list .f_connection-item').each(function(index, item){
				if($(item).attr('selected') == 1){
					email.push($(item).attr('to')); 
				}
			});
			return email.length > 0 ? JSON.stringify(email) : null;
		},
		reloadImport : function(){
			_reloadImport();
		}
	};
	
	$.fn.contacts = function(method){
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist.' );
		}
	};
	
	function _initTmpl(settings){
		settings.container.html($('#jtmpl_plgn_contacts_step_one').tmpl(settings));
		stepOneTmpl = settings.container.find('.f_contact-step-one');
		_registerStepOneEvents(settings, stepOneTmpl);
	}
	
	function _registerStepOneEvents(settings, tmpl){
		// test here to add shift + click to select items
//		tmpl.bind('keydown', function(e){
//			if(e.keyCode == 16){
//				is_shift = true;
//				console.log('is_shift = true');
//			}
//		});
//		
//		tmpl.bind('keyup', function(e){
//			if(e.keyCode == 16){
//				is_shift = false;
//				start_index = -1;
//				end_index = -1;
//				console.log('is_shift = false');
//			}
//		});
		// shift + click end
		
		// load connections
		if(settings.connections){
			var connectionList = tmpl.find(".f_connections-list");
			connectionList.addClass('loading');
			$.getJSON("user/dashboard/j_friends", null, function(data){
				connectionList.removeClass('loading');
				if(data && data.length > 0){
					connectionList.find('.f_no_connections').hide();
					connectionList.find('.connList').show();
					_addConnectionItem(connectionList.children('ul'), data, 'user', false);
				}
			});
			
			connectionList.find('a.f_go-to-find-connections').bind('click', function(e){
				e.preventDefault();
				window.location.href = base_url + 'user/connections/find';
			});
		}
		
		// load imports
		if(settings.imports){
			var importList = tmpl.find(".f_imported-list");
			// init unregister emails TODO: need to change
			importList.addClass('loading');
	//		$.getJSON("user/import/find_unregister_import_email/", null, function(data){
			$.getJSON("user/import/j_import/" + settings.registered, null, function(data){
				importList.removeClass('loading');
				if(data.num_rows > 0)
				{
					importList.find('.f_no_import').hide();
					importList.find('.imptList').show();
					_addConnectionItem(importList.children('ul'), data.result, 'import', settings.removeImport);
				}
			});
		}
		
		// register show all function 
		tmpl.find("a.f_show_all").bind('click', function(){
			tmpl.find("a.f_connection-item").parents('li').show();
		});
		// register show selected function
		tmpl.find("a.f_show_selected").bind('click', function(){
			tmpl.find("a.f_connection-item").each(function(index, item){
				if($(item).attr('selected') == 1){
					$(item).parents('li').show();
				}else{
					$(item).parents('li').hide();
				}
			});
		});
		// register show unselect function TODO: this btn is no need? 
		tmpl.find("a.f_show_unselect").bind('click', function(){
			tmpl.find("a.f_connection-item").each(function(index, item){
				if($(item).attr('selected') == 1){
					$(item).parents('li').hide();
				}else{
					$(item).parents('li').show();
				}
			});
		});
		// register select all function
		tmpl.find('a.f_select_all').bind('click', function(e){
			e.preventDefault();
			// TODO : change this
			var connList = tmpl.find('.connList');
			var imptList = tmpl.find('.imptList');
			
			connList.find('a.f_connection-item').each(function(index, item){
				if(!$(item).attr('selected') || $(item).attr('selected') == 0){
					$(item).addClass('selected').attr('selected', 1);//.parents('li.f_'+type).addClass('selected');
					_addRecipients($(item).clone(), 'user');
				}
			});
			
			imptList.find('a.f_connection-item').each(function(index, item){
				if(!$(item).attr('selected') || $(item).attr('selected') == 0){
					$(item).addClass('selected').attr('selected', 1);//.parents('li.f_'+type).addClass('selected');
					_addRecipients($(item).clone(), 'import');
				}
			});
		});
		// register select none function
		tmpl.find('a.f_select_none').bind('click', function(e){
			// TODO : change this
			e.preventDefault();
			tmpl.find('a.f_connection-item').each(function(index, item){
				if($(item).attr('selected') == 1){
					$(item).removeClass('selected').attr('selected', 0);//.parents('li.f_'+type).removeClass('selected');
				}
			});
			// TODO : clear 
			tmpl.find('.f_recipients_list').empty();
			tmpl.find('.f_recipients').find('.f_show_selected').hide();
		});
		// register search from
		tmpl.find("input[name=search_connections]").bind('keyup', function(){
			var search = $(this).val();
			if(search != '')
			{
				tmpl.find("a.f_connection-item").each(function(index, item){
					if($(item).text().search(new RegExp(search, 'i')) == -1){
						$(item).parents('li').hide();
					}else{
						$(item).parents('li').show();
					}
				});
			}
			else
			{
				tmpl.find("a.f_connection-item").parents('li').show();
			}
		}).bind('focus', function(){
			$(this).val('');
			tmpl.find("a.f_connection-item").parents('li').show();
		});
		// register add email function
		tmpl.find("a.f_add-email-to-import").bind('click', function(){
			var add_email = tmpl.find("input[name=search_connections]").val();
			if(!is_empty(add_email) && is_email(add_email))
			{
				// need 动画效果 adding
				$.post("user/import/add_email_to_import/", "email=" + add_email, function(data){
					if(data > 0)
					{
						result = [
						          	{
						        	  email : add_email, nick_name : add_email
						          	}
						         ];
//						alert(debug(result));
						_addConnectionItem(importList.children('ul'), result, 'import', settings.removeImport);
					}
				});
			}
			else
			{
				showCaution("<?=lang('enter_right_email_please.')?>");
			}
		});
		
		// register import your contacts function
		tmpl.find("a.f_import-your-contacts").bind('click', function(e){
			e.preventDefault();
			stepTwoTmpl = settings.container.find('.f_contact-step-two'); 
			if(stepTwoTmpl.length == 0){
				stepTwoTmpl = $("#jtmpl_plgn_contacts_step_two").tmpl();
				settings.container.append(stepTwoTmpl);
				_registerStepTwoEvents(settings, stepTwoTmpl);
			}
			tmpl.hide();
			stepTwoTmpl.show();
			if(stepThreeTmpl) stepThreeTmpl.hide();
		});
		
	}
	
	function _registerStepTwoEvents(settings, tmpl){
		// register back function 
		tmpl.find("a.f_back_to_step_one").bind('click', function(e){
			e.preventDefault();
			tmpl.hide();
			stepOneTmpl.show();
			if(stepThreeTmpl) stepThreeTmpl.hide();
		});
		
		tmpl.find("a.f_plugin").bind('click', function(e){
			e.preventDefault();
			stepThreeTmpl = settings.container.find('.f_contact-step-three'); 
			if(stepThreeTmpl.length == 0){
				stepThreeTmpl = $("#jtmpl_plgn_contacts_step_three").tmpl();
				settings.container.append(stepThreeTmpl);
				_registerStepThreeEvents(settings, stepThreeTmpl);
			}
			
			tmpl.hide();
			settings.container.addClass('loading');
			// register change plugin function
			var plugin = $(this).html();
			stepThreeTmpl.find('input[name="provider[plugin]"]').val(plugin);
			var recaptcha = stepThreeTmpl.find('.f_recaptcha');
			
			var captchaImg = recaptcha.find('.f_recaptcha-image .f_catpcha-image'); 
			_refreshCaptcha(plugin, captchaImg, function(){
				settings.container.removeClass('loading');
				stepOneTmpl.hide();
				stepThreeTmpl.show();
			});
			
			captchaImg.bind('click', function(){
				_refreshCaptcha(plugin, $(this));
			});
			
//			$.get("user/import/get_recaptcha/" + plugin, null, function(data){
//				if(data && data != 'null'){
//					var url = $.parseJSON(data);
////					var img = $('img').attr('src', url);
//					recaptcha.find('.f_recaptcha-image .f_catpcha-image').attr('src', url);
//					settings.container.removeClass('loading');
//					recaptcha.show();
//				}else {
//					settings.container.removeClass('loading');
//					recaptcha.hide();
//				}
//				stepOneTmpl.hide();
//				stepThreeTmpl.show();
//			});
		});
		
		// get options TODO: 写死在select里面 or make a jtmpl to display all plugin
		/*
		if(tmpl.find("select[name=\"provider[plugin]\"]").find('option').length == 0){
			$.getJSON("user/import/get_open_invite_providers/", null, function(data){
				if(!is_empty(data))
				{
					var html = '';
					for(i in data.email)
					{
						html += "<option value='" + i + "'>" + i + "</option>";
					}
					tmpl.find("select[name=\"provider[plugin]\"]").html(html);
				}
			});
		};
		*/
	}
	
	/**
	 * Import your friends from your qq, yahoo, facebook...
	 * 
	 */
	function _registerStepThreeEvents(settings, tmpl){
		tmpl.find("a.f_back_to_step_two").bind('click', function(e){
			e.preventDefault();
			// TODO: 是否清空当前 email password captcha
			stepOneTmpl.hide();
			stepTwoTmpl.show();
			tmpl.hide();
		});
		
		var providerForm = tmpl.find("form[name=email_provider]");
		providerForm.validate({
			submitHandler: function(form){
				// what is this ?
				tmpl.find("#import_email").addClass('loading');
				var params = providerForm.serialize();
				var working = showWorking('Importing your contacts.', 'Please wait.');
				$.post("user/import/import_email/", params, function(data){
					working.dialog('close');
					data = $.parseJSON(data);
					
					switch (data.status) {
						case 1:
							if (!is_empty(data.result)) {
								stepOneTmpl.find('.f_imported-list .f_no_import').hide();
								stepOneTmpl.find('.f_imported-list .imptList').show();
								
								_addConnectionItem(stepOneTmpl.find(".f_imported-list").children('ul'), data, 'import', settings.removeImport);
								// what is this ?
								tmpl.find("#import_email").removeClass('loading');
								tmpl.find("#import_email").hide();
								// TODO: need to change here
								stepTwoTmpl.hide();
								tmpl.hide();
								stepOneTmpl.show();
							}else{
								showCaution(data.error, null, 'pop', function(){
									if (settings.onSuccess) settings.onSuccess(data.result, settings.type);
								});
							}
							break;
						case 2:
						default:
							if (typeof (data.error) == 'string') {
								var msg = data.error == 'Invalid session ID' ? 'You entered an incorrect captcha code. Please click the captcha image to receive a new one.' : data.error;
								showCaution(msg, null, 'pop');
							}else{
								showCaution('Please make sure your username/email address and password are correct.', null, 'pop');
							}
							break;
					}
				});
			}
		});
		
		// register email provider submit function 
		// 帐号/密码错误，验证码错误 超时未提示
		// 导入成功之后 回到 step one ？
		tmpl.find("a.f_email_provider_submit").bind('click', function(){ providerForm.submit();	});
	}
	// add connection li and register click function and remove function
	function _addConnectionItem(container, data, type, remove){
		var connections = $("#jtmpl_impoS").tmpl({data : data, type : type, remove : remove});
		container.append(connections);
		connections.find('a.f_connection-item').each(function(index, item){
			$(item).bind('click', function(e){
				e.preventDefault();
				_onConnectionClick($(this), type);
				/*
//				console.log("is_shift = " + is_shift);
				if(is_shift){
					if(start_index == -1){
						start_index = index;
						$(this).addClass('selected').attr('selected', 1).parents('li.f_'+type).addClass('selected');
					}else{
						if(end_index == -1){
							end_index = index;
							var start = end_index > start_index ? start_index : end_index;
							var end = end_index > start_index ? end_index : start_index;
							for(var i = start; i <= end; i++){
								connections.find('a.f_connection-item').eq(i).addClass('selected').attr('selected', 1).parents('li.f_'+type).addClass('selected');
							}
						}else{
							if(end_index != index){
								// 取消之前选择
								var start = end_index > start_index ? start_index : end_index;
								var end = end_index > start_index ? end_index : start_index;
								for(var i = start; i <= end; i++){
									connections.find('a.f_connection-item').eq(i).removeClass('selected').attr('selected', 0).parents('li.f_'+type).removeClass('selected');
								}
								// 重新选择
								end_index = index;
								var start = end_index > start_index ? start_index : end_index;
								var end = end_index > start_index ? end_index : start_index;
								for(var i = start; i <= end; i++){
									connections.find('a.f_connection-item').eq(i).addClass('selected').attr('selected', 1).parents('li.f_'+type).addClass('selected');
								}
							}
						}
					}
				}else{
					_onConnectionClick($(this), type);
				}
				*/
			});
		});
		
		// remove import function
		if(remove){
			connections.find('a.f_remove_connection').bind('click', function(e){
				e.preventDefault();
				var currentImport = $(this).parents('li.f_import');
				var id = currentImport.attr('import_id');
				showConfirm('Remove Imported Connection', 'Are you sure you want to remove this imported connection?', null, function(){
					$.post('user/import/remove', {id:id}, function(data){
						data = $.parseJSON(data);
						currentImport = $('.imptList').find('.f_import[import_id='+data+']');
						currentImport.fadeOut('fast', function(){currentImport.remove();});
					});
				});
			});
		}
	}
	
	function _onConnectionClick(conn, type){
		var recipientsList = stepOneTmpl.find('.f_recipients_list');
		var more = stepOneTmpl.find('.f_recipients').find('.f_show_selected');
		var connList = stepOneTmpl.find('.connList');
		var imptList = stepOneTmpl.find('.imptList');
		
		if(conn.attr('selected') == 1){
			conn.removeClass('selected').attr('selected', 0);
			// 移除 f_recipients_list 中对应到选项
			recipientsList.find('a.f_connection-item[to="'+conn.attr('to')+'"]').remove();
			// 判断 f_recipients_list 总数 小于 5 隐藏 more link
			if(recipientsList.find('.f_connection-item').length < 5){
				more.hide();
			}
		}else{
			conn.addClass('selected').attr('selected', 1);
			// 添加 收件人到 f_recipients_list
			_addRecipients(conn.clone(), type);
		}
	}
	
	function _addRecipients(conn, type){
		var recipientsList = stepOneTmpl.find('.f_recipients_list');
		var more = stepOneTmpl.find('.f_recipients').find('.f_show_selected');
		var connList = stepOneTmpl.find('.connList');
		var imptList = stepOneTmpl.find('.imptList');
		// 添加 收件人到 f_recipients_list
		conn.bind('click', function(e){
			e.preventDefault();
			if(type == 'user'){
				connList.find('a.f_connection-item[to="'+conn.attr('to')+'"]').click();
			}else{
				imptList.find('a.f_connection-item[to="'+conn.attr('to')+'"]').click();
			}
		});
		// 判断 f_recipients_list 总数 大于 5 显示 more link
		recipientsList.append(conn);
		if(recipientsList.find('.f_connection-item').length > 5){
			more.show();
		}
	}
	
	/**
	 * Method to refresh captcha image
	 * @param plugin
	 * @param item
	 */
	function _refreshCaptcha(plugin, item, success){
		item.attr('src', '');
		var parentDiv = item.parents('.f_recaptcha-image');
		parentDiv.addClass('loading');
		$.get("user/import/get_recaptcha/" + plugin, null, function(data){
			if(data && data != 'null'){
				var url = $.parseJSON(data);
				parentDiv.removeClass('loading');
				item.attr('src', url);
				item.parents('.f_recaptcha').show();
			}else{
				item.parents('.f_recaptcha').hide();
			}
			if(success) success();
		});
	}
	
	function _reloadImport()
	{
		
		stepTwoTmpl.hide();
		stepOneTmpl.show();
		var importList = stepOneTmpl.find(".f_imported-list");
		// init unregister emails TODO: need to change
		importList.children('ul').empty();
		importList.addClass('loading');
//		$.getJSON("user/import/find_unregister_import_email/", null, function(data){
		$.getJSON("user/import/j_import/false", null, function(data){
			importList.removeClass('loading');
			if(data.num_rows > 0)
			{
				importList.find('.f_no_import').hide();
				importList.find('.imptList').show();
				_addConnectionItem(importList.children('ul'), data.result, 'import', true);
			}
		});
	}
	
	var doNothing = function(){};
})(jQuery);