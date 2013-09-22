/**
 * Plugin TS-Contacts
 * Get select users of my friends 
 * Get select emails of my search
 * 
 */
(function($) {
	
	var methods = {

		init : function( options ) {
			var settings = {
				container : this,
				type : null,
				onSuccess : null
			};
			
			if(options){
				$.extend(settings, options);
			}
			
			if(settings.type == 'yahoo'){
				_initYahoo(settings);
			}else{				
				_init(settings);			
			}
		}
	};
	
	$.fn.plimport = function(method){
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist.' );
		}
	};
	
	function _init(settings){
		var importDialog = $('#jtmpl_plgn_import').tmpl(settings);
		
		_registerEvents(settings, importDialog);
		
		importDialog.dialog({
			dialogClass : 'dialog-no-title dialog-content', 
			resizable: false,
			modal: true,
			draggable: false,
			width: 600,
			height: 600,
			close : function(){
				importDialog.remove();
			}
		});
	}
	
	function _registerEvents(settings, importDialog){
		importDialog.find('.f_cancel').bind('click', function(e){
			e.preventDefault();
			importDialog.dialog('close');
		});
		
//		if(settings.type == 'qq'){
			// register change plugin function
			var recaptcha = importDialog.find('.f_recaptcha');
			
			var captchaImg = recaptcha.find('.f_recaptcha-image .f_catpcha-image'); 
			captchaImg.bind('click', function(){
				_refreshCaptcha(settings.type, $(this));
			});
			
			_refreshCaptcha(settings.type, captchaImg);
//		}
		
		var providerForm = importDialog.find("form[name=email_provider]");
		providerForm.validate({
			submitHandler: function(form){
				var params = providerForm.serialize();
				$.post("user/import/import_email/", params, function(data){
					data = $.parseJSON(data);
					
					if( ! data){
						showCaution('Please make sure your account/password is right.', null, 'pop');
						return;
					}
					
					if(typeof(data) == 'string'){
						var msg = data == 'Invalid session ID' ? 'Invalid captcha image, Click to change one.' : data;
						showCaution(msg, null, 'pop');
						return;
					}
					
					if(!is_empty(data))
					{
						importDialog.dialog('close');
						if(settings.onSuccess) settings.onSuccess(data);
					}
				});
			}
		});
		
		// register email provider submit function 
		// 帐号/密码错误，验证码错误 超时未提示
		importDialog.find("a.f_submit").bind('click', function(){ providerForm.submit(); });
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
	
	function _initYahoo(settings){
		var left = (screen.width/2)-400;
		var top = (screen.height/2)-250;
		window.open(base_url + "user/oauth/" + settings.type + "_oauth_login/" + settings.onSuccess,"","height=600, width=800, left=" + left + ", top=" + top + " toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=yes");
	}
	
})(jQuery);