/**
 * This is a ko ui follow.
 * 
 * @depend 
 * 
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.follow = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);

    	/**
    	 * cancel
    	 */
    	valueAccessor().data.cancel = function() {
			valueAccessor().data.following(false);
		}
    	
    	/**
    	 * submit
    	 */
    	valueAccessor().data.submit = function(data, event) {
			$this = $(event.currentTarget);
			$this.button('loading');
			$.ajax({
				url: 'api/connections/follow',
				type: 'put',
				data: { to_user_id: valueAccessor().data.user.id },
				success: function(data){
					if (data) {
						valueAccessor().data.following(false);
						valueAccessor().data.user.has_follow(true);
						appViewModel.alert('success', '', '<?php echo lang("success_followed")?>', 5000);
					}
				}
			}).done(function(){
				$this.button('reset');
			});
		}
    }
};