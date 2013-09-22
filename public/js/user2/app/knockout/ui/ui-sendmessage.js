/**
 * This is a ko ui send massage popup
 */

ko.bindingHandlers.sendmassage = {
		init: function(element, valueAccessor, allBindings, viewModel){
			var $element = $(element);
			
			//close popup
			valueAccessor().data.cancel = function(){
				valueAccessor().data.sending(false);
			};
			
			//submit message
			valueAccessor().data.submit = function(data, event){
				if(data.id){
					//on profile/connections company/colleagues page "send message" popup
					var user_data = data;
				}else{
					//click search profiledetail/companydetail/productsdetail/connectiondetail/rating page "send message" button
					var user_data = data.profile();
				}
				var $form = $element.find('form#connMessage');
				if($form.valid()){
					var subject = $form.find('input#subject').val();
					var message = $form.find('textarea').val();
//					var recaptcha = $form.find('input#recaptcha').val();
					var user_id = user_data.id;
					var targetType = 'user';
					
					var sendData = {
							toUser: user_id,
							subject: subject,
							message: message,
							targetType: targetType,
							inviteToConnect: false
						};
					
					if(ko.utils.unwrapObservable(data.has_connected)) {
						sendData.inviteToConnect = false;
					} else if($form.find('input#inviteToConnect').attr("checked")) {
						sendData.inviteToConnect = true;
					} else {
						sendData.inviteToConnect = false;
					}					
					
					var $sendBtn = $form.find('button.f_submit');
					$sendBtn.button('loading');
					$.ajax({
						url: 'api/conversations/inquiry/',
						type: 'put',
						data: sendData,
						success: function(data){
						if (data && data > 0) {
							valueAccessor().data.sending(false);
							appViewModel.alert('success', null, "<?php echo lang('message_send_success')?>", 3000);
						} else if (data == -1){
							appViewModel.alert('error', '', "<?=lang('more_than_limit_on_message_of_one_day')?>", 5000);
						} else if (data == -2){
							appViewModel.alert('error', '', "<?php echo lang('incorrect-captcha-sol')?>", 5000);
						} else {
							appViewModel.alert('error', '', "<?=lang('fasongshibai')?>", 5000);
						}
					}
					}).done(function(){
						$form.find('button[name="submit"]').button('reset');
					});
					
				}
			}
		}
};