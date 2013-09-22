/**
 * This is a ko ui reportabuse.
 * 
 * @depend 
 * 
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.reportabuse = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);
    	// api abuse
    	valueAccessor().data.apiAbuse = 'api/messages/reportabuse/';
    	// url
    	valueAccessor().data.url = window.location.href;
    	// reason
    	valueAccessor().data.reason = ko.observable("<?=lang('posted_illegal_advertising')?>");
    	// reasons
    	valueAccessor().data.reasons = ko.observableArray([
    		"<?=lang('posted_illegal_advertising')?>",
    		"<?=lang('concerning_the_personnel_attacks')?>",
    		"<?=lang('sexual_content')?>",
    		"<?=lang('other')?>"
    	]);
    	/**
    	 * select reason
    	 */
    	valueAccessor().data.selectReason = function(data, event) {
    		valueAccessor().data.reason(data);
    	}
		/**
		 * cancel
		 */
		valueAccessor().data.cancel = function(data, event) {
			$element.find('textarea[name="remark"]').val('');
			valueAccessor().data.reason("<?=lang('posted_illegal_advertising')?>");
			valueAccessor().data.reporting(false);
		}
		/**
		 * submit
		 */
		valueAccessor().data.submit = function(form) {
			var $form = $(form);
			if ($form && $form.valid()) {
				var $sendBtn = $form.find('button.f_submit');
				$sendBtn.button('loading');
				$.ajax({
					url: valueAccessor().data.apiAbuse,
					type: 'put',
					data: $form.serialize(),
					success: function(data){
						if (data > 0) {
							appViewModel.alert('success', '', "<?=lang('your_report_abuse_comment_has_been_submitted_and_will_be_addressed_promptly.')?>", 5000);
							valueAccessor().data.cancel();
						} else {
							appViewModel.alert('error', '', "<?=lang('message_send_faild')?>", 5000);
						}
					}
				}).done(function(){
					$sendBtn.button('reset');
				});
			}
		}
    }
};