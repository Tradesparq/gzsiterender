/**
 * This is a ko ui connect.
 * 
 * @depend 
 * 
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.connect = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);

    	/**
    	 * cancel
    	 */
    	valueAccessor().data.cancel = function() {
			valueAccessor().data.connecting(false);
		}
    	
    	/**
    	 * submit
    	 */
    	valueAccessor().data.submit = function(data, event) {
    		var $form = $element.find('form#connectForm');
    		if ($form.valid()) {
        		if(valueAccessor().data.user.register_id) {
        			var user_id = valueAccessor().data.user.register_id;
        		} else {
        			var user_id = valueAccessor().data.user.id;
        		}
    			
				$this = $(event.currentTarget);
				$this.button('loading');
				$.ajax({
					url: 'api/connections/invitation',
					type: 'put',
					data: { to_user_id: user_id, invitation: $form.find('textarea').val() },
					success: function(data){
						if (data) {
							valueAccessor().data.connecting(false);
							
							if(typeof ko.utils.unwrapObservable(valueAccessor().data.user).has_invited == 'function'){
								ko.utils.unwrapObservable(valueAccessor().data.user).has_invited(true);
							}

							// set has_invited true
							if (valueAccessor().data.onSuccess) {
								valueAccessor().data.onSuccess(valueAccessor().data);
							}
							appViewModel.alert('success', '', "<?=lang('your_connection_request_has_been_sent')?>", 5000);
						}
					}
				}).done(function(){
					$this.button('reset');
				});
			}
		}
    }
};
