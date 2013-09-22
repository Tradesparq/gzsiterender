/**
 * This is a ko ui contacts.
 * 
 * @depend 
 * 
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.contacts = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);
    	
    	if ( typeof valueAccessor().data.loadConnections != 'undefined') {
    		valueAccessor().data.isLoadConnections = ko.observable(valueAccessor().data.loadConnections);  
    	} else {
    		valueAccessor().data.isLoadConnections = ko.observable(true);
    	}
    	
    	if (typeof valueAccessor().data.loadImports != 'undefined') {
    		valueAccessor().data.isLoadImports = ko.observable(valueAccessor().data.loadImports);  
    	} else {
    		valueAccessor().data.isLoadImports = ko.observable(true);
    	}
    	
    	if (typeof valueAccessor().data.selectType != 'undefined') {
    		valueAccessor().data.type = ko.observable(valueAccessor().data.selectType);  
    	} else {
    		valueAccessor().data.type = ko.observable('plural'); // 复选
    	}
    	
    	// my connections
    	valueAccessor().data.myConnections = ko.observableArray();
    	// current chosen connections count
    	valueAccessor().data.currentChosenConnectionsCount = ko.computed(function(){
    		var count = 0;
    		ko.utils.arrayForEach(valueAccessor().data.myConnections(), function(item){
				if (item.chosen()) count ++;
			});
    		return count;
    	});
    	// loading my connections
    	valueAccessor().data.loadingMyConnections = ko.observable(false);
    	// chosen connections
    	valueAccessor().data.chosenConnections = ko.observableArray();
    	
    	/**
    	 * check in chosen conncections
    	 */
    	valueAccessor().data.inChosenConnections = function(data) {
			if (ko.utils.arrayFirst(valueAccessor().data.chosenConnections(), function(item){
				return item.id == data.id;
			})) {
				return true;
			}
			return false;
		};
    	
		// all imports
		valueAccessor().data.allImports = ko.observableArray();
    	// my imports
    	valueAccessor().data.myImports = ko.observableArray();
    	// current chosen imports count
    	valueAccessor().data.currentChosenImportsCount = ko.computed(function(){
    		var count = 0;
    		ko.utils.arrayForEach(valueAccessor().data.myImports(), function(item){
				if (item.chosen()) count ++;
			});
    		return count;
    	});
    	// loading my imports
    	valueAccessor().data.loadingMyImports = ko.observable(false);
    	// chosen imports
    	valueAccessor().data.chosenImports = ko.observableArray();
    	
    	/**
    	 * check in chosen imports
    	 */
    	valueAccessor().data.inChosenImports = function(data) {
			if (ko.utils.arrayFirst(valueAccessor().data.chosenImports(), function(item){
				return item.email == data.email;
			})) {
				return true;
			}
			return false;
		};
    	
    	/**
    	 * load my connections
    	 */
    	function _loadMyConnections(){
    		// TODO: cache data in appViewModel now, need to change the cache store to right way
    		if (appViewModel.myConnections) {
    			valueAccessor().data.myConnections(appViewModel.myConnections);
    			// rest chosen status
    			ko.utils.arrayForEach(valueAccessor().data.myConnections(), function(item){
					item.chosen(valueAccessor().data.inChosenConnections(item));
				});
			} else {
				valueAccessor().data.loadingMyConnections(true);
				$.getJSON('user/dashboard/j_friends' + '?' + Math.random(), null, function(data){
					if(data && data.length > 0){
						ko.utils.arrayForEach(data, function(item){
							item.chosen = ko.observable(valueAccessor().data.inChosenConnections(item));
							valueAccessor().data.myConnections.push(item);
						});
						appViewModel.myConnections = valueAccessor().data.myConnections();
					}
				}).done(function(){
					valueAccessor().data.loadingMyConnections(false);
				});
			}
    	}
    	
    	/**
    	 * load my connections
    	 */
    	function _loadMyImports(){
    		// TODO: cache data in appViewModel now, need to change the cache store to right way
    		if (appViewModel.myImports) {
    			valueAccessor().data.myImports(appViewModel.myImports);
    			valueAccessor().data.allImports(appViewModel.allImports);
				
    			// rest chosen status
    			ko.utils.arrayForEach(valueAccessor().data.myImports(), function(item){
					item.chosen(valueAccessor().data.inChosenImports(item));
				});
			} else {
				valueAccessor().data.loadingMyImports(true);
				$.getJSON('user/import/j_import/true' + '?' + Math.random(), null, function(data){
					if(data && data.num_rows > 0){
						// Display 500 imports only once the plug-in initialize.
						valueAccessor().data.allImports(data.result);
						
						$.each(data.result, function(index, item){
							if (index < 500) {
								// TODO: unset from server
								delete item.click_time;
								delete item.creation_time;
								delete item.import_email;
								delete item.invitation_time;
								delete item.full_name;
								delete item.register_id;
								delete item.register_time;
								delete item.registered;
								delete item.user_id;
								
								item.chosen = ko.observable(valueAccessor().data.inChosenImports(item));
								valueAccessor().data.myImports.push(item);
							}
						});
						appViewModel.myImports = valueAccessor().data.myImports();
						appViewModel.allImports = valueAccessor().data.allImports();
					}
				}).done(function(){
					valueAccessor().data.loadingMyImports(false);
				});
			}
    	}
    	
    	// load more imports when the user scrolls to up to 80% of the scrollbar
		valueAccessor().data.checkImportsScrollTop = function(data, event) {
			var scrollTop = $('div#scrollImports').scrollTop();
			var scrollHeight = $('div#scrollImports')[0].scrollHeight;
			if ( scrollTop / scrollHeight > 0.8 && ! valueAccessor().data.loadingMyImports()) {
				// display more imports when the user's imports are not presented entirely.
				if (valueAccessor().data.allImports().length != valueAccessor().data.myImports().length) {
					valueAccessor().data.loadMoreImports();
				}
			}
		};
    	
    	/**
    	 * load more imports
    	 */
    	valueAccessor().data.loadMoreImports = function(){
				valueAccessor().data.loadingMyImports(true);
				
				function addImports(){
					// Display another 200 imports
					var displayedImportsCount = valueAccessor().data.myImports().length;
					$.each(valueAccessor().data.allImports(), function(index, item){
						if (index >= displayedImportsCount &&　index < displayedImportsCount + 20) {
							// TODO: unset from server
							delete item.click_time;
							delete item.creation_time;
							delete item.import_email;
							delete item.invitation_time;
							delete item.full_name;
							delete item.register_id;
							delete item.register_time;
							delete item.registered;
							delete item.user_id;
							
							item.chosen = ko.observable(valueAccessor().data.inChosenImports(item));
							valueAccessor().data.myImports.push(item);
						}
					});
					
					// Listen scroll operation to display more imports when the user's imports are not presented entirely.
//					$('div#scrollImports').bind('scroll', valueAccessor().data.checkImportsScrollTop);
					valueAccessor().data.loadingMyImports(false);
				}
				
				// Make loading effect visible
				setTimeout(addImports, 100);
    	}
    	
    	/**
    	 * check ok
    	 */
    	function _checkOk() {
    		if (valueAccessor().data.currentChosenConnectionsCount() == 0 && valueAccessor().data.currentChosenImportsCount() == 0) {
    			$element.find('.f_submit').button('loading');
			} else {
				$element.find('.f_submit').button('reset');
    		}
    	}
    	
    	// reg events
    	// click connection
    	valueAccessor().data.clickConnection = function(data, event) {
    		// clear other chosen items when single type
			if ( ! data.chosen() && valueAccessor().data.type() != 'plural') {
				ko.utils.arrayForEach(valueAccessor().data.myConnections(), function(item){
					item.chosen(false);
				});
			}
    		data.chosen( ! data.chosen());
			_checkOk();
		};
		
    	// click import
    	valueAccessor().data.clickImport = function(data, event) {
    		data.chosen( ! data.chosen());
			_checkOk();
		};
		
		// cancel
		valueAccessor().data.cancel = function() {
			valueAccessor().data.onCancel();
		};
		// submit
		valueAccessor().data.submit = function(data, event) {
			var $this = $(event.currentTarget);
			if ( ! $this.hasClass('disabled')) {
				valueAccessor().data.chosenConnections.removeAll();
				// 拿到当前已经选中的好友
				ko.utils.arrayForEach(valueAccessor().data.myConnections(), function(item){
					if (item.chosen()) {
						item.chosen(false);
						valueAccessor().data.chosenConnections.push(item);
					};
				});
				valueAccessor().data.chosenImports.removeAll();
				ko.utils.arrayForEach(valueAccessor().data.myImports(), function(item){
					if (item.chosen()) {
						item.chosen(false);
						valueAccessor().data.chosenImports.push(item);
					}
				});
				
				valueAccessor().data.onSubmit(valueAccessor().data.chosenConnections(), valueAccessor().data.chosenImports());
			}
		};
		// all TODO: 速度慢，优化后从30+秒，缩减到5秒左右
		valueAccessor().data.all = function(data, event) {
//			var b = new Date().getTime();
//			console.log('b', b);
//			$element.find('li:not(.active)').click();
			ko.utils.arrayForEach(valueAccessor().data.myConnections(), function(item){
				item.chosen(true);
			});
			ko.utils.arrayForEach(valueAccessor().data.myImports(), function(item){
				item.chosen(true);
			});
//			var a = new Date().getTime();
//			console.log('a', a, a - b);
			_checkOk();
		};
		// none TODO: 速度慢，优化后从30+秒，缩减到5秒左右
		valueAccessor().data.none = function(data, event) {
//			var b = new Date().getTime();
//			console.log('bb', b);
//			$element.find('li.active').click();
			ko.utils.arrayForEach(valueAccessor().data.myConnections(), function(item){
				item.chosen(false);
			});
			ko.utils.arrayForEach(valueAccessor().data.myImports(), function(item){
				item.chosen(false);
			});
//			var a = new Date().getTime();
//			console.log('aa', a, a - b);
			_checkOk();
		};
		// keyup TODO: 速度慢
		valueAccessor().data.keyup = function(data, event) {
			var $this = $(event.currentTarget);
			
			if (event.keyCode != 13) {
				if ($this.data('timer')) clearTimeout($this.data('timer'));
				$this.data('timer', setTimeout(function() {
					var keyword = $this.val().trim();
					if (keyword == '') {
						$element.find('li').show();
					} else {
						$element.find('li').each(function(index, item){
							var $item = $(item);
							if($item.children('a').text().search(new RegExp(keyword, 'i')) == -1){
								$item.hide();
							}else{
								$item.show();
							}
						});
					}
				}, 300));
			}
			
			return true;
		};
		
		// search keyword
		valueAccessor().data.searchKeyword = ko.observable();
		
		valueAccessor().data.clearContactSearch = function(){
			valueAccessor().data.searchKeyword('');
		};

		// TODO: replace jquery with ko?
		ko.computed(function() {
			var keyword = valueAccessor().data.searchKeyword();
			if ( ! keyword) {
				$element.find('li').show();
			} else {
				$element.find('li').each(function(index, item){
					var $item = $(item);
					if($item.children('a').text().search(new RegExp(keyword, 'i')) == -1){
						$item.hide();
					}else{
						$item.show();
					}
				});
			}
	    }, this);
		
		// init
		// put defaultConnections into chosenConnectins
		if (valueAccessor().data.defaultConnections) {
			ko.utils.arrayForEach(valueAccessor().data.defaultConnections, function(item){
				if (item.chosen) item.chosen(true);
				valueAccessor().data.chosenConnections.push(item);
			});
		}
		
		// put defaultImports into chosenImports
		if (valueAccessor().data.defaultImports) {
			// TODO: 是否这里要过滤出用户手动输入的email addresses，然后在submit时拼接回chosenImports？
			ko.utils.arrayForEach(valueAccessor().data.defaultImports, function(item){
				if (item.chosen) item.chosen(true);
				valueAccessor().data.chosenImports.push(item);
			});
		}
		
		// load my connections
		if(valueAccessor().data.isLoadConnections())
		{
			_loadMyConnections();
		}
    	
    	// load my imports
    	if(valueAccessor().data.isLoadImports())
    	{
    		_loadMyImports();
    	}
    	
		// disabled submit button
		$element.find('.f_submit').button('loading');
    }
};