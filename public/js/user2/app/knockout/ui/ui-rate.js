/**
 * This is a ko ui rate.
 * 
 * @depend 
 * 
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.rate = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);

    	/**
    	 * cancel
    	 */
    	valueAccessor().data.cancel = function() {
			valueAccessor().data.rating(false);
		}
    	
    	// If true,that would mean editing a existing rating rather than assiging a new rating.
    	if (typeof valueAccessor().data.editing != 'undefined') {
    		valueAccessor().data.editing = ko.observable(valueAccessor().data.editing);  
    	}
    	else
    	{
    		valueAccessor().data.editing = ko.observable(false);
    	}
    	    	
    	// api review
    	valueAccessor().data.apiReview = 'api/user/review/';    	
    	// api circles
    	valueAccessor().data.apiCircles = 'api/tags/circles';
    	// circles
    	valueAccessor().data.circles = ko.observableArray();
    	// current circles for editing
    	valueAccessor().data.currentCircles = ko.observableArray();
    	// count connections
    	valueAccessor().data.countConnections = ko.observable(CURRENTUSER.count_connections);
    	// count coworkers
    	valueAccessor().data.countCoworkers = ko.observable(0);
    	// colleague tag id
    	valueAccessor().data.colleagueTagId = ko.observable(0);
        // Post Privacy Setting selectedOption
    	valueAccessor().data.privacy = ko.observable('');
        // rating privilege, include "connections","coworkers","only me","recipient"
        valueAccessor().data.privilege = ko.observable('');
    	// Recipient
    	valueAccessor().data.recipient = ko.observable();
    	// require Recipient
    	valueAccessor().data.requireRecipient = ko.observable(false);

    	/**
    	 * reset Recipient
    	 */
    	valueAccessor().data.resetRecipient = function() {
    		return {
    			toUsers: ko.observableArray(),
    			toEmails: ko.observableArray(),
    			toCircles: ko.observableArray()
    		};
    	}
    	
    	valueAccessor().data.recipient(valueAccessor().data.resetRecipient());
    	
    	valueAccessor().data.loadCircles = function() {
    		$.getJSON(valueAccessor().data.apiCircles, function(data){
    			if (data) {
    				$.each(data, function(index, circle){
    					if(circle.circle == 'coworker'){
    						valueAccessor().data.countCoworkers(circle.total);
    						valueAccessor().data.colleagueTagId(circle.tag_id);
    					}
    					valueAccessor().data.currentCircles.push(circle);
    				});
    				valueAccessor().data.circles(data);
    				
    		    	if (valueAccessor().data.editing()) {
    		    		// Populate the form field with existing rating
    		    		valueAccessor().data.populateForm(); 
    		    	}
    			}
    		});
    	}
    	
    	valueAccessor().data.populateForm = function() {
			if(ko.utils.unwrapObservable(valueAccessor().data.currentRating)){
				var rating = ko.utils.unwrapObservable(valueAccessor().data.currentRating).rating;
				var review = ko.utils.unwrapObservable(valueAccessor().data.currentRating).review;
				var shared_connections = ko.utils.unwrapObservable(valueAccessor().data.currentRating).shared_connections;
				var shared_privilege = ko.utils.unwrapObservable(valueAccessor().data.currentRating).shared_privilege;
				var shared_tags = ko.utils.unwrapObservable(valueAccessor().data.currentRating).shared_tags;
				
				$element.find('input#' + rating).attr('checked', 'checked');
				$element.find('textarea#review').text(review);
				
				switch(shared_privilege)
				{
					case 'connections':
						valueAccessor().data.privilege('connections');
						valueAccessor().data.privacy('<?php echo lang("all_my_connections")?>' + ' (' + valueAccessor().data.countConnections() + ')');
					  break;
					case 'myself':
						valueAccessor().data.privilege('myself');
						valueAccessor().data.privacy('<?php echo lang("only_me")?>');
					  break;
					default:
						// reset valueAccessor().data.recipient().toCircles()
						$.each(valueAccessor().data.currentCircles(), function(index, circle){
							if (ko.utils.arrayFirst(shared_tags, function (item) {
								return item === circle.circle ;
						    })) {
								valueAccessor().data.addCircle(circle, null);
							}
						});
						
						// reset valueAccessor().data.recipient().toUsers()
						if (shared_connections){		    				
							$.each(shared_connections, function(index, item){
								// The piece of code below has relationship with ui-typeaheadcontacts.js
								var group;
								if(item.id){
									group = {
											label: item.full_name,
											full_name: item.full_name,
											id: item.id,
											type: 'user'
									};
								}
								valueAccessor().data.recipient().toUsers.push(group);
							});
						}
						break;
				}
				
				if(shared_privilege == 'connections' || shared_privilege == 'myself'){
					valueAccessor().data.inputingRecipient(! valueAccessor().data.inputingRecipient());
					
					//If inputingRecipient is false, it refers that user has selected a circle to share this rating.
					if( ! valueAccessor().data.inputingRecipient()) {
						valueAccessor().data.requireRecipient(false);
					}
				}
			}
		}
    	
    	// share rating with those in the input box
    	valueAccessor().data.inputingRecipient = ko.observable(true);
    	// switch privacy from "all my connections", "only my coworkers " and "only me"
    	valueAccessor().data.switchPrivacy = function(data, event) {
    		valueAccessor().data.privilege($(event.currentTarget)[0].name);
    		switch(valueAccessor().data.privilege())
    		{
	    		case 'connections':
	    			valueAccessor().data.privacy('<?php echo lang("all_my_connections")?>' + ' (' + valueAccessor().data.countConnections() + ')');
	    		  break;
	    		case 'coworker':
	    			valueAccessor().data.privacy('<?php echo lang("only_my_coworkers")?>' + ' (' + valueAccessor().data.countCoworkers() + ')');
	    		  break;
	    		case 'myself':
	    			valueAccessor().data.privacy('<?php echo lang("only_me")?>');
	    		  break;
	    		case 'none':
	    			valueAccessor().data.privilege('');
	    			valueAccessor().data.privacy('');
	    			break;
	    		default:
	    			valueAccessor().data.privilege('connections');
	    			valueAccessor().data.privacy('<?php echo lang("all_my_connections")?>' + ' (' + valueAccessor().data.countConnections() + ')');
    		}
    		
    		valueAccessor().data.inputingRecipient(! valueAccessor().data.inputingRecipient());
    		
    		//If inputingRecipient is false, it refers that user has selected a circle to share this rating.
    		if( ! valueAccessor().data.inputingRecipient()) {
        		valueAccessor().data.requireRecipient(false);
    		}
        	
    		if(DEBUG) console.log('Current post rating privacy: ' + valueAccessor().data.privacy());
    	}
    	
    	valueAccessor().data.addCircle = function(data, event) {      	
        	valueAccessor().data.recipient().toCircles.push(data);
        	
			valueAccessor().data.circles.remove(function(item) {
				return item.circle == data.circle
			});
			
    		//It will not prompt the user to type recipient.
    		valueAccessor().data.requireRecipient(false);
        }
    	
    	/**
    	 * submit
    	 */
    	valueAccessor().data.submit = function(data, event) {
    		var $this = $(event.currentTarget).parents('div').eq(2);
    		var $form = $this.find('form');
    		if ($form) {
    			// NOTICE: validate method not work well at here!
    			if ($form.valid()) {
    				// reset before every submit operation
    				valueAccessor().data.requireRecipient(false);
    				
    				var putData = $form.serializeArray(); // return object array use serializeArray();
    				
    				var reviewLength = $("textarea[name='review']").val().length;
    				if(reviewLength > 1000)
    				{
    					appViewModel.alert('error', '', '<?php echo lang("1000_characters_max")?>', 4000);
    					return false;
    				}
    				
    				var usersLength = valueAccessor().data.recipient().toUsers().length;
    				var circlesLength = valueAccessor().data.recipient().toCircles().length;
    				
    				if(DEBUG) console.log('Current post rating privacy: ' + valueAccessor().data.privacy());
    				
    				//check if you have chosen who to share this rating and return false if not.
    				if( ! valueAccessor().data.privacy() && usersLength == 0 && circlesLength == 0) {
    					valueAccessor().data.requireRecipient(true);
    					return false;
    				} 
    				
    				//tags have been selected but without connections
    				var emptyTags = [];
    				
    				if( ! valueAccessor().data.privacy() ) {
    					var postData = ko.toJS(valueAccessor().data.recipient());
    					
    					// push toUsers to selected_ids
    					if (postData.toUsers.length > 0) {
    						$.each(postData.toUsers, function(index, user){
    							var selected_ids = {
    									name: 'selected_ids[' + index + ']',
    									value: user.id
    							};
    							putData.push(selected_ids);
    						});
    					}
    					
    					if (postData.toCircles.length > 0) {
    						$.each(postData.toCircles, function(index, circle){
    	    					// if this circle refers to a tag, push the circle to tag_ids
    							var tag_ids = {
    									name: 'tag_ids[' + index + ']',
    									value: circle.tag_id ? circle.tag_id : circle.tag
    							};
    							putData.push(tag_ids);
    							
    							if(ko.utils.unwrapObservable(circle.total) == 0){
    								emptyTags.push(circle.circle);
    							}
    						});
    					}
    					// if you share the rating with the recipient in the input box, set the privilege to 'recipient'
    					valueAccessor().data.privilege('recipient');
    					
    				} else if (valueAccessor().data.privilege() == 'coworker') {
    					// if "Only my coworkers" is choosen
						var tag_ids = {
								name: 'tag_ids[0]',
								value: valueAccessor().data.colleagueTagId() ? valueAccessor().data.colleagueTagId() : 'coworker'
						};
						putData.push(tag_ids);

						if(valueAccessor().data.countCoworkers() == 0){
							emptyTags.push('coworker');
						}
    				}
    				
    				var privilege = {
    						name: 'privilege',
    						value: valueAccessor().data.privilege()
    				}
    				putData.push(privilege);
    				
    				if(valueAccessor().data.editing()) {
    					var id = {
    							name: 'id',
    							value: ko.utils.unwrapObservable(valueAccessor().data.currentRating).id
    					}
    					var editing = {
    							name: 'editing',
    							value: valueAccessor().data.editing()
    					}
    					putData.push(id);
    					putData.push(editing);
    				}
    				
    				if( emptyTags.length > 0 ) {
    					appViewModel.confirm('', '<?php echo lang("no_connections_have_been_tagged_as")?>' + ' ' + emptyTags + '<?php echo lang(".")?>' + '<?php echo lang("are_you_sure_to_share_this_rating?")?>', function(){
    						valueAccessor().data.submitRating(data, event, putData);
    					});
    				} else {
    					valueAccessor().data.submitRating(data, event, putData);
    				}
    			}
    		}
    	}
    	
		valueAccessor().data.submitRating = function(data, event, putData) {
			var $this = $(event.currentTarget).parents('div').eq(2);
			
			var $saveBtn = $this.find('.f_submit');
			$saveBtn.button('loading');
			$.ajax({
				url: valueAccessor().data.apiReview,
				type: 'put',
				data: putData,
				success: function(ratings){
					if (ratings && !ratings.error) {
						if (valueAccessor().data.editing()) {
							appViewModel.alert('success', '', "<?php echo lang('you_have_successfully_saved_changes_to_this_rating.')?>", 20000);
						} else {							
							appViewModel.alert('success', '', "<?=str_format(lang('your_rating_has_been_created_successfully._view_all_your_ratings'), '<a href=\"#profile/ratings\">', '</a>')?>", 20000);
						}
						valueAccessor().data.rating(false);
			
						// Update the key of ratings after assigning a rating for a suplier.
						appViewModel.setKey('ratings', CURRENTUSER.id, Math.round(new Date().getTime() / 1000));
						
						// update ratings
						if(valueAccessor().data.afterSubmit) {
							valueAccessor().data.afterSubmit(data, event, ratings);
						}
					}
				}
			}).done(function(){
				$saveBtn.button('reset');
			}); 		
		}
    	
    	// choosing contacts
    	valueAccessor().data.choosingContacts = ko.observable(false);
    	
    	/**
    	 * choose contacts 
    	 */
    	valueAccessor().data.chooseContacts = function() {
    		valueAccessor().data.choosingContacts( ! valueAccessor().data.choosingContacts());
    	}
    	
    	/**
    	 * on submit contacts
    	 */
    	valueAccessor().data.onSubmitContacts = function(toUsers) {
    		valueAccessor().data.choosingContacts(false);
    		valueAccessor().data.recipient().toUsers(toUsers);
    	}
    	
    	valueAccessor().data.onSelect = function(contact) {
			var toUsers = new Array(contact);
			if (contact.type == 'user') {
				valueAccessor().data.recipient().toUsers.push(contact);
			}
			if (contact.type == 'import') {
				valueAccessor().data.recipient().toEmails.push(contact);
			}
			if (contact.type == 'circle') {
				valueAccessor().data.recipient().toCircles.push(contact);
				
				valueAccessor().data.circles.remove(function(item) {
					return item.circle == contact.circle
				});
			}
			
    		//IE need to refocus on the input when the onSelect function in ui-tocontaqcts.js adopt the definition in this plugin.
    		$('.input-hidden').attr('size', 1).val('').focus();
    		
    		//It will not prompt the user to type recipient.
    		valueAccessor().data.requireRecipient(false);
    	}
    	
    	valueAccessor().data.afterRemoveCircle = function(contact, event){
    		valueAccessor().data.circles.push(contact);
    	}
    	
    	if(valueAccessor().data.loadCircles){
    		valueAccessor().data.loadCircles();
    	}
    }
};
