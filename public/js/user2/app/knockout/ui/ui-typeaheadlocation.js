/**
 * This is a simple version typeahead location ui 
 * 
 * @depend bootstrap-typeahead-extend.js
 * 
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert */
ko.bindingHandlers.typeaheadlocation = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);
    	
    	$element.typeahead({
        	source: function(typeahead, query){
        		// clear timer and loading class
        		if ($element.data('timer')) {
					clearTimeout($element.data('timer'));
					// TODO: need to change the class name if doesn't use jquery ui
					$element.removeClass('ui-typeahead-loading');
				}
        		// check ! empty
        		if (query) {
        			// set timer
        			var timer = setTimeout(function(){
        				// TODO: need to change the class name if doesn't use jquery ui 
        				$element.addClass('ui-typeahead-loading');
        				
        				$.ajax({
        					url: "http://ws.geonames.org/searchJSON",
        					type: "POST",
        					data: {
        						featureClass: "P",
        						style: "full",
        						maxRows: 12,
        						name_startsWith: query
        					},
        					dataType: "jsonp",
        					async: false,
        					success: function(data){
        						var manufacturers = new Array;
        						$.map( data.geonames, function( item ) {
        							var group;
        							group = {
        									value: item.name + (item.adminName1 ? ", " + item.adminName1 : "") + ", " + item.countryName
        							};
        							manufacturers.push(group);
        						});
        						typeahead.process(manufacturers);
        					}
        				}).done(function(){
        					// TODO: need to change the class name if doesn't use jquery ui
        					$element.removeClass('ui-typeahead-loading');
        				});
        				
        			}, 500);
        			// cache timer
        			$element.data('timer', timer);
				}
            },
            property: 'value',
            items: 10,
            onselect: function (item) {
//            	console.log('onselect', item);
            }
		});
    }
};