/**
 * This is a ko ui bookmarking.
 * 
 * @depend 
 * 
 * @author shaquille
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.bookmarking = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);
		
		valueAccessor().data.loadBookmarking = function() {
			
			if (appViewModel.routes().action == 'profiledetail' || appViewModel.routes().page == 'profile'){
				
				var product_category = new Array();
				
				$.each(valueAccessor().data.sell_category.result, function(index, item){
					product_category.push(item.name + " manufacturers");
				});
				
				var url = publicUserUrl(valueAccessor().data.id);
				
				var title = valueAccessor().data.full_name + ": " + valueAccessor().data.company_name + " - Tradesparq";
				
				var summary = valueAccessor().data.full_name + " -s " + valueAccessor().data.company_name + " - " + product_category.slice(0, 4);
				
			} else if (appViewModel.routes().action == 'productdetail' || appViewModel.routes().page == 'products') {
				
				if(valueAccessor().data.title){
					var productName = valueAccessor().data.title.replace(/ /g, "-");
				} else {
					var productName = '';
				}
				
				var url = publicProductUrl(productName, valueAccessor().data.id);
				
				var title = valueAccessor().data.title + ': China Suppliers - ' + valueAccessor().data.id;
				
				var summary = valueAccessor().data.title + "- Find detailed information about " + valueAccessor().data.category.name + " from " + valueAccessor().data.user.company_name + ". You may also find other " + valueAccessor().data.category.name + " suppliers and manufacturers on tradesparq.com" + "-" + valueAccessor().data.id;
			}
			
			if( typeof(stWidget) != "undefined" ) {
				stWidget.addEntry({
					"service": "facebook",
					"element": document.getElementById('facebook'),
					"url": url,
					"title": title,
					"type": "large",
					"text": "facebook" ,
					"image": BASEURL + "images/tradesparq-128x128.png",
					"summary": summary   
				});
				
				stWidget.addEntry({
					"service": "linkedin",
					"element": document.getElementById('linkedin'),
					"url": url,
					"title": title,
					"type": "large",
					"text": "linkedin" ,
					"image": BASEURL + "images/tradesparq-128x128.png",
					"summary": summary   
				});
				
				stWidget.addEntry({
					"service": "twitter",
					"element": document.getElementById('twitter'),
					"url": url,
					"title": title,
					"type": "large",
					"text": "twitter" ,
					"image": BASEURL + "images/tradesparq-128x128.png",
					"summary": summary   
				});

				stWidget.addEntry({
					"service": "email",
					"element": document.getElementById('email'),
					"url": url,
					"title": title,
					"type": "large",
					"text": "email" ,
					"image": BASEURL + "images/tradesparq-128x128.png",
					"summary": summary   
				});
			}
		}
    	
		// global variable to set sharethis to oauth mode
		// api example:http://support.sharethis.com/customer/portal/articles/475260-examples
		switchTo5x=true;
		if( typeof(stWidget) == "undefined" ) {
			
			$.getScript('http://w.sharethis.com/button/buttons.js', function(){
				stLight.options({publisher:'0ee4497e-e1ae-4091-a66f-b79f6db356f4'});			
				valueAccessor().data.loadBookmarking();
			});
		} else {		
			valueAccessor().data.loadBookmarking();
		}
    }
};
