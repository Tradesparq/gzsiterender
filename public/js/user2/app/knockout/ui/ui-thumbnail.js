/**
 * This is a ko ui user thumbnail.
 *
 * @depend
 *
 * @author KEVIN
 */

/*global document, window, $, ko*/
ko.bindingHandlers.thumbnail = {
    init: function (element, valueAccessor, allBindings, viewModel) {

		var $element = $(element);
    	var value = valueAccessor();
    	if(!value.userId) return false;
    	var userId = value.userId;
    	// var defaultThumbnail = pathUserUpload(userId) + "profile/thumbnail.jpg" ;
        // TODO: how to check file type thumbnail.[jpg,jpeg,png,gif], default width is what?
        var defaultThumbnail = urlStaticS3(userId, 'user', 'profile', 'thumbnail.jpg', 40);
    	var defaultThumbnailDom = "<img src='" + defaultThumbnail + "' />";
    	var width = value.width;

    	if(!value.height)
    	{
    		var height = width;
    	}
    	else
    	{
    		var height = value.height;
    	}

		$(defaultThumbnailDom).load(function(){
			$element.attr('src', urlThumbnail(userId, width, height));
    	});
    }
};