/**
 * This is a simple version typeahead contacts ui 
 * 
 * @depend bootstrap-typeahead-extend.js
 * 
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert */
ko.bindingHandlers.typeaheadcontacts = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);

    	var contactsUrl = 'api/connections/contacts';
    	var url = valueAccessor().onlyImport ? contactsUrl + '/only_import/' + valueAccessor().onlyImport : contactsUrl;
    	var contactsType = valueAccessor().contactsType ? valueAccessor().contactsType : '';

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
        				
        				// 排除已存在的好友ids/imports
        				var exclude = {
        					users: [],
        					imports: [],
        					circles: []
        				};
        				if (valueAccessor().existsUsers) {
        					ko.utils.arrayForEach(valueAccessor().existsUsers, function(user){
        						exclude.users.push(user.id);
        					});
        				}
        				if (valueAccessor().existsImports) {
        					ko.utils.arrayForEach(valueAccessor().existsImports, function(item){
        						exclude.imports.push(item.email);
        					});
        				}
        				
        				if (valueAccessor().existsCircles) {
        					ko.utils.arrayForEach(valueAccessor().existsCircles, function(item){
        						exclude.circles.push(item.circle);
        					});
        				}
        				
        				$.ajax({
        					url: url,
        					type: "POST",
        					data: {
        						exclude_users: exclude.users.join(),
        						exclude_imports: exclude.imports.join(),
        						exclude_circles: exclude.circles.join(),
        						keyword: query,
        						type: contactsType
        					},
        					dataType: "json",
        					async: false,
        					success: function(data){
        						if(data){
        							var manufacturers = new Array;
            						$.map( data, function( item ) {
            							var group;
            							if(item.id){
            								group = {
                								label: item.full_name,
                								full_name: item.full_name,
//        										picture: urlThumbnail(item.id, '15'),
        										id: item.id,
        										type: 'user'
                							};
        								}
        								if(item.email){
        									group = {
        										label: item.email,
    											email: item.email,
        										nick_name: item.nick_name ? item.nick_name : item.email,
        										type: 'import'
                							};
        								}
        								if(item.circle){
        									group = {
        										label: item.circle + ' (' + item.total + ')',
    											circle: item.circle,
    											total: item.total,
    											tag_id: item.tag_id ? item.tag_id : 0,
    											tag: item.tag ? item.tag : '',
        										type: 'circle'
                							};
        								}
            							manufacturers.push(group);
            						});
            						typeahead.process(manufacturers);
        						}
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
            property: 'label',
            items: 10,
            onselect: function (item) {
            	if (valueAccessor().onSelect) {
            		valueAccessor().onSelect(item);
            	}
            }
		});
    	
    	// TODO: rewrite render function to show user picture ?
    }
};