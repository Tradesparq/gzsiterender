/**
 * This is a ko ui product inquire popup.
 * 
 * @depend 
 * 
 * @author KEVIN
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.inquire = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);

    	/**
    	 * cancel
    	 */
    	valueAccessor().data.cancel = function() {
			valueAccessor().data.inquireing(false);
		}
    	
    	/**
    	 * submit
    	 */
    	valueAccessor().data.submit = function(data, event) {
    		var $form = $element.find('form#inquireForm');
    		if ($form.valid()) {
				$this = $(event.currentTarget);
				$this.button('loading');
				
				var postData = {};
				postData.toUser = valueAccessor().data.product.product.user_id;
				postData.targetType = 'product';
				postData.targetId = valueAccessor().data.product.product.id;
				postData.targetOwnerId = valueAccessor().data.product.product.user_id;
				postData.subject = $form.find('input#subject').val();
				postData.message = $form.find('textarea').val();
//				postData.recaptcha = $form.find('input#recaptcha').val();

				if($form.find('input#sendToSimilarProduct').attr("checked")) {
					postData.sendToSimilarProduct = true;
				} else {
					postData.sendToSimilarProduct = false;
				}
				
				if(ko.utils.unwrapObservable(valueAccessor().data.product.product.has_connected)) {
					postData.inviteToConnect = false;
				} else if($form.find('input#inviteToConnect').attr("checked")) {
					postData.inviteToConnect = true;
				} else {
					postData.inviteToConnect = false;
				}
				$.ajax({
					url: 'api/conversations/inquiry/',
					type: 'put',
					data: postData,
					success: function(data){
						if (data) {
							if (data > 0) {
								valueAccessor().data.inquireing(false);   //close popop when send inquiry successfully
								appViewModel.alert('success', '', '<?php echo lang("your_message_send_successful")?>', 5000);
//								appViewModel.goBack();
							} else if (data == 0) {
								appViewModel.alert('block', '', '<?php echo lang("enter_the_user_or_email_who_you_want_message_to,_please!")?>', 5000);
							} else if (data == -1){
								appViewModel.alert('error', '', "<?=lang('more_than_limit_on_message_of_one_day')?>", 5000);
							} else if (data == -2){
								appViewModel.alert('error', '', "<?php echo lang('incorrect-captcha-sol')?>", 5000);
							} else {
								appViewModel.alert('error', '', "<?=lang('fasongshibai')?>", 5000);
							}
						}
					}
				}).done(function(){
					$this.button('reset');
				});
			}
		}
    }
};
