/**
 * This is a ko ui import.
 *
 * @depend
 *
 * @author jimmy
 */

// used for import yahoo success
var _onImportSuccess;

/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.importcontacts = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);
    	// dashboard
    	valueAccessor().data.dashboard = ko.observable(true);
    	// type
    	valueAccessor().data.type = ko.observable('');
    	// email account
    	valueAccessor().data.email = ko.observable('');
    	// password
    	valueAccessor().data.password = ko.observable('');
    	// file
    	valueAccessor().data.filename = ko.observable('');
    	// file content
    	valueAccessor().data.fileContent = ko.observableArray([]);
    	// file preview
    	valueAccessor().data.filePreview = ko.observable(false);
    	// firstNameField
    	valueAccessor().data.firstNameField = ko.observable('');
    	// lastNameField
    	valueAccessor().data.lastNameField = ko.observable('');
    	// emailField
    	valueAccessor().data.emailField = ko.observable('');
    	// importType
    	if(valueAccessor().data.importType)
    	{
    		valueAccessor().data.importType = ko.observable(valueAccessor().data.importType);
    	}
    	else
    	{
    		valueAccessor().data.importType = ko.observable('introduction');
    	}
    	// showCloseButton
    	if (valueAccessor().data.showCloseButton == undefined) {
    		valueAccessor().data.showCloseButton = true;
    	}

    	var gaRoutes = appViewModel.routes().page + '/' + appViewModel.routes().action;
    	/**
    	 * gmail
    	 */
    	valueAccessor().data.gmail = function() {
    		valueAccessor().data.type('gmail');
            valueAccessor().data.oauthLogin(BASEURL + "public/oauth/gmail_login");
            _gaq.push(['_trackEvent', 'Import contacts', 'gmail ' + gaRoutes + ' click']);
		}
    	/**
    	 * yahoo
    	 */
    	valueAccessor().data.yahoo = function() {
    		valueAccessor().data.type('yahoo');
    		valueAccessor().data.oauthLogin(BASEURL + "user/oauth/" + valueAccessor().data.type() + "_oauth_login/_onImportSuccess");
    		_gaq.push(['_trackEvent', 'Import contacts', 'yahoo ' + gaRoutes + ' click']);
		}
    	/**
    	 * oauth login
    	 */
    	valueAccessor().data.oauthLogin = function(url) {
    		var left = (screen.width / 2) - 400;
			var top = (screen.height / 2) - 250;
			window.open(url, "", "height=600, width=800, left=" + left + ", top=" + top + " toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=yes");
    	}
    	/**
    	 * sohu
    	 */
    	valueAccessor().data.sohu = function() {
    		valueAccessor().data.dashboard(false);
    		valueAccessor().data.type('sohu');
    		_gaq.push(['_trackEvent', 'Import contacts', 'sohu ' + gaRoutes + ' click']);
		}
    	/**
    	 * file
    	 */
    	valueAccessor().data.file = function() {
    		valueAccessor().data.dashboard(false);
    		valueAccessor().data.type('file');
    		_gaq.push(['_trackEvent', 'Import contacts', 'file ' + gaRoutes + ' click']);
		}
    	/**
    	 * cancel to dashboard
    	 */
    	valueAccessor().data.cancel = function() {
    		valueAccessor().data.type('');
    		valueAccessor().data.email('');
        	valueAccessor().data.password('');
        	valueAccessor().data.filename('');
        	valueAccessor().data.fileContent([]);
        	valueAccessor().data.filePreview(false);
        	valueAccessor().data.firstNameField('');
        	valueAccessor().data.lastNameField('');
        	valueAccessor().data.emailField('');
        	valueAccessor().data.dashboard(true);
        	$element.find('div#uploadfile-list').empty();
        	$element.find('textarea[name="import[text]"]').attr("value","");
        	$.each($element.find('div.html5'), function(index, value){
        		if(index != 0){
            		$(value).remove();
        		}
        	});
		}

    	/**
    	 * select first name field
    	 */
    	valueAccessor().data.selectFirstNameField = function(data, event) {
    		valueAccessor().data.firstNameField(data.field);
    	}
    	/**
    	 * select last name field
    	 */
    	valueAccessor().data.selectLastNameField = function(data, event) {
    		valueAccessor().data.lastNameField(data.field);
    	}
    	/**
    	 * select email name field
    	 */
    	valueAccessor().data.selectEmailField = function(data, event) {
    		valueAccessor().data.emailField(data.field);
    	}

    	/**
    	 * import success
    	 */
    	if (valueAccessor().data.onImportSuccess) {
    		_onImportSuccess = function(data, type, typeTotal, refreshImports){
    			valueAccessor().data.onImportSuccess(data, type, typeTotal, refreshImports);
    			valueAccessor().data.cancel();
    			// TODO: clear cache data of ui-contacts
				if (appViewModel.myConnections) {
					delete appViewModel.myConnections;
				}
				if (appViewModel.myImports) {
					delete appViewModel.myImports;
				}
				// onSubmit
				if (valueAccessor().data.onSubmit) {
					valueAccessor().data.onSubmit(data);
				}
    			saveUserActions('Import contacts', CURRENTUSER.id, type, typeTotal.imports_email);
    			_gaq.push(['_trackEvent', 'Import contacts', type + ' success', typeTotal.imports_email]);
    		};
		} else {
			_onImportSuccess = function(data, type, typeTotal){
				if(data){
					var index = 0;
					for(var item in data){
						if(item) index++;
					}
//					var msg = '<?=lang("congratulations_you_have_successfully_imported")?> ' + index + ' <?=lang("ge_connections")?>';
					var msg = '<?php echo lang("import_email_total")?> ' + typeTotal.origin_contacts + '. <?php echo lang("imported_contacts")?> ' + typeTotal.imports_email + '. <?php echo lang("already_exists_email")?> ' + typeTotal.exists_email + ', <?php echo lang("yourself_email")?> ' + typeTotal.userself_email;

					appViewModel.alert('success', '', msg, 5000);

					valueAccessor().data.cancel();

					if (valueAccessor().data.afterImportSuccess) {
						valueAccessor().data.afterImportSuccess();
					}
					// TODO: clear cache data of ui-contacts
					if (appViewModel.myConnections) {
						delete appViewModel.myConnections;
					}
					if (appViewModel.myImports) {
						delete appViewModel.myImports;
					}
					// onSubmit
					if (valueAccessor().data.onSubmit) {
						valueAccessor().data.onSubmit(data);
					}
					saveUserActions('Import contacts', CURRENTUSER.id, type, typeTotal.imports_email);
					_gaq.push(['_trackEvent', 'Import contacts', type + ' success', typeTotal.imports_email]);
				}
			};
		}

    	/**
    	 * import failed
    	 */
    	if (valueAccessor().data.onImportFailed) {
    		_onImportFailed = valueAccessor().data.onImportFailed;
		} else {
			_onImportFailed = function(error){
				appViewModel.alert('error', '', error, 5000);
			};
		}

    	/**
    	 * submit
    	 */
    	valueAccessor().data.submit = function(form) {
    		var $form = $(form);
    		if ($form && $form.valid()) {
    			var $submit = $form.find('button.f_submit');
    			$submit.button('loading');
//    			$form.find('input').attr({'disabled': ''}); // 当input被disabled之后，jquery serialize 会取不到该值
				$.post("user/import/import_email/", $form.serialize(), function(data) {
					data = $.parseJSON(data);
					switch (data.status) {
						case 1:
							if (data.error) {
								_onImportFailed(data.error);
							} else {
								_onImportSuccess(data.result, valueAccessor().data.type(), data.type_total);
                                if(data.InviteVIP){
                                    window.location.reload();
                                }
							}
							break;
						case 2:
						default:
							if (typeof (data.error) == 'string') {
								var msg = data.error == 'Invalid session ID' ? "<?=lang('you_entered_an_incorrect_captcha_code._please_click_the_captcha_image_to_receive_a_new_one.')?>" : data.error;
								appViewModel.alert('error', '', msg, 3000);
							}else{
								appViewModel.alert('error', '', "<?=lang('please_make_sure_your_username/email_address_and_password_are_correct.')?>", 3000);
							}
							break;
					}
				}).done(function(){
					$submit.button('reset');
				});
    		}
    	}
    	
    	/**
    	 * add file
    	 */
    	valueAccessor().data.addFile = function(file) {
    		valueAccessor().data.filename(file);
    		// preview file
    		$.post(BASEURL + 'user/import/get_content_from_file/', {file:file, fomart:'object'}, function(data){
    			data = $.parseJSON(data);

    			switch (data.status) {
    				case 1:
    					valueAccessor().data.fileContent(data.result);
    					valueAccessor().data.filePreview(true);
    					// TODO: preview fields on option mouseover
    					break;
    				case 2:
    				default:
    					if (typeof (data.error) == 'string') {
    						appViewModel.alert('error', '', data.error, 5000);
    					}
    					break;
    			}
    		});
        	$.each($element.find('div.html5'), function(index, value){
        		if(index != 0){
            		$(value).remove();
        		}
        	});
        	valueAccessor().data.firstNameField('');
        	valueAccessor().data.lastNameField('');
        	valueAccessor().data.emailField('');
    	}
    	/**
    	 * submit text or file
    	 */
    	valueAccessor().data.submitContacts = function() {
    		// check type and validate
			var inputType = $element.find('input[name="import[type]"]');
			// TODO：1 如果type=file input【file】非空 type=file
			// TODO：2 如果input【file】&&【textarea】非空 type=text
			// TODO：3 如果都空 type = file
			var importFile = $element.find('input[name="import[file]"]').val().trim();
			var importText = $element.find('textarea[name="import[text]"]').val().trim();
			// set type
			if(importFile){
				inputType.val('file');
			}else if(importText){
				inputType.val('text');
			}
			var type = inputType.val();
			if(type == 'text' && ! $element.find('textarea[name="import[text]"]').val().trim()){
				appViewModel.alert('error', '', "<?=lang('enter_email_content_please!')?>", 5000);
				return;
			}
			if(type == 'file'){
				if( ! $element.find('input[name="import[file]"]').val().trim()){
					appViewModel.alert('error', '', "<?=lang('upload_a_file_first_please')?><?=lang('!')?>", 5000);
					return;
				}

				var $firstNameInput = $element.find('input[name="import[field][first_name]"]');
				var $lastNameInput = $element.find('input[name="import[field][last_name]"]');
				var $emailInput = $element.find('input[name="import[field][email]"]');

				if($emailInput.val() == 0
					|| $firstNameInput.val() == 0
					|| $lastNameInput.val() == 0){
					appViewModel.alert('error', '', "<?=lang('set_field_please!')?>", 5000);
					return;
				}
				if($emailInput.val() == $firstNameInput.val()
					|| $emailInput.val() == $lastNameInput.val()
					|| $firstNameInput.val() == $lastNameInput.val()){
					appViewModel.alert('error', '', "<?=lang('you_can\t_set_the_same_field!')?>", 5000);
					return;
				}
			}
			var $form = $element.find('form');
			var params = $form.serialize();
			var $submit = $form.find('a.f_submit');
			$submit.button('loading');
			$.post("user/import/import_email_from_text_or_file/", params, function(data) {
				data = $.parseJSON(data);
				switch (data.status) {
					case 1:
						if (data.error) {
							appViewModel.alert('error', '', data.error, 5000);
						} else {
							_onImportSuccess(data.result, type, data.type_total);
                            if(data.InviteVIP){
                                window.location.reload();
                            }
						}
						break;
					case 2:
					default:
						if (typeof (data.error) == 'string') {
							appViewModel.alert('error', '', data.error, 5000);
						}
						break;
				}
			}).done(function(){
				$submit.button('reset');
				$element.find('textarea[name="import[text]"]').attr("value","");
			});
    	}
    	
    	/**
    	 * submit file
    	 */
    	valueAccessor().data.submitFile = function() {
    		// check type and validate
			var inputType = $element.find('input[name="import[type]"]');
			var type = inputType.val();
			console.log(type);
    		if(type != 'file') {
    			return;
    		}
    		
    		var importFile = $element.find('input[name="import[file]"]').val().trim();
			if( ! importFile){
				appViewModel.alert('error', '', "<?=lang('upload_a_file_first_please')?><?=lang('!')?>", 5000);
				return;
			}

			var $firstNameInput = $element.find('input[name="import[field][first_name]"]');
			var $lastNameInput = $element.find('input[name="import[field][last_name]"]');
			var $emailInput = $element.find('input[name="import[field][email]"]');

			if($emailInput.val() == 0
				|| $firstNameInput.val() == 0
				|| $lastNameInput.val() == 0){
				appViewModel.alert('error', '', "<?=lang('set_field_please!')?>", 5000);
				return;
			}
			if($emailInput.val() == $firstNameInput.val()
				|| $emailInput.val() == $lastNameInput.val()
				|| $firstNameInput.val() == $lastNameInput.val()){
				appViewModel.alert('error', '', "<?=lang('you_can\t_set_the_same_field!')?>", 5000);
				return;
			}
			
			var $form = $element.find('form');
			var params = $form.serialize();
			var $submit = $form.find('a.f_submit');
			$submit.button('loading');
			$.post("user/import/import_email_from_text_or_file/", params, function(data) {
				data = $.parseJSON(data);
				switch (data.status) {
					case 1:
						if (data.error) {
							appViewModel.alert('error', '', data.error, 5000);
						} else {
							_onImportSuccess(data.result, type, data.type_total);
                            if(data.InviteVIP){
                                window.location.reload();
                            }
						}
						break;
					case 2:
					default:
						if (typeof (data.error) == 'string') {
							appViewModel.alert('error', '', data.error, 5000);
						}
						break;
				}
			}).done(function(){
				$submit.button('reset');
				$element.find('textarea[name="import[text]"]').attr("value","");
			});
    	}
    	
    	/**
    	 * submit text
    	 */
    	valueAccessor().data.submitText = function() {
    		// check type and validate
			var inputType = $element.find('input[name="import[type]"]');
			var type = inputType.val();
			if(type != 'text') {
    			return;
    		}

			var importText = $element.find('textarea[name="import[text]"]').val().trim();

			if(! importText){
				appViewModel.alert('error', '', "<?=lang('enter_email_content_please!')?>", 5000);
				return;
			}
			
			var $form = $element.find('form');
			var params = $form.serializeArray();
			
			params = params.concat([{
				name: 'import[subject]',
				value: "<?=lang('share_my_profile_subject')?>"
			},{
				name: 'import[message]',
				value: "<?=lang('share_my_profile_message')?>"
			}]);

			var $submit = $form.find('a.f_submit');
			$submit.button('loading');
			$.post("user/import/import_and_invite_from_text/", params, function(data) {
				data = $.parseJSON(data);
				switch (data.status) {
					case 1:
						if (data.error) {
							appViewModel.alert('error', '', data.error, 5000);
						} else {
							_onImportSuccess(data.result, type, data.type_total, true);
                            if(data.InviteVIP == "InviteVIP"){
        						// check if use don't has phone number
        						if(!(CURRENTUSER.office_phone && CURRENTUSER.mobile_phone))
        						{
        							$('div#after_invite_five_contacts').modal({
        								backdrop: "static",
        								show: true
        							});
        						}
        						else
        						{
        							window.location.reload();
        						}
                            }
                            
                            appViewModel.alert('success', null, "Contacts were invited.", 5000);
						}
						break;
					case 2:
					default:
						if (typeof (data.error) == 'string') {
							appViewModel.alert('error', '', data.error, 5000);
						}
						break;
				}
			}).done(function(){
				$submit.button('reset');
				$element.find('textarea[name="import[text]"]').attr("value","");
			});
    	}
    	
    	/**
    	 * Enable tabbable tabs via JavaScript 
    	 */
    	valueAccessor().data.activeTab = function(importType, data, event) {
    		if(importType) {
    			valueAccessor().data.importType(importType);
    		}
    	}
    }
};