function showError(msg, container, animation){
	if(! container) container = $('.error-tip');
	container.errortip({
		type: 'error',
		title: 'Error',
		message: msg,
		errorClass: 'error',
		animation: animation
	});
}

function showNotice(msg, container, animation){
	if(! container) container = $('.error-tip');
	container.errortip({
		type: 'notice',
		title: 'Notice',
		message: msg,
		errorClass: 'notice',
		animation: animation
	});
}

function showCaution(msg, container, animation){
	if(! container) container = $('.error-tip');
	container.errortip({
		type: 'caution',
		title: 'Sorry',
		message: msg,
		errorClass: 'error',
		animation: animation
	});
}

function showConfirm(title, msg, container, ok, cancel){
	if(! container) container = $('.error-tip');
	container.errortip({
		type: 'confirm',
		title: title ? title : 'Confirm',
		message: msg,
		errorClass: 'error',
		animation: 'pop',
		ok: ok,
		cancel: cancel
	});
}

(function($) {
	
	var errorTmpl;
	
	var settings = {
		// warning,error,caution
		type: 'error',
		width: 400,
		title: '',
		text: '',
		message:'',
		errorClass: 'error',
		animation: 'fadeInOut',
		ok: null,
		cancel: null
	};

	var methods = {
			
		init : function( options ) {
			
			if(options){
				$.extend(settings, options);
			}
			
			errorTmpl = _initTmpl(settings);
			
			_show(this);
		}
	};
	
	$.fn.errortip = function(method){
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist.' );
		}
	};
	
	function _initTmpl(settings){
		var errorTmpl = $("#jtmpl_error_tip").tmpl(settings);
		errorTmpl.find('a.f_close').bind('click', function(e){
			e.preventDefault();
			errorTmpl.dialog('close');
			errorTmpl.remove();
			if(settings.cancel) settings.cancel();
		});
		
		if(settings.type == 'confirm'){
			errorTmpl.find('a.f_ok').bind('click', function(e){
				e.preventDefault();
				errorTmpl.dialog('close');
				if(settings.ok) settings.ok();
			});
		}
		return errorTmpl ? errorTmpl : null;
	}
	
	function _show(container){
		var animation = settings.animation;
		if(animation == 'normal'){
			container.html(errorTmpl).show();
		}
		// TODO: fix the animation
		if(animation == 'fadeInOut'){
			container.hover(function(){
				$(this).stop().show().css('opacity', 1);
			}, function(){
				$(this).fadeOut(2000);
			});
			container.html(errorTmpl).fadeIn().delay(6000).fadeOut();
		}

		if(animation == 'pop'){
//			var position = container.position();
//			var offset = container.offset();
			errorTmpl.dialog({
				dialogClass: "dialog-content",
				modal:true,
				resizable:false,
				width:settings.width
//				position:[position.top, position.left]
			});
			//errorTmpl.delay(6000).fadeout(300, function(){errorTmpl.remove();});
		}
	}

	var doNothing = function(){};
})(jQuery);