/**
 * This is a ko ui category.
 * 
 * @depend 
 * 		js/jquery.jcrop/css/jquery.Jcrop.min.css
 * 		js/jquery.jcrop/js/jquery.Jcrop.min.js
 * 
 * valueAccessor().data.type: single / multiple 
 * 
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.category = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	
    	var $element = $(element);
    	
    	/**
    	 * Method to show treeview
    	 * 
    	 * @param settings
    	 * @param category_container
    	 * @param keyword
    	 * @param selected
    	 */
    	function _showTreeview(settings, category_container, keyword, selected) {
    		var suffix = selected ? "-selected" : '';
    		category_container.find("#category-tree" + suffix).empty().treeview({
    			url : "user/products/children_categories", // TODO: change the interface to rest version ?
    			// add some additional, dynamic data and request
    			// with POST
    			ajax : {
    				data : {
    					"category_ids" : function() {
    						return !keyword && selected && settings.selected.length > 0 ? settings.selected : '';
    					},
    					"keyword" : function() {
    						settings.keyword = keyword;
    						return keyword ? keyword : '';
    					}
    				},
    				type : "post"
    			},
    			unique : settings.type == 'single' ? true : false,
    			persist : "location",
    			type : settings.type,
    			// On check box click function
    			onCheckBoxClick : function(e, item) {
    				_onCheckBoxClick(e, item, settings, category_container);
    			},
    			onReturnNull : function() {
    				category_container.find('#category-tree').empty().append('<li class="last">No categories like "' + settings.keyword + '".</li>');
    				// TODO: do add a user category here ?
    			},
    			onAfterSearch : function(container) {
    				if (keyword && keyword != '') {
    					// Hide more than 5 result
    					if (container.children('li').length > 5) {
    						container.children('li').each(function(i, e) {
    							if (i >= 5) {
    								$(e).addClass('none');
    							}
    						});
    						var moreBtn = $('<li class="open expandable lastExpandable"><a href="javascript:void(0);" class="btn btn-small f_catg_more">More Results<a/></li>');
    						moreBtn.children('a').bind('click',function(e) {
    							e.preventDefault();
    							$(this).parent().remove();
    							container.children('li.none').removeClass('none');
    						});
    						container.append(moreBtn);
    					}
    					if(settings.type == 'single')
    					{
    						if(category_container.find('#f_no_match').length <= 0)
    						{
    							var html = "<div><input type='checkbox' id='f_no_match' value='-1' text='"+'<?=lang("no_matching_category")?>'+"' name='selected[]' />"+'No matching category'+"</div>";
    							$(html).insertAfter(category_container.find(".f_reset"));
    							$("#f_no_match").live('click', function(e){
    								_onCheckBoxClick(e, $(this), settings, category_container);
    							});
    						}
    					}
    				}
    			}
    		// animated : "medium", // "fast"
    		// collapsed: true
    		// persist: "cookie",
    		// toggle: function() {
    		// window.console && console.log("%o was toggled",
    		// this);
    		// }
    		}).fadeIn();
    	}
    	
    	/**
    	 * on checkbox click
    	 * 
    	 * @param e
    	 * @param item
    	 * @param settings
    	 * @param category_container
    	 */
    	function _onCheckBoxClick(e, item, settings, category_container){
    		if (settings.type == 'single') {
				category_container.find("input[name='selected[]'][value!=" + item.val() + ']:checked').removeAttr('checked');

    			var saveBtn = category_container.find('.f_submit');
    			if (category_container.find("input[name='selected[]']:checked").length > 0) {
    				saveBtn.button('reset');
    			} else {
    				saveBtn.button('loading');
    			}
    		} else {
    			var category = {
    				id: item.attr('category_id'),
    				name: item.attr('category_text'),
    				depth: item.attr('category_depth')
    			};
    			
    			if (ko.utils.arrayFirst(valueAccessor().data.categories(), function(item){
    				return item.id() == category.id;
    			})) {
    				appViewModel.alert('error', '', '<?php echo lang("already_added!")?>', 2000);
				} else {
					valueAccessor().data.categories.push(ko.mapping.fromJS(category));
					_checkOk($element);
				}
    		}
    	}
    	
    	/**
    	 * check ok
    	 * 
    	 * @param container
    	 */
    	function _checkOk(container) {
    		var saveBtn = container.find('.f_submit');
    		if (container.find('.f_category_selected_item').length > 0) {
    			saveBtn.button('reset');
			} else {
				saveBtn.button('loading');
    		}
    	}
    	
    	// reg events
		// cancel
		valueAccessor().data.cancel = function() {
			valueAccessor().data.onCancel();
		}
		// submit
		valueAccessor().data.submit = function(data, event) {
			var $this = $(event.currentTarget);
			if ( ! $this.hasClass('disabled')) {
				if (valueAccessor().data.type == 'single') {
					var node = $element.find("input[name='selected[]']:checked");
					if (node) {
						var category = {
							id: node.val(),
							name: node.attr('text')
						};
						valueAccessor().data.onSubmit(category);
					}
				} else if (valueAccessor().data.type == 'multiple') {
					valueAccessor().data.onSubmit(valueAccessor().data.categories());
				}
			}
		}
		// keydown
		valueAccessor().data.keydown = function(data, event) {
			var $this = $(event.currentTarget);
			if (event.keyCode == 13) {
				var val = $this.val();
				event.preventDefault();
				if ($this.data('timer')) clearTimeout($this.data('timer'));
				_showTreeview(valueAccessor().data, $element, val);
			}
			return true;
		}
		// keyup
		valueAccessor().data.keyup = function(data, event) {
			var $this = $(event.currentTarget);
			if (event.keyCode != 13) {
				var val = $this.val().trim();
				if (val && val.length >= 3 && val != valueAccessor().data.keyword) {
					if ($this.data('timer')) clearTimeout($this.data('timer'));
					$this.data('timer', setTimeout(function() {
						_showTreeview(valueAccessor().data, $element, val);
					}, 1000));
				}
			}
			return true;
		}
		// search
		valueAccessor().data.search = function(data, event) {
			var $this = $(event.currentTarget);
			var $input = $element.find('input[name="keyword"]');
			var keyword = $input.val();
			if (keyword) {
				if ($input.data('timer')) clearTimeout($input.data('timer'));
				_showTreeview(valueAccessor().data, $element, keyword);
			} else {
				$input.focus();
			}
		}
		// reset
		valueAccessor().data.reset = function(data, event) {
			var $this = $(event.currentTarget);
			var $input = $element.find('input[name="keyword"]');
			if ($input.data('timer')) clearTimeout($input.data('timer'));
			if (valueAccessor().data.type == 'single') {
				_showTreeview(valueAccessor().data, $element);
			} else {
				$element.find('#category-tree').empty();
			}
			$input.val('').focus();
		}
		// remove
		valueAccessor().data.remove = function(data, event) {
			valueAccessor().data.categories.remove(data);
			_checkOk($element);
		}
		
		// init categories
		if (valueAccessor().data.type == 'multiple' && ! valueAccessor().data.categories) {
			valueAccessor().data.categories = ko.observableArray();
		}

		// init
		// show treeview
    	_showTreeview(valueAccessor().data, $element);
		// disabled submit button
		$element.find('.f_submit').button('loading');
    }
};