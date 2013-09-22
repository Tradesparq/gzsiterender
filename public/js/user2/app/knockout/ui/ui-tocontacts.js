/**
 * This is a ko ui tocontacts.
 * 
 * @depend 
 * 
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.tocontacts = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	
    	var $element = $(element);
    	
    	// change toUsers to ko.observableArray
    	if (valueAccessor().data.toUsers && typeof valueAccessor().data.toUsers != 'function') {
    		valueAccessor().data.toUsers = ko.observableArray(valueAccessor().data.toUsers);
		}
    	// change toEmails to ko.observableArray
    	if (valueAccessor().data.toEmails && typeof valueAccessor().data.toEmails != 'function') {
    		valueAccessor().data.toEmails = ko.observableArray(valueAccessor().data.toEmails);
		}
    	// change toCircles to ko.observableArray
    	if (valueAccessor().data.toCircles && typeof valueAccessor().data.toCircles != 'function') {
    		valueAccessor().data.toCircles = ko.observableArray(valueAccessor().data.toCircles);
		}
    	
    	if (typeof valueAccessor().data.disableEmail != 'undefined') {
    		valueAccessor().data.isDisableEmail = ko.observable(valueAccessor().data.disableEmail);  
    	}
    	else
    	{
    		valueAccessor().data.isDisableEmail = ko.observable(false); // 复选
    	}
    	
    	if (typeof valueAccessor().data.selectType != 'undefined') {
    		valueAccessor().data.type = ko.observable(valueAccessor().data.selectType);  
    	}
    	else
    	{
    		valueAccessor().data.type = ko.observable('plural'); // 复选
    	}
    	
    	valueAccessor().data.disable = function()
    	{
    		if(valueAccessor().data.type() == 'single')
    		{
    			if(valueAccessor().data.toUsers().length > 0) return true;
    		}
    	};
    	
    	// reg events
    	// focus
    	$element.bind('click', function(e){
    		e.preventDefault();
    		$element.find('input').focus();
    	});
    	// keydown
		valueAccessor().data.keydown = function(data, event) {
			var $this = $(event.currentTarget);
			
			if (event.keyCode) {
				var str = $this.val();
				var len = str.length;
				if (len >= 1) {
					// TODO size not work
					$this.attr('size', len + 2);
					// ";" -> 59/186; "," -> 188; " " -> 32; "Tab" -> 9;
					if (event.keyCode == 59 || event.keyCode == 186 || event.keyCode == 188 || event.keyCode == 32 || event.keyCode == 9 || event.keyCode == 13) {
						// check email add a email
						if (validEmail(str)) {
							if(!valueAccessor().data.isDisableEmail())
							{
								var email = {
									email: str,
									nick_name: ''
								};
								valueAccessor().data.toEmails.push(email);
								
								$this.attr('size', 1).val('');
								return false;
							}
						}
					}
				} else if (len == 0) {
					$this.attr('size', 1);
					if(event.keyCode == 8){
						if (valueAccessor().data.toCircles().length > 0) {
							var circle = valueAccessor().data.toCircles.pop();
							
							// call in ui-rate
							if(valueAccessor().data.afterRemoveCircle) {
								valueAccessor().data.afterRemoveCircle(circle);
								
								//return false so that it will not return to the previous page.
								return false;
							}
							
						} else if (valueAccessor().data.toEmails().length > 0) {
							valueAccessor().data.toEmails.pop();
						} else if (valueAccessor().data.toUsers().length > 0) {
							valueAccessor().data.toUsers.pop();
						}
					}
				}
			}
			
			// make the viewmodel skip the enter keydown event
			if(event.keyCode == 13){
				return false;
			}

			return true;
		}
		// blur
		valueAccessor().data.blur = function(data, event) {
			var $this = $(event.currentTarget);
			
			var str = $this.val();
			var len = str.length;
			// check email add a email
			if (len >= 1 && validEmail(str)) {
				if ( ! valueAccessor().data.isDisableEmail()) {
					var email = {
						email: str,
						nick_name: ''
					};
					valueAccessor().data.toEmails.push(email);
					
					$this.attr('size', 1).val('');
					return false;
				}
			}
			
			return true;
		}
		
		// remove email
		valueAccessor().data.removeEmail = function(data, event) {
			valueAccessor().data.toEmails.remove(data);
		}
		
		// remove user
		valueAccessor().data.removeUser = function(data, event) {
			valueAccessor().data.toUsers.remove(data);
		}
		
		// remove circle
		valueAccessor().data.removeCircle = function(data, event) {
			valueAccessor().data.toCircles.remove(function(item) {
				return item.circle == data.circle
			});
			
			// call in ui-rate
			if(valueAccessor().data.afterRemoveCircle) {
				valueAccessor().data.afterRemoveCircle(data, event);
			}
		}
		
		// on select contact from ui-typeaheadcontacts
		if( ! valueAccessor().data.onSelect){
			valueAccessor().data.onSelect = function(contact) {
				if (contact.type == 'user') {
					valueAccessor().data.toUsers.push(contact);
				}
				if (contact.type == 'import') {
					valueAccessor().data.toEmails.push(contact);
				}
				$element.find('input').attr('size', 1).val('');
			}
		}

    }
};