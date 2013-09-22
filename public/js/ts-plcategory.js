//plugin to show category tree
(function($) {
	var methods = {

		init : function(options) {
			var settings = {
				container : this,
				replaceContainer : null,
				dialogContainer : null,
				selectMore : false,
				type : 'single', // single, multiple
				selected : [],
				timer : null,
				keyword : '',
				emptyText : 'Select a category',
				selectMoreText : 'Select More',
				removeText : 'Remove',
				position : 'center',
				onChange : function() {
				}
			};

			if (options) {
				$.extend(settings, options);
			}

			_init(settings);
		}
	};

	$.fn.plcategory = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(
					arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		} else {
			$.error('Method ' + method + ' does not exist.');
		}
	};

	function _init(settings) {
		if (!settings.container) {
			return;
		}

		if (settings.type == 'single') {
			init_single(settings);
		} else if (settings.type == 'multiple') {
			init_multiple(settings);
		}
	}

	function init_single(settings) {
		var that = settings.container;
		name = that.attr('name');
		var value = that.attr('value');
		var categoryName = that.attr('category');
		if (!categoryName) {
			categoryName = settings.emptyText;
		}
		settings.replaceContainer = $('<div id="category_' + name + '"><div class="f_catg_container"></div></div>');
		var catgContainer = settings.replaceContainer.find('.f_catg_container');
		var input = $('<input name="' + name + '" type="hidden" class="'
				+ that.attr('class') + '" value="' + value + '">');
		var link = $('<a href="category" class="button" title="' + categoryName
				+ '">' + categoryName + '</a>');
		link.bind('click', function(e) {
			linkOnClick(e, settings);
		});
		catgContainer.append(input).append(link);
		that.replaceWith(settings.replaceContainer);
	}

	function init_multiple(settings) {
		var that = settings.container;
		name = that.attr('name');
		settings.replaceContainer = $('<div id="category_' + name + '"><div class="f_catg_container"></div></div>');
		var catgContainer = settings.replaceContainer.find('.f_catg_container');
		var categoryName = null;
		for ( var i = 0; i < that.length; i++) {
			var old = $(that[i]);
			if (old.val().length > 0)
				settings.selected.push(old.val());
			var categoryName = old.attr('category');
			if (!categoryName) {
				break;
			}
			var item = $('#jtmpl_plgn_category_item').tmpl( {
				name : name,
				val : old.val(),
				categoryName : categoryName,
				removeText : settings.removeText
			});
			item.find('a.f_remove').bind('click', function(e) {
				e.preventDefault();
				$(this).parent().remove();
				_update_selected(settings);
			});
			catgContainer.append(item);
		}
		var more = $('<a class="btn3" href="selectMore">' + (categoryName ? settings.selectMoreText
				: settings.emptyText) + '</a>');
		more.bind('click', function(e) {
			linkOnClick(e, settings);
		});
		settings.replaceContainer.append(more);
		that.replaceWith(settings.replaceContainer);
	}

	function _update_selected(settings) {
		settings.selected = [];
		var list = settings.replaceContainer.find('input');
		for ( var i = 0; i < list.length; i++) {
			var old = $(list[i]);
			if (old.val().length > 0)
				settings.selected.push(old.val());
		}
	}

	function linkOnClick(e, settings) {
		e.preventDefault();
		if (settings.dialogContainer) {
			// show dialog
			settings.dialogContainer.dialog('open');
			_showSelected(settings, settings.dialogContainer);
		} else {
			// init container
			// dialog-size:
			// dialog-url:user/products/add->select a category
			// dialog-done:
			var category_container = $('#jtmpl_dialog_plgn_category').tmpl(
					settings);
			// Method to cancel
			category_container.find('.f_cancel').bind('click', function(e) {
				e.preventDefault();
				category_container.dialog('close');
			});
			// Method to save selected category
			var saveBtn = category_container.find('.f_submit');
			
			saveBtn.bind('click',function(e) {
								e.preventDefault();
								if ($(this).hasClass('enabled')) {
									if (settings.type == 'single') {
										var input = settings.replaceContainer
												.find('input[type=hidden]');
										var link = settings.replaceContainer
												.find('a');
										var node = category_container
												.find('input[name="selected[]"]:checked');
										if (node) {
											input.val(node.val());
											link.text(node.attr('text'));
										}
									} else {
										var name = settings.replaceContainer
												.attr('id').substring(9);
										var catgContainer = settings.replaceContainer
												.find('.f_catg_container');
										var selectedContainer = category_container
												.find('#category-tree-selected');
										if (selectedContainer
												.find('.f_category_selected_item').length > 0) {
											catgContainer.empty();
											settings.selected = [];
											selectedContainer
													.find(
															'.f_category_selected_item')
													.each(
															function(i, e) {
																var categoryName = $(
																		e)
																		.find(
																				'span')
																		.text();
																var categoryId = $(
																		e)
																		.find(
																				'a[category_id]')
																		.attr(
																				'category_id');
																settings.selected
																		.push(categoryId);
																var item = $(
																		'#jtmpl_plgn_category_item')
																		.tmpl(
																				{
																					name : name,
																					val : categoryId,
																					categoryName : categoryName,
																					removeText : settings.removeText
																				});
																item
																		.find(
																				'a.f_remove')
																		.bind(
																				'click',
																				function(
																						e) {
																					e
																							.preventDefault();
																					$(
																							this)
																							.parent()
																							.remove();
																					_update_selected(settings);
																				});
																catgContainer
																		.append(item);
															});
										}
									}
									category_container.dialog('close');
									settings.onChange();
								}
							});
			// init search category function
			var searchInput = category_container.find('input.category-search');
			searchInput.bind('keydown', function(e) {
				if (e.keyCode == 13) {
					var val = $(this).val();
					e.preventDefault();
					if (settings.timer)
						clearTimeout(settings.timer);
					_showTreeview(settings, category_container, val);
				}
			}).bind('keyup', function(e) {
				// 解决IE6兼容trim()
					if (typeof String.prototype.trim !== 'function') {
						String.prototype.trim = function() {
							return this.replace(/^\s+|\s+$/g, '');
						};
					}
					if (e.keyCode != 13) {
						var val = $(this).val().trim();
						if (val && val == '') {
							// _showTreeview(settings, category_container);
				} else {
					if (val && val.length >= 3 && val != settings.keyword) {
						if (settings.timer)
							clearTimeout(settings.timer);
						settings.timer = setTimeout(function() {
							_showTreeview(settings, category_container, val);
						}, 1000);
					}
				}
			}
		}	);
			// Method to click search
			category_container.find('.f_search').bind('click', function(e) {
				e.preventDefault();
				var keyword = searchInput.val();
				if (settings.timer)
					clearTimeout(settings.timer);
				if (keyword) {
					_showTreeview(settings, category_container, keyword);
				} else {
					searchInput.focus();
					// showCaution('Enter keyword please.', null, 'pop');
				}
			});
			// Method to reset
			category_container.find('.f_reset').bind('click', function(e) {
				e.preventDefault();
				if (settings.timer)
					clearTimeout(settings.timer);
				if (settings.type == 'single') {
					_showTreeview(settings, category_container);
				} else {
					category_container.find('#category-tree').empty();
				}
				searchInput.val('').focus();
			});

			$.fx.speeds._default = 1000;
			// show dialog
			category_container.dialog( {
				dialogClass : 'dialog-no-title dialog-content',
				position : settings.position,
				modal : true,
				resizable : false,
				draggable : false,
				width : 800,
				height : 'auto',
				close : function() {
					settings.dialogContainer = category_container;
				}
			});

			// init category treeview
			if (settings.type == 'single') {
				_showTreeview(settings, category_container);
			} else {
				// _showTreeview(settings, category_container, 'default
				// keyword?');
				_showSelected(settings, category_container);
			}
		}
	}

	function _showTreeview(settings, category_container, keyword, selected) {
		var suffix = selected ? "-selected" : '';
		category_container
				.find("#category-tree" + suffix)
				.empty()
				.treeview(
						{
							url : "user/products/children_categories",
							// add some additional, dynamic data and request
							// with POST
							ajax : {
								data : {
									"category_ids" : function() {
										return !keyword && selected
												&& settings.selected.length > 0 ? settings.selected
												: '';
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
								if (settings.type == 'single') {
									if (!settings.selectMore) { // &&
																// category_container.find('input[name="selected[]"]:checked').length
																// > 1
										category_container
												.find(
														'input[name="selected[]"][value!=' + item
																.val() + ']:checked')
												.removeAttr('checked');
									}

									var saveBtn = category_container.find('.f_submit');
									if (category_container
											.find('input[name="selected[]"]:checked').length > 0) {
										saveBtn.removeClass('disabled')
												.addClass('enabled');
									} else {
										saveBtn.removeClass('enabled')
												.addClass('disabled');
									}
								} else {
									var selectedContainer = category_container
											.find('#category-tree-selected');
									var category = {};
									category.id = item.attr('category_id');
									category.text = item.attr('category_text');
									category.depth = item
											.attr('category_depth');
									if (selectedContainer
											.find('a[category_id="' + category.id + '"]').length == 0) {
										var categoryItem = $(
												'#jtmpl_plgn_category_selected_item')
												.tmpl(
														{
															category : category,
															removeText : settings.removeText
														});
										categoryItem
												.find('a.f_remove')
												.bind(
														'click',
														function(e) {
															e.preventDefault();
															$(this)
																	.parents(
																			'.f_category_selected_item')
																	.remove();
															_checkOk(category_container);
														});
										selectedContainer.append(categoryItem);
										_checkOk(category_container);
										// 如果出现滚动条，滚到最底部
										var offset = categoryItem.offset().top
												- selectedContainer.offset().top;
										if (offset > 0) {
											if (offset
													- selectedContainer
															.height() > 0) {
												selectedContainer.animate( {
													scrollTop : offset
												});
											}
										} else {
											selectedContainer.animate( {
												scrollTop : offset
											});
										}
									} else {
										// 已存在右边列表中，添加提示动画
										var currentItem = selectedContainer
												.find(
														'a[category_id="' + category.id + '"]')
												.parents(
														'.f_category_selected_item');
										if (!currentItem.hasClass('selected')) {
											// 如果在滚动条内不可见区域，滑动到该item出现的位置
											var offset = currentItem.offset().top
													- selectedContainer
															.offset().top;
											if (offset > 0) {
												if (offset
														- selectedContainer
																.height() > 0) {
													selectedContainer.animate( {
														scrollTop : offset
													});
												}
											} else {
												selectedContainer.animate( {
													scrollTop : offset
												});
											}

											currentItem.addClass('selected');
											if (currentItem.data('timer'))
												clearTimeout(currentItem
														.data('timer'));
											currentItem
													.data(
															'timer',
															setTimeout(
																	function() {
																		currentItem
																				.removeClass('selected');
																	}, 500));
										}
									}
								}
							},
							onReturnNull : function() {
								category_container
										.find('#category-tree')
										.empty()
										.append(
												'<li class="last">No categories like "' + settings.keyword + '".</li>');
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
								var moreBtn = $('<li class="open expandable lastExpandable"><a href="javascript:void(0);" class="btn4 f_catg_more"><?php echo lang("more_results")?><a/></li>');
								moreBtn.children('a').bind(
										'click',
										function(e) {
											e.preventDefault();
											$(this).parent().remove();
											container.children('li.none')
													.removeClass('none');
										});
								container.append(moreBtn);
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

	function _showSelected(settings, container) {
		var selectedContainer = container.find('#category-tree-selected');
		selectedContainer.empty();
		settings.replaceContainer.find('.f_category_item').each(function(i, e) {
			var category = {};
			category.id = $(e).find('input:hidden').val();
			category.text = $(e).find('span').text();
			var categoryItem = $('#jtmpl_plgn_category_selected_item').tmpl( {
				category : category,
				removeText : settings.removeText
			});
			categoryItem.find('a.f_remove').bind('click', function(e) {
				e.preventDefault();
				$(this).parents('.f_category_selected_item').remove();
				_checkOk(container);
			});
			selectedContainer.append(categoryItem);
		});
		_checkOk(container);
	}

	function _checkOk(container) {
		var saveBtn = container.find('.f_submit');
		if (container.find('.f_category_selected_item').length > 0) {
			saveBtn.removeClass('disabled').addClass('enabled');
		} else {
			saveBtn.removeClass('enabled').addClass('disabled');
		}
	}

	var doNothing = function() {
	};
})(jQuery);