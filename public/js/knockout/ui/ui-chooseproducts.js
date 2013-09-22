/**
 * This is a ko ui chooseproducts.
 * 
 * @depend 
 * 
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.chooseproducts = {
    init: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);
    	// products
    	valueAccessor().data.products = ko.observable();
    	// chosen products
    	valueAccessor().data.chosenProducts = ko.observableArray();
    	// remove products
    	valueAccessor().data.removeProducts = ko.observableArray();
    	// loadingProducts
    	valueAccessor().data.loadingProducts = ko.observable(true);
    	// keyword
    	valueAccessor().data.keyword = ko.observable('');
    	
    	/**
    	 * change to prevpage
    	 */
    	valueAccessor().data.prevPage = function() {
    		var pageNum = valueAccessor().data.products().page_num;
			var pageCount = valueAccessor().data.products().page_count;
			if (pageNum > 1 && pageNum <= pageCount) {
				_loadProducts(pageNum - 1, valueAccessor().data.keyword());
			}
		}
		
    	/**
    	 * change to nextpage
    	 */
		valueAccessor().data.nextPage = function() {
			var pageNum = valueAccessor().data.products().page_num;
			var pageCount = valueAccessor().data.products().page_count;
			if (pageNum >= 1 && pageNum < pageCount) {
				_loadProducts(pageNum + 1, valueAccessor().data.keyword());
			}
		}
		
		/**
		 * keydown
		 */
		valueAccessor().data.keydown = function(data, event) {
			var $this = $(event.currentTarget);
			if (event.keyCode == 13) {
				var keyword = $this.val().trim();
				if (keyword) {
					_loadProducts(1, keyword);
					return false; // stop form submit
				}
			}
			return true;
		};
		
		/**
		 * choose
		 */
		valueAccessor().data.choose = function(data, event) {
			var $this = $(event.currentTarget);
			if ($this.attr('checked')) {
				if (valueAccessor().data.chosenProducts().length <= 4) {
					if (ko.utils.arrayIndexOf(valueAccessor().data.chosenProducts(), data) == -1) {
						valueAccessor().data.chosenProducts.push(data);
					}
				} else {
					appViewModel.alert('block', '', '<?php echo lang("more_than_5_products!")?>', 3000);
					return false;
				}
			} else {
				if (ko.utils.arrayFirst(valueAccessor().data.chosenProducts(), function(product){
					return product.id == data.id;
				})) {
					valueAccessor().data.chosenProducts.remove(function(item){
						return item.id == data.id;
					});
				}
			}
			// check ok
			if (valueAccessor().data.chosenProducts().length > 0) {
				$element.find('a.f_submit').button('reset');
			} else {
				$element.find('a.f_submit').button('loading');
			}
			return true;
		};
		
		/**
		 * submit
		 */
		valueAccessor().data.submit = function(data, event) {
			var $this = $(event.currentTarget);
			if (valueAccessor().data.chosenProducts().length > 0 && valueAccessor().data.onSubmit) {
				// get removed products
				if (valueAccessor().data.currentProducts().length > 0) {
					$.each(valueAccessor().data.currentProducts(), function(index, item){
						if ( ! ko.utils.arrayFirst(valueAccessor().data.chosenProducts(), function(product){
							return product.id == item.id;
						})) {
							valueAccessor().data.removeProducts.push(item);
						}
					});
				}
				// onSubmit callback
				valueAccessor().data.onSubmit(valueAccessor().data.chosenProducts(), valueAccessor().data.removeProducts());
			}
		}
    	
    	/**
    	 * load products
    	 */
    	function _loadProducts(pageNum, keyword) {
    		var url = 'api/products/products/my/true/';
			var pageNum = pageNum || 1;
			url += 'page_num/' + pageNum;
			var keyword = keyword || '';
			if (keyword) url += '/keyword/' + keyword;
			
			valueAccessor().data.loadingProducts(true);
			valueAccessor().data.products(null);
    		$.getJSON(url, null, function(data) {
    			if (data) {
    				// 判断是否已经在选中的产品中，并标记选中状态
    				if (data.num_rows > 0) {
    					var hasChosenProducts = valueAccessor().data.chosenProducts().length > 0 ? true : false; 
    					$.each(data.result, function(index, item){
    						if (hasChosenProducts && ko.utils.arrayFirst(valueAccessor().data.chosenProducts(), function(product){
    							return product.id == item.id;
    						})) {
    							item.checked = ko.observable(true);
							} else {
								item.checked = ko.observable(false);
							}
    					});
					}
    				valueAccessor().data.products(data);
				}
    		}).done(function(){
    			valueAccessor().data.loadingProducts(false);
    		});
    	}
    	
    	// push current products into chosen products
    	if (valueAccessor().data.currentProducts().length > 0) {
			$.each(valueAccessor().data.currentProducts(), function(index, item){
				valueAccessor().data.chosenProducts.push(item);
			});
		}
    	// load products
//    	if ($.isEmptyObject(valueAccessor().data.products())) {
    		_loadProducts();
//		}
    	// check ok
    	if (valueAccessor().data.chosenProducts().length == 0) {
    		$element.find('a.f_submit').button('loading');
		}
    }
};