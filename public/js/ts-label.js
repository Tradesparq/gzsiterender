(function($) {
	
	var methods = {
			
		init : function( options , labels ) {
			if(!labels) labels = [];
			var settings = {
				editable: false,
				onClick: doNothing,
				labelContainer: this.parent(),
				editContainer: this.parent(),
				offsetContainer: this.parent(),
				onAddLabel: doNothing,
				onRemoveLabel: doNothing,
				minWidth: 80,
				maxWidth: 300
			};

			if(options){
				$.extend(settings, options);
			}
			
			
			return this.each(function(){
				var $this = $(this);
				var data = $this.data('label');
				
				if ( ! data ) {
					data = {
						settings: settings,
						labels: labels,
						editing: false,
						currentLabel: null,
						showAll: false,
						visibleZone: null
					};
					$this.data('label', data);
				}else {
					data.editing = false;
					data.showAll = false;
				}
				
				// new function to get img orignal width/height
				setTimeout(function(){
					imgReady($this.attr('src'), function() {
						data.orignalSize = {
							width: this.width,
							height: this.height
						};
					});
				}, 0);
				// old function to get img orignal width/height
//				var tempImg = $('<img/>').attr('src', $this.attr('src'));
//				tempImg.load(function(){
//					data.orignalSize = {
//						width: this.width,
//						height: this.height
//					};
//					$(this).unbind('load');
//				});
				
				for(var i = 0;data.labels && i < data.labels.length; i ++){
					var label = data.labels[i];
					_addLabel($this, label);
				}
				
				if(settings.editable) _createJcrop(this, data, null);
				
			});
		},
		destroy : function(removeData) {
			return this.each(function(){
				var $this = $(this);
				var data = $this.data('label');
				if(data){
					for(var i = 0; i < data.labels.length; i ++){
						var label = data.labels[i];
						if(label.html){label.html.remove(); delete label.html;}
						if(label.edit){label.edit.remove(); delete label.edit;}
					}
					if(data.currentLabel){
						var label = data.currentLabel;
						if(label.html){label.html.remove(); delete label.html;}
						if(label.edit){label.edit.remove(); delete label.edit;}
					}
					if(data.jcrop){
						data.jcrop.destroy();
					}
				}
				if(removeData) $this.removeData('label');
			});
		},
		add : function(label){
			var $this = $(this);
			var data = $this.data('label');
			data.labels.push(label);
			data.settings.onAddLabel(label);
			_addLabel(this, label);
		},
		createLabel : function(coords){
			var $this = $(this);
			var data = $this.data('label');
			var label = data.currentLabel;
			label.coords=coords;
			_createJcrop(this, data, label);
			label.edit.show();
		},
		showAll : function(show){
			var $this = $(this);
			var data = $this.data('label');
			data.showAll = show;
			for(var i = 0; i < data.labels.length; i ++){
				var label = data.labels[i];
				if(label.edit){label.edit.hide();}
				if(label.html){
					if(show){
						label.html.show();
						label.html.find('.label-select').show();
						label.html.find('.label-text').show();
					}else {
						label.html.hide();
					}
				}
			}
		}
		
	};
	
	$.fn.label = function(method){
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist.' );
		}
	};
	
	function _addLabel(image, label){
		var data = image.data('label');
		var container = data.settings.labelContainer;
		
		// Prepare the html label
		if(!label.html){
			label.html = _createHtml(image, container, label);
			_updateHtml(image, label, data);
		}

		// Prepare the edit section
		if(data.settings.editable && !label.edit){
			label.edit = _createEdit(image, data.settings.editContainer, label);
		}
		data.currentLabel = label;
	}
	
	function _createHtml(image, container, label){
		var data = image.data('label');
		var html = $('<div class="label-container"><div class="label-select"></div><div class="label-text"></div></div>');
		var select = html.find('.label-select');
		var text = html.find('.label-text');
		
		container.mouseover(function(){_showHtml(html, data, true);});
		container.mouseout(function(){_showHtml(html, data, false);});
		select.mouseover(function(){if(!data.editing) text.show();});
		select.mouseout(function(){if(!data.showAll) text.hide();});
		select.click(data.settings.onClick);
		container.append(html);
		return html;
	}
	
	function _showHtml(html, data, show){
		if(!data.editing && show){
			html.find('.label-text').css('max-width', html.find('.label-select').width());
			html.show();
		}else if(!data.showAll && !show){
			html.hide();
		}
	}

	function _createEdit(image, container, label){
		if(!label){label = {coords: {x:0, y:0, w:0, h:0, x2:0, y2:0}};} // Initialize a new label if none is given
		var data = image.data('label');
		var edit = $('<div class="label-edit-container"><textarea></textarea><div class="mts"><a href="save" class="btn4 btnL f_save">Save</a><a href="cancel" class="btn4 btnC f_cancel">Cancel</a><a href="delete" class="btn4 btnR f_delete">Delete</a></div></div>');
		edit.find('textarea').autoResize();
		// TODO: test use to bind ESC key and CTRL+ENTER key
		label.isCtrl = false;
		edit.find('textarea').keyup(function(e){
			if(e.keyCode == 17)	label.isCtrl = false;
		}).keydown(function(e){
			// CTRL key pressed
			if(e.keyCode == 17) label.isCtrl = true;
		    // ESCAPE key pressed
		    if (e.keyCode == 27) {
		    	edit.find('a.f_cancel').click();
		    	return false;
		    }
		    // CTRL + S key pressed 冲突 with browse
//		    if(e.keyCode == 83 && label.isCtrl == true){
		    // CTRL + ENTER key pressed
	    	if(e.keyCode == 13 && label.isCtrl == true){
		    	e.preventDefault();
		    	edit.find('a.f_save').click();
		    	return false;
		    }
		});
		
		label.edit = edit;
		if(label.html){
			_updateHtml(image, label, data);
		}else {
			_addLabel(image, label);
		}
		label.html.find('.label-select').click(function(){
			label.html.hide();
			_createJcrop(image, data, label);
			label.edit.show().find('textarea').val(label.text).focus();
		});
		
		// reg save fn
		edit.find('a.f_save').bind('click', function(e){
			e.preventDefault();
			var visibleSelect = data.jcrop.tellSelect();
			var ratio = data.orignalSize ? data.orignalSize.width / image.width() : 1;
			label.coords = _zoom(visibleSelect, ratio);
			label.text = edit.find('textarea').val();
			
			var found = false;
			for(var i = 0; i < data.labels.length; i++){
				if(data.labels[i] == label) found = true;
			}
			if(!found) data.labels.push(label);
			
			data.settings.onAddLabel(label);
			_updateHtml(image, label, data);
			label.html.show();
			data.editing = false;
			edit.hide();
			_createJcrop(image, data, null);
		});
		// reg cancel fn
		edit.find('a.f_cancel').bind('click', function(e){
			e.preventDefault();
			var found = false;
			for(var i = 0; i < data.labels.length; i++){
				if(data.labels[i] == label) found = true;
			}
			if(!found){
				if(label.html) label.html.remove();
				if(label.edit) label.edit.remove();
			}
			data.editing = false;
			edit.hide();
			_createJcrop(image, data, null);
		});
		// reg delete fn
		edit.find('a.f_delete').bind('click', function(e){
			e.preventDefault();
			if(label.html) label.html.remove();
			if(label.edit) label.edit.remove();
			for(var i = 0; i < data.labels.length; i++){
				if(data.labels[i] == label) data.labels.splice(i, 1);
				data.settings.onRemoveLabel(label);
			}
			data.editing = false;
			edit.hide();
			_createJcrop(image, data, null);
		});
		
		/*
		edit.find('a').click(function(e){
			e.preventDefault();
			$this = $(this);
			var href = $this.attr('href');
			switch (href) {
			case 'save':
				var visibleSelect = data.jcrop.tellSelect();
				var ratio = data.orignalSize ? data.orignalSize.width / image.width() : 1;
				label.coords = _zoom(visibleSelect, ratio);
				label.text = edit.find('textarea').val();
				
				var found = false;
				for(var i = 0; i < data.labels.length; i++){
					if(data.labels[i] == label) found = true;
				}
				if(!found) data.labels.push(label);
				
				data.settings.onAddLabel(label);
				_updateHtml(image, label, data);
				label.html.show();
				break;
			case 'cancel':
				// TODO：BUG--会添加越来越多的 label-container label-edit-container div
				var found = false;
				for(var i = 0; i < data.labels.length; i++){
					if(data.labels[i] == label) found = true;
				}
				if(!found){
					if(label.html) label.html.remove();
					if(label.edit) label.edit.remove();
				}
				break;
			case 'delete':
				if(label.html) label.html.remove();
				if(label.edit) label.edit.remove();
				for(var i = 0; i < data.labels.length; i++){
					if(data.labels[i] == label) data.labels.splice(i, 1);
					data.settings.onRemoveLabel(label);
				}
			default:
				break;
			}
			data.editing = false;
			edit.hide();
			_createJcrop(image, data, null);
		});
		 */
		container.append(edit);
		return edit;
	}
	
	function _updateHtml(image, label, data){
		var ratio = data.orignalSize ? data.orignalSize.width / image.width() : 1;
		label.html.css({
			left: label.coords.x / ratio + parseInt(data.settings.offsetContainer.css('margin-left')) + 'px',
			top: label.coords.y / ratio + parseInt(data.settings.offsetContainer.css('margin-top')) + 'px'
		});

		label.html.find('.label-select').css({
			width: label.coords.w / ratio,
			height: label.coords.h / ratio
		});
		label.html.find('.label-text').text(label.text);
	}
	
	function _createJcrop(that, data, label){
		if(data.jcrop) data.jcrop.destroy();
		var ratio = data.orignalSize ? $(that).width() / data.orignalSize.width : 1;
		if(label && label.edit){
			edit = label.edit;
			_updateEditPosition(edit, _zoom(label.coords, ratio), data);
		}else {
			edit = _createEdit($(that), data.settings.editContainer, null);
		}
		
		p = label && label.coords ? _zoom(label.coords, ratio) : undefined;
		var jcrop = $.Jcrop(that, {
			onSelect : function(coords){
				_updateEditPosition(edit, coords, data);
				edit.show().find('textarea').focus();
			},
			onChange : function(coords){
				data.editing = true;
				edit.hide();
			},
			setSelect: (p ? [p.x, p.y, p.x2, p.y2] : undefined)
		});
		data.jcrop = jcrop;
	}
	
	function _updateEditPosition(edit, coords, data){
		var width = coords.w;
		width = width > data.settings.maxWidth ? data.settings.maxWidth : width;
		width = width < data.settings.minWidth ? data.settings.minWidth : width;
		edit.css({
			left: coords.x + parseInt(data.settings.offsetContainer.css('margin-left')) + 'px', 
			top: coords.y + coords.h + parseInt(data.settings.offsetContainer.css('margin-top'))  + 'px',
			width: width
		});
	}
	
	function _zoom(coords, ratio){
		var position = {
			x: coords.x * ratio,
			y: coords.y * ratio,
			w: coords.w * ratio,
			h: coords.h * ratio,
			x2:coords.x2 * ratio,
			y2:coords.y2 * ratio
		};
		return position;
	}
	
	var doNothing = function(){};
})(jQuery);