/**
 * This is a ko ui hover box.
 * 
 * @depend 
 * 
 * @author KEVIN
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
var hoverFocusIn = false;
var showSetId = '';
ko.bindingHandlers.hoverBox = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);

    	var value = valueAccessor();
    	if(!value.id || !value.targetType || value.id == CURRENTUSER.id) return false;
    	
		// set position
		var $container = $element.parent();
		
		$(".f_hoverbox").mouseenter(function(){
			hoverFocusIn = true;
		}).mouseleave(function(){
			hoverFocusIn = false;
			hideHoverBox();
		});
		
    	// available sites
    	$element.mouseover(function(){
    		hoverFocusIn = true;
    		clearTimeout(showSetId);
    		showSetId = setTimeout(
    				function(){
    					hideHoverBox();
    					if(hoverFocusIn == true)
    					{
	    					getHoverData(value.id, value.targetType);
	    					
							// Track the element which produces the hoverbox.
							appViewModel.hoverData.element($element);
							
	    		    		if (value.targetType == 'user') {
	    		    			var $popover = $($.find('div#userHoverBox'));
	    		    		}
	    		    		else
	    		    		{
	    		    			var $popover = $($.find('div#productHoverBox'));
	    		    		}
	    		    		
	    		    		$popover.attr('style', 'top: '+$container.position().top+'px; left: '+$container.position().left+'px; display: block;');
    					}
    				}, 
    				1250
    		);
    	}).mouseout(function(){
    		hoverFocusIn = false;
    		setTimeout(
    				function(){
		    			if(hoverFocusIn == false)
		    			{
		    				hideHoverBox();
		    			}
	    			},
	    			1000);
    	});
    }
};

function hideHoverBox()
{
	$(".f_hoverbox").hide();
	appViewModel.hoverData.element('');
}

function getHoverData(id, type)
{
	if(type == 'user')
	{
		appViewModel.hoverData.user('');
		var url = 'api/user/hover';
		var hoverKey = 'api/user/key/';
	}
	else
	{
		appViewModel.hoverData.product('');
		var url = 'api/products/hover';
		var hoverKey = 'api/products/key/';
	}
	url += '/id/' + id;
	var key = appViewModel.getKey('hover_' + type, id);
	if (key) {
		url += '/key/' + key;
	}
	appViewModel.hoverData.loading(true);
	$.getJSON(url, function(data){
		if(data)
		{
			// When clicking some button in the hoverbox, track the element which produces the hoverbox.
			data.in_hoverbox = ko.observable(true);
			
			if(type == 'user')
			{
				data.has_invited = ko.observable(false);
				appViewModel.hoverData.user(data);
			}
			else
			{
				appViewModel.hoverData.product(data);
			}
		}
	}).done(function(){
		appViewModel.hoverData.loading(false);
		$.getJSON(hoverKey + 'id/' + id, function(data){
			if (data) {
				if (key < data) {
					appViewModel.setKey('hover_' + type, id, data);
					getHoverData(id, type);
				}
			}
		});
	});
}
