/**
 * This is a ko ui tags.
 * 
 * @depend 
 * 
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.tags = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	
    	var $element = $(element);
    	
    	// api tags
    	valueAccessor().data.apiTags = 'api/tags/connection_tags';
    	
    	// editing
    	valueAccessor().data.editing = ko.observable(false);
    	// become colleagues?
    	valueAccessor().data.becomeColleagues = ko.observable(false);  
    	/**
    	 * edit button click
    	 */
    	valueAccessor().data.edit = function(data, event) {
    		// toggle status
    		valueAccessor().data.editing( ! valueAccessor().data.editing());
    		if (valueAccessor().data.editing()) {
    			// set popover placement, deprecated in #2641
    			// setPopoverPlacement($(event.currentTarget), $element.find('div.popover2'), 'auto');
    			
    			$element.find('div.popover2').attr('style', 'position: fixed; top: 50%; left: 50%; z-index: 1050; overflow: auto; margin: -200px 0 0 -200px;');
    			$element.find('div.popover2').modal({
    				backdrop: "static",
    				keyboard: false,
    				show: true
    			});
    			
    			// set focus
    			$element.find('input[name="tag"]').focus();
			}
		}
    	
    	// tags
    	valueAccessor().data.tags = ko.observableArray();
    	
    	// loading
    	valueAccessor().data.loadingTags = ko.observable(true);
    	
    	/**
    	 * load tags
    	 */
    	function loadTags() {
    		valueAccessor().data.loadingTags(true);
			$.getJSON(valueAccessor().data.apiTags, function(data){
				if (data) {
					$.each(data, function(index, tag){
						tag.checked = false;
						if (ko.utils.unwrapObservable(valueAccessor().data.currentTags).length > 0 && ko.utils.arrayFirst(ko.utils.unwrapObservable(valueAccessor().data.currentTags), function (item) {
							return ko.utils.unwrapObservable(item.tag) === tag.tag;
					    })) {
							tag.checked = true;
						}
						valueAccessor().data.tags.push(ko.mapping.fromJS(tag));
					});
				}
			}).done(function(){
				valueAccessor().data.loadingTags(false);
			});
		}
    	
    	// available tags
    	valueAccessor().data.availableTags = ko.computed(function(){
    		
    		if (valueAccessor().data.editing() && valueAccessor().data.tags().length <= 0) {
				// load tags
		    	loadTags();
			}
    		
    		return valueAccessor().data.tags();
    	});
    	
    	/**
    	 * set colleagues
    	 */
    	valueAccessor().data.setColleagues = function(data, event) {
    		if (valueAccessor().data.hasColleagues) {
				//alert a confirmation box if set Colleagues
				appViewModel.confirm('',"<?php echo lang('are_you_sure_you_want_to_invite_this_user_to_be_your_colleague?_once_they_accept_your_invitation_you_will_be_able_to_share_in_each_others_ratings._they_will_also_appear_as_a_colleague_on_your_company_page.')?>", function(){
					var tag = {
							id: 0,
							tag: 'coworker'
						};
					// set to current tags
					valueAccessor().data.currentTags.push(tag);
					// update tags
					$.ajax({
						url: valueAccessor().data.apiTags,
						type: 'post',
						data: {new_tags: [{tag: tag.tag, connection_id: valueAccessor().data.connectionId}]},
						success: function(data) {
							if (data) {
//									console.log(data);
							}
						}
					});
				});
			}
		}
    	
    	/**
    	 * has colleagues
    	 */
    	valueAccessor().data.hasColleagues = ko.computed(function(){
    		return ko.utils.arrayFirst(ko.utils.unwrapObservable(valueAccessor().data.currentTags), function(item) {
				return ko.utils.unwrapObservable(item.tag) === 'coworker';
			})
    	});
    	
    	/**
    	 * keydown
    	 */
		valueAccessor().data.keydown = function(data, event) {
			var $this = $(event.currentTarget);
			
			if (event.keyCode == 13) {
				var str = $this.val().trim();
				if (_addNewTag(str)) {
					$this.val('');
					return false;
				}
			}
			
			return true;
		}
		
		/**
		 * add new tag
		 */
		valueAccessor().data.add = function(data, event) {
			var $tag = $element.find('input[name="tag"]');
			var str = $tag.val().trim();
			if (_addNewTag(str)) {
				$tag.val('');
			}
		}
		
		/**
		 * add new tag
		 * 
		 * @param str
		 * @returns {Boolean}
		 */
		function _addNewTag(str) {
			if (str.length >= 1) {
				var existsTag = ko.utils.arrayFirst(valueAccessor().data.tags(), function (item) {
					return ko.utils.unwrapObservable(item.tag) === str;
			    });
				if (existsTag) {
					existsTag.checked(true);
				} else {
					valueAccessor().data.tags.unshift({id: ko.observable(0), tag: ko.observable(str), checked: ko.observable(true)});
				}
				return true;
			}
			return false;
		}
		
		// cancel
		valueAccessor().data.cancel = function(data, event) {
			valueAccessor().data.editing(false);
			
			$element.find('div.popover2').modal('hide');
			// if want to reload all tags, open the next line
			valueAccessor().data.tags.removeAll();
		}
		
		// submit
		valueAccessor().data.submit = function(data, event) {			
			$this = $(event.currentTarget);
			
			// 分出新增的 和 移出的
			var newTags = [],
				removeTags = [];
			
			$.each(ko.toJS(valueAccessor().data.tags()), function(index, tag){
				if(! valueAccessor().data.hasColleagues() && tag.tag == 'coworker' && tag.checked == true) {
					valueAccessor().data.becomeColleagues(true);
				}
			});
			
			if(valueAccessor().data.becomeColleagues()) {
				
				//alert a confirmation box if set Colleagues
				appViewModel.confirm('',"<?php echo lang('are_you_sure_you_want_to_invite_this_user_to_be_your_colleague?_once_they_accept_your_invitation_you_will_be_able_to_share_in_each_others_ratings._they_will_also_appear_as_a_colleague_on_your_company_page.')?>", function(){
					$.each(ko.toJS(valueAccessor().data.tags()), function(index, tag){
						if (tag.checked == true) {
							// 已经选中
							if ( ! ko.utils.arrayFirst(ko.utils.unwrapObservable(valueAccessor().data.currentTags), function(item) {
								return ko.utils.unwrapObservable(item.tag) === tag.tag;
							})) {
								// 且不在currentTags中
								if (DEBUG) console.log('new tag', tag.tag);
								newTags.push({tag: tag.tag, connection_id: valueAccessor().data.connectionId});
								
								valueAccessor().data.currentTags.push(tag);
							}
						} else {
							// 未选中
							if (ko.utils.arrayFirst(ko.utils.unwrapObservable(valueAccessor().data.currentTags), function(item) {
								return ko.utils.unwrapObservable(item.tag) === tag.tag;
							})) {
								// 且存在currentTags中
								if (DEBUG) console.log('remove tag', tag.tag);
								removeTags.push({connection_tag_id: tag.id, connection_id: valueAccessor().data.connectionId});
								
								valueAccessor().data.currentTags.remove(function(item){
									return ko.utils.unwrapObservable(item.tag) === tag.tag;
								});
							}
						}
					});
					
					// save
					if (newTags.length > 0 || removeTags.length > 0) {
						// cancel
						valueAccessor().data.cancel();
						
						$this.button('loading');
						$.ajax({
							url: valueAccessor().data.apiTags,
							type: 'post',
							data: {new_tags: newTags, remove_tags: removeTags},
							success: function(data) {
								if (data) {
									// cancel
//									valueAccessor().data.cancel();
								}
							}
						}).done(function(){
							$this.button('reset');
							valueAccessor().data.becomeColleagues(false);
						});
					}
				});
			} else {
				
				$.each(ko.toJS(valueAccessor().data.tags()), function(index, tag){
					if (tag.checked == true) {
						// 已经选中
						if ( ! ko.utils.arrayFirst(ko.utils.unwrapObservable(valueAccessor().data.currentTags), function(item) {
							return ko.utils.unwrapObservable(item.tag) === tag.tag;
						})) {
							// 且不在currentTags中
							if (DEBUG) console.log('new tag', tag.tag);
							newTags.push({tag: tag.tag, connection_id: valueAccessor().data.connectionId});
							
							valueAccessor().data.currentTags.push(tag);
						}
					} else {
						// 未选中
						if (ko.utils.arrayFirst(ko.utils.unwrapObservable(valueAccessor().data.currentTags), function(item) {
							return ko.utils.unwrapObservable(item.tag) === tag.tag;
						})) {
							// 且存在currentTags中
							if (DEBUG) console.log('remove tag', tag.tag);
							removeTags.push({connection_tag_id: tag.id, connection_id: valueAccessor().data.connectionId});
							
							valueAccessor().data.currentTags.remove(function(item){
								return ko.utils.unwrapObservable(item.tag) === tag.tag;
							});
						}
					}
				});
				
				// save
				if (newTags.length > 0 || removeTags.length > 0) {
					// cancel
					valueAccessor().data.cancel();
					
					$this.button('loading');
					$.ajax({
						url: valueAccessor().data.apiTags,
						type: 'post',
						data: {new_tags: newTags, remove_tags: removeTags},
						success: function(data) {
							if (data) {
								// cancel
//								valueAccessor().data.cancel();
							}
						}
					}).done(function(){
						$this.button('reset');
					});
				}
			}
		}
    }
};