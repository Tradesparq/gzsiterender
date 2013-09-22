$(function(){
//	$('input[name=product\\[category\\]]').categorySelect();
});

(function($) {
	
	var settings = {
		type: 'single', // single, multiple
		accept: ['leaf', 3, 4], // leaf: lowest level category, [1/2/3]: level 1/2/3 , [-1/-2/-3]: 1/2/3 level from leaf level, This can be an array, eg: ['leaf', -1, -2] => lowest 3 levels
		emptyText: 'Select a category',
		selectMoreText: 'Select More',
		rootName: '',
		removeText: 'Remove',
		onChange: function(){},
		position: 'center'
	};
	
	var st = null;
	var selectedST = null;
	var searchST = null;
	var selected = [];
	var selectedTree = [];
	var div = null;
	var name = null;
	var timer = null;

	$.fn.categorySelect = function(options) {
		
		if(options){
			$.extend(settings, options);
		}
		
		if(settings.type == 'single'){
			return this.each(function(){init_single($(this), settings);});
		}else if(settings.type == 'multiple'){
			return init_multiple(this, settings);
		}

		
		
		function init_multiple(that, settings){
			name = that.attr('name');
			selected = [];
			div = $('<div id="category_' + name + '">');
			var categoryName = null;
			for(var i = 0; i < that.length; i++){
				var old = $(that[i]);
				if(old.val().length > 0) selected.push(old.val());
				var categoryName = old.attr('category');
				if(!categoryName){
					break;
				}
				var input = $('<input name="' + name + '" type="hidden" value="' + old.val() + '">');
				var link = $('<div class="cl"><span>' + categoryName + '</span></div>');
				link.append(input);
				div.append(link);
				if(old.val().length > 0){
					var remove = $('&nbsp;<a href="remove" class="fl_r">' + settings.removeText + '<a>');
					remove.click(function(e){
						e.preventDefault();
						$(this).parent().remove();
						_update_selected();
					});
					link.append(remove);
				}
			}
			var more = $('<a class="btn3" href="selectMore">' +( categoryName ? settings.selectMoreText : settings.emptyText )+ '</a>');
			more.click(linkOnClick);
			div.append(more);
			that.replaceWith(div);
		}
		
		function _update_selected(){
			selected = [];
			var list = div.find('input');
			for(var i = 0; i < list.length; i++){
				var old = $(list[i]);
				if(old.val().length > 0) selected.push(old.val());
			}
		}
		
		function init_single(that, settings){
			name = that.attr('name');
			var value = that.attr('value');
			var categoryName = that.attr('category');
			if(!categoryName){
				categoryName = settings.emptyText;
			}
			div = $('<div id="category_' + name + '">');
			var input = $('<input name="' + name + '" type="hidden" class="'+ that.attr('class') +'" value="' + value + '">');
			var link = $('<a href="category" class="button" title="' + categoryName + '">' + categoryName + '</a>');
			link.click(linkOnClick);
			
			div.append(input).append(link);
			that.replaceWith(div);
		}
		
		function linkOnClick(e){
			e.preventDefault();
			var category = $('#jtmpl_catg_select').tmpl();
			category.find(".category-select").empty(); // remove any previous left overs
			
			// Create the dialog
			category.dialog( {
				dialogClass : 'dialog-no-title',
				position : settings.position,
				width : 850,
				height : 600,
				resizable : false,
				modal: true,
				close: function(){
					if(st) st.clearNodesInPath();
					category.remove();
					var inputs = $('input[name="' + name + '"]');
					selected = []; 
					for(var i = 0; i < inputs.length; i++){
						var value = $(inputs.get(i)).val();
						if(value) selected.push(value);
					}
					st = null;
					selectedST = null;
					searchST = null;
				}
			});
			// Preprocess the tree
			if(selected.length == 0 || settings.type=='single'){
				$.get('user/products/children_categories/0',null,function(data){
					var data = _processData(data);
					data.splice(0,0,{id : "0",name : settings.rootName});
					showTree(data, settings);
				});
				if(settings.type=='multiple') category.find('a.f_selected').show();
			}else{
				$.post('user/products/j_categories_tree', {category_ids : selected}, function(data){
					var data = _processData(data);
					data.splice(0,0,{id : "0",name : settings.rootName});
					if(settings.type='multiple'){
//						console.log(data);
						showTree(data, settings);
						$('#category-select').hide();
						$('#category-selected').show();
						prepareSelectedTree();
					}
					if(settings.type=='multiple'){
						category.find('a.f_all').show();
					}else {
						st.addNodeInPath(selected[0]);
						st.refresh();
					}
				});
			}
			// Configure the inputs, buttons and a search box
			if(selected.length > 0) category.find('a.f_ok').removeClass('disabled').addClass('enabled');
			category.find('a.f_ok').click(function(e){
				e.preventDefault();
				if($(this).hasClass('enabled')){
					if(settings.type=='single'){
						var input = div.find('input[type=hidden]');
						var link = div.find('a');
						node = st.graph.getNode(selected[0]);
						input.val(node.id);
						link.text(node.name);
					}else {
						var name = div.attr('id').substring(9);
						div.find('div').remove();
						div.find('input').remove();
						for(var i = 0; i < selected.length; i++){
							node = st.graph.getNode(selected[i]);
							var categoryName = node.name;
							var input = $('<input name="' + name + '" type="hidden" value="' + node.id + '">');
							var link = $('<div class="cl"><span>' + categoryName + '</span>&nbsp;<a href="remove" class="fl_r">' + settings.removeText + '<a></div>');
							link.append(input);
							link.find('a[href=remove]').click(function(e){
								e.preventDefault();
								$(this).parent().remove();
								_update_selected();
							});
							var selectMore = div.find('a[href=selectMore]');
							link.insertBefore(selectMore);
						}
					}
					category.dialog('close');
					settings.onChange();
				}
			});
			category.find('input.category-search').bind('keydown', function(e){
				if(e.keyCode == 13){
					var val = $(this).val();
					e.preventDefault();
					categorySearch(val);
				}
			}).bind('keyup', function(e){
				var val = $(this).val();
				if(val && val.trim() == ''){
					$('#category-search').hide();
					$('#category-all').show();
				}else {
					if(val && val.trim().length >= 3) {
						if(timer) clearTimeout(timer);
						timer = setTimeout(function(){categorySearch(val);}, 1000);
					}
				}
			});
			
			function categorySearch(val){
				$.get('user/products/j_category_search/' + val, function(data){
					data = _processData(data);
					data.splice(0,0,{id : "0",name : settings.rootName});
					$('#category-selected').hide();
					$('#category-select').show();
					$('#category-all').hide();
					$('#category-search').show();
					if(settings.type=='multiple') category.find('a.f_selected').show();
					category.find('a.f_all').hide();
					if(searchST == null){
						st.clearNodesInPath();
						st.addSubtree(data, 'replot');
						createSearchTree(data, settings);
					}else {
						st.clearNodesInPath();
						st.addSubtree(data, 'replot');
						prefixSearchData(data);
						searchST.clearNodesInPath();
						searchST.loadJSON(data);
					}
					searchST.refresh();
				});
			}
			
			category.find('a.f_cancel').click(function(e){
				e.preventDefault();
				category.dialog('close');
			});
			
			if(settings.type=='multiple'){
				category.find('a.f_selected').click(function(e){
					e.preventDefault();
					category.find('a.f_all').show();
					$(this).hide();
					$('#category-select').fadeOut('fast', function(){
						$('#category-selected').fadeIn('fast', function(){
							st.clearNodesInPath();
							if(selectedST == null){
								prepareSelectedTree();
							}else{
								updateSelectedTree();
							}
						});
					});
				});
				category.find('a.f_all').click(function(e){
					e.preventDefault();
					category.find('a.f_selected').show();
					$(this).hide();
					$('#category-selected').fadeOut('fast', function(){
						$('#category-select').fadeIn('fast', function(){
							// The following loop is to fix a bug in space tree, apparently the nodesInPath is shared amongst all instances of the trees
							st.clearNodesInPath();
							if(st == null) showTree();
						});
					});
				});					
			}
		}
		
		function showTree(data, settings) {
			st = new $jit.ST( {
				injectInto : 'category-all',
				duration : 200,
				transition : $jit.Trans.Quint.easeInOut,
				levelDistance : 50,
				levelsToShow: 5,

				Navigation : { enable : true, panning: true},

				Node : {
					height : 20,
					width : 120,
					type : 'rectangle',
					color : '#aaa',
					overridable : true
				},

				Edge : {
					type : 'bezier',
					overridable : true
				},

				onBeforeCompute : function(node) {},

				onAfterCompute : function() {},

				onCreateLabel : function(label, node) {
					createSelectLabel(label, node, settings);
				},

				onBeforePlotNode : function(node) {
					if(settings.type == 'single' && _selectable(settings, node) && node.selected){
						node.data.$color = "#3a3";
					}else if(_selectable(settings, node)){
						node.data.$color = "#9f9";
					}else if(node.selected){
						node.data.$color = "#ff7";
					}else {
						node.data.$color = "#aaa";
					}
				},

				onBeforePlotLine : function(adj) {
					if (adj.nodeFrom.selected && adj.nodeTo.selected) {
						adj.data.$color = "#336";
						adj.data.$lineWidth = 3;
					} else {
						delete adj.data.$color;
						delete adj.data.$lineWidth;
					}
				}
				
			});

			st.loadJSON(data);
			st.compute();
			st.onClick(st.root, {Move:{enable: true}});

		}
		
		function createSearchTree(data, settings) {
			searchST = new $jit.ST( {
				injectInto : 'category-search',
				duration : 200,
				transition : $jit.Trans.Quint.easeInOut,
				levelDistance : 50,
				levelsToShow: 5,
				Navigation : { enable : true, panning: true},
				Node : {height : 20, width : 120, type : 'rectangle', color : '#aaa', overridable : true},
				Edge : {type : 'bezier',overridable : true},

				onCreateLabel : function(label, node) {
					createSelectLabel(label, node, settings);
				},

				onBeforePlotNode : function(node) {
					if(settings.type == 'single' && _selectable(settings, node) && node.selected){
						node.data.$color = "#3a3";
					}else if(_selectable(settings, node)){
						node.data.$color = "#9f9";
					}else if(node.selected){
						node.data.$color = "#ff7";
					}else {
						node.data.$color = "#aaa";
					}
				},

				onBeforePlotLine : function(adj) {
					if (adj.nodeFrom.selected && adj.nodeTo.selected) {
						adj.data.$color = "#336";
						adj.data.$lineWidth = 3;
					} else {
						delete adj.data.$color;
						delete adj.data.$lineWidth;
					}
				}
				
			});
			prefixSearchData(data);
			searchST.loadJSON(data);
			searchST.compute();
			searchST.onClick(searchST.root, {Move:{enable: true}});

		}
		
		function prefixSearchData(data){
			for(var i = 0; i < data.length; i++){
				data[i].id = 'search_' + data[i].id;
				if(data[i].adjacencies){
					for(var j = 0; j < data[i].adjacencies.length; j++){
						data[i].adjacencies[j] = 'search_' + data[i].adjacencies[j]; 
					}
				}
			}
		}
		
		function createSelectLabel(label, node, settings){
			label.id = node.id;
			$(label).append(_prepareLabel(node, settings));
			label.onclick = function() {
				
				var isSearch = typeof(node.id)  == "string" && node.id.indexOf('search_') == 0;
				var tree = isSearch ? searchST : st; 
				var dx = tree.canvas.translateOffsetX - (node._depth > 1 ? 170 * (node._depth - 1) : 0);
				var dy = tree.canvas.translateOffsetY;

				if(_selectable(settings, node) && settings.type=='single'){
					selectNode(settings, node.id);
				}
				
				if(isSearch) dx -= 170;
				if(node.data.leaf){
					tree.onClick(node.id, {
						Move: {
							offsetX: dx,
							offsetY: dy
						}
					});
				}else {
					if(isSearch){
						tree.onClick(node.id, { 
							Move: {								// 1
								offsetX: dx,
								offsetY: dy
							}
						});
					}else {
						$.get('user/products/children_categories/' + node.id ,null,function(data){
							var data = _processData(data);
							
							// This code work like this:
							// 1. invoke st.onClick with a Move of (dx, dy) so it would animate and move to desired location
							// 2. On completion, translate the cavas back to as if user never moved before
							// 3. invoke add subtree with replot, so the tree would be reploted to the exact same location
							tree.onClick(node.id, { 
								Move: {								// 1
									offsetX: dx,
									offsetY: dy
								},
								onComplete: function(){
									tree.canvas.translate(-dx,-dy);   // 2
									tree.addSubtree(data, 'replot');	// 3
								}
							});
						});						
					}
				}
			};
		}
		
		function deSelectNode(settings, id){
			if(id.indexOf('search_') == 0) id = id.substring(7);
			var index = selected.indexOf(id);
			if(index >= 0) selected.splice(index, 1);
			if(selectedST && selectedST.graph) selectedST.graph.empty();
			$('#check_' + id).attr('checked', false);
			_updateOkayButton();
		}
		
		function selectNode(settings, id){
			if(settings.type == 'single') selected = [];
			if(id.indexOf('search_') == 0) id = id.substring(7);
			if(selected.indexOf(id) < 0) selected.push(id);
			$('#check_' + id).attr('checked', true);
			_updateOkayButton();
		}
		
		function _updateOkayButton(){
			var okayBtn = $('.f_category_dialog').find('a.f_ok');
			if(selected.length > 0){
				okayBtn.removeClass('disabled').addClass('enabled');							
			}else {
				okayBtn.removeClass('enabled').addClass('disabled');
			}
		}
		
		function prepareSelectedTreeJSON(){
			selectedTree=[];
			selectedST.clearNodesInPath();
			if(selected.length > 0){
				for(var t = 0; t < selected.length; t++){
					var node = st.graph.getNode(selected[t]);
					// Prepare the node with no children as a seed
					var q = [{
						id: "selected_" + node.id,
						name: node.name,
						data: $.extend({selected:true}, node.data),
						adjacencies: [],
						node: node
					}];
					
					// BFS type of processing
					while(q.length > 0){
						var n = q.shift();
						var exists = false;
						
						// Check if the node is existed in the selectedTree
						for(var i = 0; i < selectedTree.length; i++){
							var existed = selectedTree[i]; 
							if(existed.id == n.id){
								// Merge the children 
								exists = true;
								$.merge(existed.adjacencies, n.adjacencies);
								break;
							}
						}
						var parents = n.node.getParents();
						if(!exists){
							for(var i = 0; i < parents.length; i++){
								var p = parents[i];
								var item = {
										id: "selected_" + p.id,
										name: p.name,
										data: p.data,
										adjacencies: [n.id],
										node: p
								};
								q.push(item);
							}
							selectedTree.push(n);
						}
					}
				}
			}else {
				selectedTree=[{id : "selected_0",name : settings.rootName}];
			}
		}
		
		function prepareSelectedTree() {
			selectedST = new $jit.ST( {
				injectInto : 'category-selected',
				duration : 0,
				transition : $jit.Trans.Quint.easeInOut,
				levelDistance : 50,
				levelsToShow: 5,

				Navigation : { enable : true, panning: true},

				Node : {
					height : 20,
					width : 120,
					type : 'rectangle',
					color : '#aaa',
					overridable : true
				},

				Edge : {
					type : 'bezier',
					overridable : true
				},

				onBeforeCompute : function(node) {},

				onAfterCompute : function() {},

				onCreateLabel : function(label, node) {
					label.id = node.id;
					$(label).append(_prepareLabel(node, settings));
					label.onclick = function() {
					};
				},

				onBeforePlotNode : function(node) {
					if(node.data.selected){
						node.data.$color = "#3a3";
					}else {
						node.data.$color = "#ff7";
					}
				},

				onBeforePlotLine : function(adj) {
					if (adj.nodeFrom.selected && adj.nodeTo.selected) {
						adj.data.$color = "#336";
						adj.data.$lineWidth = 3;
					} else {
						delete adj.data.$color;
						delete adj.data.$lineWidth;
					}
				}
				
			});
			updateSelectedTree();
			selectedST.compute();
			selectedST.onClick(selectedST.root, {Move:{enable: true}});
		}
		
		function updateSelectedTree(){
			prepareSelectedTreeJSON(); // Make the selectedTree structure from selected[]
			selectedST.loadJSON(selectedTree);
			for(var i = 0; i < selected.length; i ++){
				var no = selectedST.graph.getNode('selected_' + selected[i]);
				selectedST.addNodeInPath('selected_' + selected[i]);
			}
			selectedST.setRoot('selected_0', 'replot');
		}
		
		function _selectable(settings, node){
			if(typeof(node.id) == 'string' && node.id.indexOf('selected') == 0) return false;
			if(settings.accept.indexOf(node._depth) >= 0) return true;
			if(node.data.leaf && settings.accept.indexOf('leaf') >= 0) return true;
			// FIXME: It is not necessary the tree has 4 levels
			if(settings.accept.indexOf(node._depth - 4) >= 0) return true;
			return false;
		}
		
		// Translate the json string to something JIT understands
		function _processData(obj){
			if(typeof(obj) == 'string'){
				var obj = $.parseJSON(obj);
				if(obj.result !== undefined){
					obj = _processData(obj.result);
				}else {
					obj = _processData(obj);
				}
			}else if(obj.constructor == Array){
				for(key in obj){
					obj[key] = _processData(obj[key]);
				}
			}else if(typeof(obj) == 'object'){
				var data = obj.data ? obj.data : {};
				var keep = ['id', 'name', 'children', 'adjacencies', 'data'];
				for(key in obj){
					if($.inArray(key, keep) < 0){
						data[key] = obj[key];
						delete obj[key];
					}
				}
				obj.data = data;
			}
			return obj;
		}
		
		function _prepareLabel(node, settings){
			var isSelected = false;
			for(var i = 0; i < selected.length; i++){
				if(node.id == selected[i] || (typeof(node.id) == 'string' && node.id.substring(7) == selected[i])){
					isSelected = true;
				}
			}
			
			var text = node.name;
			if(text.length > 20){
				text = $('<span title="' + text + '">' + text.substring(0, 17) + '...</span>');
			}
			
			var div = $('<div>');
			div.append(text);
			var selectable = _selectable(settings, node);
			if(settings.type == 'multiple' && selectable){
				var checkbox = $('<input type="checkbox" id="check_' + node.id + '" style="float:left; margin-left: 5px;"/>');
				checkbox.attr('checked', isSelected);
				checkbox.click(function(event){
					event.stopPropagation();
					if(checkbox.attr('checked')){
						selectNode(settings, node.id);
					}else {
						deSelectNode(settings, node.id);
					}
				});
				div.prepend(checkbox);
			}else if(selectable){
				div.click(function(){
					selectNode(settings, node.id);
				});
			}else if(typeof(node.id) == 'string' && node.id.indexOf('selected') == 0){
				var id = node.id.substring(9);
				var idx = selected.indexOf(id);
				if(idx >= 0){
					var removeLink = $('<div style="float:right;">X</div>');
					removeLink.click(function(){
						deSelectNode(settings, id);
						updateSelectedTree();
						selectedST.refresh();
					});
					div.append(removeLink);
				}
			}
			return div;
		}
		
	};
})(jQuery);