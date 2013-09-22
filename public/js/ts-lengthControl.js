;(function($){
	
	$.fn.extend({
		"lengthControl" : function(options){
			options = $.extend({
				maxLength      : "250",
				lessThanLeft   : "你还可以输入",
				lessThanRight  : "characters remaining",
				moreThan   	   : "You are over by",
				word           : "characters",
				errorColor     : "red"
			},options);

			this.data('options', options);
			var dialogHtml = "<div class='f_sendinfoTip'>" +
							"<span class='f_char_more_than' style='display:none;'>" + options.moreThan + "&nbsp;</span>" + 
							"<span class='f_char_less_than'>" + options.lessThanLeft + "&nbsp;</span>" +
							"<span class='f_char_constantia' style='color:#999'>" + options.maxLength + "</span>&nbsp;" + 
							"<span class='f_char_less_than'>" + options.lessThanRight + "&nbsp;</span>" +
							"<span class='' style='display:none;'>" + options.word + "</span>" +  
							"</div>";
			
			$(dialogHtml).insertAfter(this);
			
			var lessTip = this.next(".f_sendinfoTip").find(".f_char_less_than");
			var moreTip = this.next(".f_sendinfoTip").find(".f_char_more_than");
			var charConstantia = this.next(".f_sendinfoTip").find(".f_char_constantia");
			
			var charLength = $(this).val().length;
			_check(charLength, options, lessTip, moreTip, charConstantia);
			
			this.keyup(function(){
				var charLength = $(this).val().length;
				_check(charLength, options, lessTip, moreTip, charConstantia);
			});
			
			function _check(charLength, options, lessTip, moreTip, charConstantia){
				if(charLength > options.maxLength){
					lessTip.hide();
					moreTip.show();
					charConstantia.css("color",options.errorColor).html(charLength - options.maxLength);
				}else{
					moreTip.hide();
					lessTip.show();
					charConstantia.css("color","#999").html(options.maxLength - charLength);
				}
			}
		},
		"lengthAcceptable" : function(){
			var options = this.data('options');
			if( this.val().length > options.maxLength)
			{
				var textarea = this;
				textarea.css("background-color", options.errorColor);
				setTimeout(function(){textarea.css("background-color", 'white');}, 1000);
				return false;
			}
			else
			{
				return true;
			}
		}
	});
})(jQuery);