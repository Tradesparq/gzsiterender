/**
 * This is a ko ui modalimport.
 *
 * @depend
 *
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.modalimport = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);

		// do not ask
		valueAccessor().data.doNotAsk = ko.observable(false);

		// check page action
    	if ( ! valueAccessor().data
    		|| valueAccessor().data.page != valueAccessor().data.routes.page
    		|| valueAccessor().data.action != valueAccessor().data.routes.action) {
    		return;
    	}

    	// show dialog
    	var cookieKey = $.cookie(valueAccessor().data.key);
		var showDialog = cookieKey === null ? Math.random() >= valueAccessor().data.percent : ! cookieKey;
		if(showDialog) {
			$element.modal({
				backdrop: "static",
				keyboard: false,
				show: true
			});
		}

		// close dialog
		valueAccessor().data.closeImportContactsDialog = function(){
			$element.modal('hide');
			if (valueAccessor().data.doNotAsk()) {
				_gaq.push(['_trackPageview','/track/dialog_after_search/A/do_not_ask']);
				// 点过 do not ask again 之后在cookie 在保存2星期之内都不会显示了
				$.cookie(valueAccessor().data.key, true, { expires: valueAccessor().data.expires ? valueAccessor().data.expires : 30, path: '/' });
			}
		};
    }
};