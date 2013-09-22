/**
 * This is a ko ui highlight keyword.
 * 
 * @depend 
 * 
 * @author shaquille
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.highlightkeyword = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);
    	//  keyword hightlight
    	var keywordHighlight = ko.observable('');
    	//  api keyword hightlight
    	var apiKeywordHighlight = 'api/keyword/keyword_highlight/';
		
		valueAccessor().data.loadHighlightKeyword = function() {
			
			if( appViewModel.routes().keyword && appViewModel.routes().keyword != '_' ) {		
				$.getJSON(apiKeywordHighlight + 'keyword/' + appViewModel.routes().keyword, function(data){
					if (data) {
						var keyword = data;
					} else {
						var keyword = appViewModel.routes().keyword;
					}
					
					$('.highlightkeyword').each(function (index, element){
						highLight(element, keyword);
					});
				});
			}
			
		}
    		
		valueAccessor().data.loadHighlightKeyword();
    }
};
