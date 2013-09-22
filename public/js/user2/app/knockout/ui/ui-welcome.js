/**
 * This is a ko ui welcome.
 *
 * @depend
 *
 * @author Shaquille
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.welcome = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);

    	// show dialog
    	var cookieKey = $.cookie(valueAccessor().data.key);
    	// Remove comment for testing only.
    	// cookieKey = CURRENTUSER.id;
		var showDialog = cookieKey === CURRENTUSER.id ? true : false;
		if(showDialog) {
			$element.modal({
				backdrop: "static",
				keyboard: false,
				show: true
			});
		}

		// close dialog
		valueAccessor().data.closeWelcomeDialog = function(){
			$element.modal('hide');
			// Show it only first time a user logs in
			$.cookie(valueAccessor().data.key, null, { expires: valueAccessor().data.expires ? valueAccessor().data.expires : 30, path: '/' });
		};
		
		valueAccessor().data.submit = function(formElement){
			valueAccessor().data.closeWelcomeDialog();
			
			$form = $(formElement);
			if ($form) {
				var keyword = $form.find('input[name=keyword]').val();
				if(keyword){
					app.setLocation('#search/products/keyword=' + keyword);
				}else{
					return false;
				}
			}
		};
		
		valueAccessor().data.addProduct = function(){
			valueAccessor().data.closeWelcomeDialog();
			
			app.setLocation('#products/add');
		};
    }
};