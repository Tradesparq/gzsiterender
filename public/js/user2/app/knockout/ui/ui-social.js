/**
 * This is a ko ui social.
 * 
 * @depend 
 * 
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.social = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);
    	
    	valueAccessor().data.type = 'single'; // multiple
    	
    	// available sites
    	valueAccessor().data.sites = ko.observableArray();
    	
    	/**
    	 * reset sites
    	 */
    	valueAccessor().data.resetSites = function() {
    		valueAccessor().data.sites([
           		{type: 'facebook', value: '', title: 'Facebook', text: ''},
           		{type: 'twitter', value: '', title: 'Twitter', text: ''},
				{type: 'linkedin', value: '', title: 'LinkedIn', text: ''},
           		{type: 'google', value: '', title: 'Google+', text: ''},
				{type: 'yahoo', value: '', title: 'Yahoo!', text: ''},
           		{type: 'myspace', value: '', title: 'Myspace', text: ''},
           		{type: 'feed', value: '', title: 'RSS Feed', text: ''},
           		{type: 'lastfm', value: '', title: 'Last.fm', text: ''},
           		{type: 'vimeo', value: '', title: 'Vimeo', text: ''},
           		{type: 'youtube', value: '', title: 'YouTube', text: ''},
           		{type: 'tumblr', value: '', title: 'Tumblr', text: ''},
           		{type: 'wordpress', value: '', title: 'Wordpress', text: ''},
           		{type: 'blogger', value: '', title: 'Blogger', text: ''},
           		{type: 'digg', value: '', title: 'Digg', text: ''},
             	{type: 'stumbleupon', value: '', title: 'Stumbleupon', text: ''},
             	{type: 'pinterest', value: '', title: 'Pinterest', text: ''},
             	{type: 'flickr', value: '', title: 'Flickr', text: '<span class="cyan"></span><span class="magenta"></span>'}
//         		{type: 'dribbble', value: '', title: 'Dribbble', text: ''},
//         		{type: 'forrst', value: '', title: 'Forrst', text: ''},
//        		{type: 'gowalla', value: '', title: 'Gowalla', text: ''},             	
//             	{type: 'deviantart', value: '', title: 'DeviantArt', text: ''},
//             	{type: 'behance', value: '', title: 'Behance', text: ''},
//             	{type: 'sharethis', value: '', title: 'ShareThis', text: ''},
//             	{type: 'skype', value: '', title: 'Skype', text: ''},
//             	{type: 'www', value: '', title: 'Website', text: 'www'}
         	]);
		}
    	
    	// available sites
    	valueAccessor().data.availableSites = ko.computed(function(){
    		if (valueAccessor().data.type == 'single' && valueAccessor().data.currentSites().length > 0) {
				valueAccessor().data.resetSites();
				$.each(valueAccessor().data.currentSites(), function(index, site){
					valueAccessor().data.sites.remove(function(item){ return item.type == ko.utils.unwrapObservable(site.type); });
				});
			}
    		return valueAccessor().data.sites();
    	});
    	
    	/**
    	 * add
    	 */
    	valueAccessor().data.add = function(site, event) {
    		valueAccessor().data.currentSites.push(ko.mapping.fromJS(site));
    	}
    	
    	// current sites
    	valueAccessor().data.currentSites = valueAccessor().data.currentSites || ko.observableArray();
    	// reset sites
    	valueAccessor().data.resetSites();
    }
};