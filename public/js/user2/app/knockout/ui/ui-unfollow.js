/**
 * This is a ko ui unfollow.
 * 
 * @depend 
 * 
 * @author lulu
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.unfollow = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);

    	/**
    	 * cancel
    	 */
    	valueAccessor().data.cancel = function() {
			valueAccessor().data.unfollowing(false);
		};
    	
    	/**
    	 * submit
    	 */
    	valueAccessor().data.submit = function(data, event) {
			$this = $(event.currentTarget);
			$this.button('loading');
			$.ajax({
				url: 'api/connections/follow',
				type: 'delete',
				data: { to_user_id: valueAccessor().data.user.id },
				success: function(data){
					if (data) {
						valueAccessor().data.unfollowing(false);   //控制UI窗口是否显示
						valueAccessor().data.user.has_follow(false);
						appViewModel.alert('success', '', '<?php echo lang("unfollow")?>', 5000);
					}
				}
			}).done(function(){
				$this.button('reset');
			});
		}
    }
};