/**
 * This is a ko ui invite.
 *
 * @depend
 *
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.invite = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);

    	/**
    	 * cancel
    	 */
    	valueAccessor().data.cancel = function() {
			valueAccessor().data.inviting(false);
		}

    	/**
    	 * submit
    	 */
    	valueAccessor().data.submit = function(data, event) {
    		var $form = $element.find('form');
    		if ($form.valid()) {
				$this = $(event.currentTarget);
				$this.button('loading');
				$.ajax({
					url: 'api/connections/import_connection',
					type: 'post',
					data: { to_emails: [valueAccessor().data.importConnection.email], subject: $form.find('input[name="subject"]').val(), message: $form.find('textarea').val() },
					success: function(data){
						if (data) {
							if(data == "InviteVIP"){
								// check if use don't has phone number
								if(!(CURRENTUSER.office_phone && CURRENTUSER.mobile_phone))
								{
									$('div#after_invite_five_contacts').modal({
										backdrop: "static",
										show: true
									});
									valueAccessor().data.completePhone(true);
								}
								else
								{
									window.location.reload();
								}
							}
							
							valueAccessor().data.inviting(false);
							if (valueAccessor().data.onSuccess) {
								valueAccessor().data.onSuccess(data);
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