//plugin to show / create/edit guide tips for current page
(function($){
	/**
	 * 设置默认属性
	 */
	var methods = {

		init : function( options ) {
			var settings = {
				container: this,
				toolbarContainer: null,
				featureListContainer: null,
				currPage: null,
				currNode: null,
				currOrder: 0,
				currLeft: null,
				currTop: null,
				currWidth: null,
				currHeight: null,
				defaultW: 400,
				defaultH: 520,
				canEdit: false,
				editing: false,
				tips: null,
				loadUrl: 'user/guide/j_guide',
				neverUrl: 'user/guide/never',
				saveUrl: 'user/guide/save',
				removeUrl: 'user/guide/remove'
			};
			
			if(options){
				$.extend(settings, options);
			}
			
			_init(settings);
		}
	};
	/**
	 * 注册插件
	 */
	$.fn.plguide = function(method){
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist.' );
		}
	};
	/**
	 * 初始化
	 */
	function _init(settings){
		if(settings.canEdit){
			// init admin toolbar
			_initToolbar(settings);
			// load guide
			if(!$.isEmptyObject(settings.currPage)){
				_loadGuideTips(settings, function(){
					_checkPreview(settings);
				});
			}
		}else{
			if(!$.isEmptyObject(settings.currPage)){
				settings.editing = false;
				settings.previewing = true;
				_loadGuideTips(settings, function(){
					_initGuide(settings);
				});
			}
		}
	}
	/**
	 * Method to load default guide tips for current page
	 * 加载当前页面指南
	 */
	function _loadGuideTips(settings, success){
//		$.post(settings.loadUrl, {page:settings.currPage}, function(data){
		heartbeat.register(settings.loadUrl, {page:settings.currPage}, function(data){
			if(data){
				data = $.parseJSON(data);
				if(data.num_rows > 0){
					if($.isEmptyObject(settings.tips)) settings.tips = new Array();
					for(var i=0; i < data.num_rows; i++){
						settings.tips[i] = data.result[i];
					}
					if(success) success();
				}else{
					settings.previewing = false;
				}
			}
		}, true);
	}
	/**
	 * Init admin toolbar
	 */
	function _initToolbar(settings){
		var toolbarCntr = $('#jtmpl_plgn_guide_toolbar').tmpl();		
		$('body .leftCol .guide_placeholder').before(toolbarCntr);
		// reg create guide function
		toolbarCntr.find('.f_create').click(function(e){
			e.preventDefault();
			settings.editing = false;
			settings.previewing = false;
			_regEditMethod(settings);			
		});
		// reg preview current page guide function
		toolbarCntr.find('.f_preview').click(function(e){
			if(!$.isEmptyObject(settings.tips)){
				settings.editing = false;
				settings.previewing = true;
				settings.currOrder = 0;
				_initGuide(settings);
			}
		});
		settings.toolbarContainer = toolbarCntr;		
		
		/*
		$('body').append(toolbarCntr);
		var top = ($(window).height() - toolbarCntr.height()) / 2;
		toolbarCntr.css("top", top);		
		toolbarCntr.data('width', toolbarCntr.width());
		toolbarCntr.data('height', toolbarCntr.height());		
		toolbarCntr.hover(function(e){
			toolbarCntr.stop().animate({
			    width: $(this).width() + $(this).find('.f_toolbar_box').width(),
			    height: $(this).find('.f_toolbar_box').height() 
			  }, 'normal');
			toolbarCntr.find('.f_toolbar_box').show();
			// 检查是否可以预览
			_checkPreview(settings);
		},function(e){
			toolbarCntr.stop().animate({ 
			    width: toolbarCntr.data('width'),
			    height: toolbarCntr.data('height')
			  }, 'normal');
			toolbarCntr.find('.f_toolbar_box').hide();
		});
		// reg create guide function
		toolbarCntr.find('.f_create').click(function(e){
			e.preventDefault();
			settings.editing = false;
			settings.previewing = false;
			_regEditMethod(settings);
			
			toolbarCntr.stop().animate({ 
			    width: toolbarCntr.data('width'),
			    height: toolbarCntr.data('height')
			}, 'normal');
			toolbarCntr.find('.f_toolbar_box').hide();
		});
		// reg preview current page guide function
		toolbarCntr.find('.f_preview').click(function(e){
			toolbarCntr.stop().animate({ 
			    width: toolbarCntr.data('width'),
			    height: toolbarCntr.data('height')
			}, 'normal');
			toolbarCntr.find('.f_toolbar_box').hide();
			
			if(!$.isEmptyObject(settings.tips)){
				settings.editing = false;
				settings.previewing = true;
				settings.currOrder = 0;
				_initGuide(settings);
			}
		});
		settings.toolbarContainer = toolbarCntr;
		*/
	}
	/**
	 * 注册可创建/编辑指南功能
	 */
	function _regEditMethod(settings){
		$('#container *').each(function(i, e){
			$(e).hover(function(e){
				e.stopPropagation();
//				if(settings.previewing) return;
				$this = $(this);
				
				// TODO：初始化当前节点 高亮 设置默认方位 
				settings.currNode = $this;
				$this.data('border', $this.css('border'));
				$this.css('border', '');
				$('.guide_edit').removeClass('guide_edit');
				$this.addClass('guide_edit');
				/* 在当前元素位置显示 */
				if(($this.offset().left + $this.width()) > ($('body').width() - 100)){
					settings.currLeft = $('body').width() - $this.width();
					if(settings.featureListContainer) settings.currLeft = $this.offset().left - settings.featureListContainer.width();
				}else{
					settings.currLeft = $this.offset().left + $this.width();
				}
				
				settings.currTop = $(window).scrollTop() > 0 ? $this.offset().top - $(window).scrollTop() : $this.offset().top; 
				
				_showFeatureList(settings);
				
				/*获取鼠标位置，显示功能列表
				if (!e) var e = window.event;
				var posx, posy;
				if (e.pageX || e.pageY) {
				    posx = e.pageX;
				    posy = e.pageY;
				}
				else if (e.clientX || e.clientY) {
				    posx = e.clientX + document.body.scrollLeft
				        + document.documentElement.scrollLeft;
				    posy = e.clienty + document.body.scrollTop
				        + document.documentElement.scrollTop;
				}
				settings.currPosition = [posx, posy];
				console.log('当前位置：'+settings.currPosition);
				_showFeatureList(settings);	
				*/
			},function(e){
				e.stopPropagation();
				$this = $(this);
				$this.css('border', $this.data('border'));
				$this.removeClass('guide_edit');
				_hideFeatureList(settings);
			});
		});
	}
	/**
	 * 初始化功能列表
	 */
	function _initFeatureList(settings){
		var featureListContainer = $('#jtmpl_plgn_guide_feature_list').tmpl();
		// reg create guide tip function
		featureListContainer.find('.f_create').bind('click', function(e){
			e.preventDefault();
			featureListContainer.dialog('close');
			settings.previewing = false;
			settings.editing = true;
			settings.currOrder = $.isEmptyObject(settings.tips) ? 0 : settings.tips.length; 
			_initGuide(settings);
		});
		// show guide feature list
		featureListContainer.dialog({
			dialogClass : 'dialog-no-title dialog-content',
			resizable: false,
			draggable: false,
			width: 100,
			position: [settings.currLeft, settings.currTop]
		});
		featureListContainer.hover(function(e){
			featureListContainer.data('showing', true);
		},function(e){
			featureListContainer.dialog('close');
		});
		return featureListContainer;
	}
	/**
	 * Method to show feature list
	 * 显示功能列表
	 */
	function _showFeatureList(settings){
		if(!settings.featureListContainer){
			settings.featureListContainer = _initFeatureList(settings);
		}else{
			if(!settings.editing && !settings.previewing){
//				console.log('更新位置到：'+[settings.currLeft, settings.currTop]);
				settings.featureListContainer.dialog("option", "position", [settings.currLeft, settings.currTop]);
				settings.featureListContainer.dialog('open');
			}
		}		
	}
	/**
	 * Method to hide feature list
	 * 隐藏功能列表
	 */
	function _hideFeatureList(settings){
		if(settings.featureListContainer && !settings.featureListContainer.data('showing')){
//			settings.featureListContainer.dialog('close');
		}
	}
	/**
	 * Method to check preview
	 */
	function _checkPreview(settings){
		if($.isEmptyObject(settings.tips)){
			disabledItem(settings.toolbarContainer.find('.f_preview'));
		}else{
			enabledItem(settings.toolbarContainer.find('.f_preview'));
		}
	}
	/**
	 * Method to init a guide edit tmpl
	 * @param settings
	 * @returns
	 */
	function _initGuide(settings){		
		var guideEditContainer = $('#jtmpl_plgn_guide_edit').tmpl(settings);
		if(settings.canEdit){
			var guideTipForm = guideEditContainer.find('form[name=guide_tip_form]');
			// validate form
			guideTipForm.validate({
				submitHandler:function(form){
					var sendData = $(form).serialize();
					_saveGuideTip(settings, sendData, function(data){
						$(form).find('input[name="tip[id]"]').val(data.id);
						$(form).find('.f_remove').show();
					});
				}
			});
			var previewContainer = guideEditContainer.find('.f_guide_tip_preview');
			var editContainer = guideEditContainer.find('.f_guide_tip_edit');		
			// reg preivew function
			guideEditContainer.find('.f_preview').bind('click', function(e){
				e.preventDefault();
				previewContainer.find('.f_content').html(guideTipForm.find('textarea[name="tip[content]"]').val());
				editContainer.hide();
				previewContainer.show();
				_enableEdit(guideEditContainer, false);
			});
			// reg save function
			guideEditContainer.find('.f_save').bind('click', function(e){
				e.preventDefault();
				guideTipForm.submit();
			});
			// reg remove function
			guideEditContainer.find('.f_remove').bind('click', function(e){
				e.preventDefault();
				if(guideTipForm.find('input[name="tip[id]"]').val() > 0){
					showConfirm('Remove Guide Tip', 'Are you sure you want to remove this guide tip?', null, function(){
						_removeGuideTip(settings, guideTipForm.find('input[name="tip[id]"]').val(), function(data){
							guideEditContainer.dialog('close');
						});
					});
				}
			});
			// reg edit function
			guideEditContainer.find('.f_edit').bind('click', function(e){
				e.preventDefault();
				previewContainer.hide();
				editContainer.show();
				_enableEdit(guideEditContainer, true);
			});
			// reg change direction function
			guideEditContainer.find('input[name="tip[direction]"]').bind('click', function(e){
				var $this = $(this);
				$this.parents('.f_guide_container')
				.removeClass('bubbleTop yowzaTop bubbleRight yowzaRight bubbleBottom yowzaBottom bubbleLeft yowzaLeft')
				.addClass('bubble'+$this.val()+' yowza'+$this.val());
				// TODO: move
				switch($this.val()){
				   	case 'Top':
				   		// 箭头朝上，向下移动 到当前节点的相对位置上 无偏移
//				   		TODO：把所有的guideEditContainer.parents('.ui-dialog').find('.ui-dialog-titlebar').outerHeight() 改成 tip[width]
				   		settings.currLeft = settings.currNode.offset().left;
			   			settings.currTop = settings.currNode.offset().top + settings.currNode.height() - guideEditContainer.parents('.ui-dialog').find('.ui-dialog-titlebar').outerHeight();
			   			if($(window).scrollTop() > 0) settings.currTop -= $(window).scrollTop();
			   			// 记录相对于当前节点的偏移
						guideEditContainer.find('input[name="tip[left]"]').val(0);
						guideEditContainer.find('input[name="tip[top]"]').val(settings.currNode.height() - guideEditContainer.parents('.ui-dialog').find('.ui-dialog-titlebar').outerHeight());
						
			   			guideEditContainer.dialog("option", "position", [settings.currLeft, settings.currTop]);
				   		break;
				   	case 'Right':
				   		// 箭头朝右，向左移动 到当前节点的相对位置左 无偏移
//				   		TODO：把所有的guideEditContainer.parents('.ui-dialog').find('.ui-dialog-titlebar').outerHeight() 改成 tip[width]				   		
				   		settings.currLeft = settings.currNode.offset().left - guideEditContainer.parents('.ui-dialog').outerWidth();
				   		settings.currTop = settings.currNode.offset().top - guideEditContainer.parents('.ui-dialog').find('.ui-dialog-titlebar').outerHeight();
				   		if($(window).scrollTop() > 0) settings.currTop -= $(window).scrollTop();
				   		// 记录相对于当前节点的偏移
						guideEditContainer.find('input[name="tip[left]"]').val(-guideEditContainer.parents('.ui-dialog').outerWidth());
						guideEditContainer.find('input[name="tip[top]"]').val(-guideEditContainer.parents('.ui-dialog').find('.ui-dialog-titlebar').outerHeight());
						
				   		guideEditContainer.dialog("option", "position", [settings.currLeft, settings.currTop]);				   		
				   		break;
				   	case 'Bottom':
				   		
				   		break;
				   	case 'Left':
				   		// 箭头朝上，向下移动 到当前节点的相对位置上 无偏移
//				   		TODO：把所有的guideEditContainer.parents('.ui-dialog').find('.ui-dialog-titlebar').outerHeight() 改成 tip[width]
				   		settings.currLeft = settings.currNode.offset().left + settings.currNode.outerWidth();
				   		settings.currTop = settings.currNode.offset().top - guideEditContainer.parents('.ui-dialog').find('.ui-dialog-titlebar').outerHeight();
				   		if($(window).scrollTop() > 0) settings.currTop -= $(window).scrollTop();
				   		// 记录相对于当前节点的偏移
						guideEditContainer.find('input[name="tip[left]"]').val(settings.currNode.outerWidth());
						guideEditContainer.find('input[name="tip[top]"]').val(-guideEditContainer.parents('.ui-dialog').find('.ui-dialog-titlebar').outerHeight());
						
				   		guideEditContainer.dialog("option", "position", [settings.currLeft, settings.currTop]);
				   		break;
				   	default:
				   		break;
				}
			});
		}
		// reg close function
		guideEditContainer.find('.f_close').bind('click', function(e){
			e.preventDefault();
			guideEditContainer.dialog('close');
			settings.editing = false;
			settings.previewing = false;
		});
		// reg never show function
		guideEditContainer.find('.f_never').bind('click', function(e){
			e.preventDefault();
			_never(settings, function(data){				
				if(settings.currOrder == (settings.tips.length-1)){
					guideEditContainer.dialog('close');
				}else{
					guideEditContainer.find('.f_next').click();
				}
			});
		});
		// reg prev function
		guideEditContainer.find('.f_prev').bind('click', function(e){
			e.preventDefault();
			guideEditContainer.dialog('close');
			settings.editing = false;
			settings.previewing = true;
			settings.currOrder --;
			_initGuide(settings);
		});
		// reg next function
		guideEditContainer.find('.f_next').bind('click', function(e){
			e.preventDefault();
			guideEditContainer.dialog('close');
			settings.editing = false;
			settings.previewing = true;
			settings.currOrder ++;
			_initGuide(settings);
		});

		// 如果正在预览 并且已存在当前tip 根据当前节点 计算出当前tip所在位置
		if(settings.previewing && settings.tips && settings.tips[settings.currOrder]){
			settings.currLeft = parseFloat(settings.tips[settings.currOrder].left);
			settings.currTop = parseFloat(settings.tips[settings.currOrder].top);

			if($.isEmptyObject(settings.tips[settings.currOrder].nodeObj)){
				if(settings.tips[settings.currOrder].node){
//					console.log(settings.tips[settings.currOrder].node);
					// 找到当前元素
					var html = settings.tips[settings.currOrder].node.trim();
					html = html.replace(/\ +/g,"");//去掉空格
					html = html.replace(/[ ]/g,"");//去掉空格
					html = html.replace(/[\r\n\t]/g,"");//去掉回车换行
//					console.log(html);
					$('body *').each(function(i, e){
						var currHtml = $(e).html().trim();
						currHtml = currHtml.replace(/\ +/g,"");//去掉空格
						currHtml = currHtml.replace(/[ ]/g,"");//去掉空格
						currHtml = currHtml.replace(/[\r\n\t]/g,"");//去掉回车换行
//						console.log(currHtml);
						
//						if($(e).html() == html){
						if(currHtml == html){
							console.log(currHtml);
//							console.log('找到啦');
//							console.log($(e));
							settings.tips[settings.currOrder].nodeObj = $(e);
							settings.currNode = $(e);
							return;
						}
					});
				}
			}else{
				settings.currNode = settings.tips[settings.currOrder].nodeObj; 
			}
		}
		
		// TODO：计算出当前位置
		if(!$.isEmptyObject(settings.currNode)){
			settings.currLeft = settings.currNode.offset().left;
			settings.currTop = settings.currNode.offset().top;
			
			if(settings.tips && settings.tips[settings.currOrder]){
				settings.currLeft = settings.currNode.offset().left + parseFloat(settings.tips[settings.currOrder].left);
				settings.currTop = settings.currNode.offset().top + parseFloat(settings.tips[settings.currOrder].top);
				// 初始化 宽段
				settings.currWidth = parseFloat(settings.tips[settings.currOrder].width);
			}
		}
		
		// 非预览时不要滚动窗口 
		if(settings.previewing && ((settings.currTop < $(window).scrollTop()) || (settings.currTop > ($(window).height() + $(window).scrollTop())))){
			var move = settings.currTop;
			settings.currTop = 0;
			$('html, body').animate({scrollTop:move}, 500, function(){
				_showGuide(settings, guideEditContainer);
			});
		}else{
			if($(window).scrollTop() > 0){
				settings.currTop = settings.currTop - $(window).scrollTop();
			}
			_showGuide(settings, guideEditContainer);
		}
		
	}
	/**
	 * Method to show guide dialog
	 */
	function _showGuide(settings, guideEditContainer){
		guideEditContainer.dialog({
			dialogClass : settings.previewing ? 'dialog-guide' : 'dialog-guide-edit',//dialog-no-title dialog-content 
			modal: true,
			resizable: settings.editing ? true : false,
			draggable: settings.editing ? true : false,
			width: settings.currWidth > 0 ? settings.currWidth : settings.defaultW,
//			height: settings.currWidth > 0 ? settings.currWidth : settings.defaultH,
			position: [settings.currLeft, settings.currTop],
			closeOnEscape: false,
			open: function(event, ui){
				if(settings.currNode){ // && !settings.prieviewing
					settings.currNode.data('z-index', settings.currNode.css('z-index'));
					settings.currNode.data('position', settings.currNode.css('position'));
					var zIndex = $(event.target.parentNode).css('z-index');
					settings.currNode.css({'z-index': zIndex, 'position': 'relative'});
				}
			},
			close: function(){
				settings.editing = false;
				settings.previewing = false;
				if(settings.currNode) {
					settings.currNode.css({'z-index': settings.currNode.data('z-index') ? settings.currNode.data('z-index') : 0, 'position': settings.currNode.data('position')});
					settings.currNode = null;
				}
				if(settings.canEdit){
//					guideEditContainer.find('.richtext').ckeditorGet().destroy();
				}
				guideEditContainer.remove();
			},
			dragStop: function(event, ui){
				if(settings.canEdit){
					// 记录相对于当前节点的偏移
					guideEditContainer.find('input[name="tip[left]"]').val(ui.offset.left - settings.currNode.offset().left);
					guideEditContainer.find('input[name="tip[top]"]').val(ui.offset.top - settings.currNode.offset().top);
				}
			},
			resizeStop: function(event, ui){
				if(settings.canEdit){						
					guideEditContainer.find('input[name="tip[width]"]').val(ui.size.width);
					guideEditContainer.find('input[name="tip[height]"]').val(ui.size.height);
				}
			}
		});
		
		if(settings.canEdit){
			/*
			// use setTimeout fix ie6 bug just like ad 
			setTimeout(function(){
				guideEditContainer.find('.richtext').ckeditor(function(){
					// callback
//					$(this).focus();
				},{
//					customConfig : 'js/ckeditor/config_comment.js'
					language : 'en',
					uiColor : '#D5EBF5',
					skin : 'kama',
					width : '100%',
					height : '160px',
					toolbar : 'Basic'
				});
			}, 0);
			*/
		}
	}
	/**
	 * Mehtod to enable guideEditContainer
	 */
	function _enableEdit(guideEditContainer, enable){
		if(enable){
			guideEditContainer.dialog("option", "dialogClass", 'dialog-guide-edit');
		}else{
			guideEditContainer.dialog("option", "dialogClass", 'dialog-guide');
		}
		guideEditContainer.dialog("option", "resizable", enable);
		guideEditContainer.dialog("option", "draggable", enable);
	}
	/**
	 * Method to save one guide tip
	 * @param sendData
	 * @returns
	 */
	function _saveGuideTip(settings, sendData, success){
		var working = showWorking('Saving guide tip.', "<?=lang('please_wait.')?>");
		$.post(settings.saveUrl, sendData, function(data){
			working.dialog('close');
			if(data){
				data = $.parseJSON(data);
				if($.isEmptyObject(settings.tips)) settings.tips = new Array();
				settings.tips[settings.currOrder] = data;
				if(success) success(data);
			}else{
				showCaution('Save faild. try again.', null, 'pop');
			}
		});
	}
	/**
	 * Method to remove one guide tip
	 */
	function _removeGuideTip(settings, id, success){
		var working = showWorking('Removing guide tip.', "<?=lang('please_wait.')?>");
		$.post(settings.removeUrl, {id:id}, function(data){
			working.dialog('close');
			data = $.parseJSON(data);
			if(data > 0){
				if(!$.isEmptyObject(settings.tips)){				
					// 移除当前 当前 其它向下移动一位
					for(var i = settings.currOrder; i < settings.tips.length-1; i++){
						settings.tips[i] = settings.tips[i+1];
					}
					settings.tips.pop();
//					var bef = settings.tips.slice(0, settings.currOrder-1);
//					var aft = settings.tips.slice(settings.currOrder+1, settings.tips.length-1);
//					settings.tips = bef.concat(aft);
				}
				if(success) success(data);
			}else{
				showCaution('Remove faild. try again.', null, 'pop');
			}
		});
	}
	/**
	 * Method to never show this guide on current page
	 */
	function _never(settings, success){
//		var guides = '';
//		for(var i=0; i< settings.tips.length; i++){
//			guides += settings.tips[i].id;
//			if(i !== settings.tips.length-1) guides += ',';
//		}
		var guide_id = settings.tips[settings.currOrder].id;
		if(guide_id > 0){
			$.post(settings.neverUrl, {page:settings.currPage, guide_id:guide_id}, function(data){
				if(data > 0){
					if(success) success(data);
				}else{
					// faild 
				}
			});
		}
	}
	/**
	 * doNothing
	 */
	var doNothing = function(){};
})(jQuery);