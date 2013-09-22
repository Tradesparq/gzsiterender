;(function($){
	
	$.fn.extend({
		"volumeControl" : function(options){
			options = $.extend({
				maxLength : "250",
				color : "red"
			},options);
//			alert(options.maxLength);
			var dialogHtml = "<span class='f_sendinfoTip'>" +
							"<span class='f_char_less_than'>还可以输入</span>" +
							"<span class='f_char_more_than' style='display:none;'>已超出</span>" + 
							"<span class='f_char_constantia' style='color:#999'>" + options.maxLength + "</span>" + 
							"<span class=''>字</span>" +  
							"</span>";
			
			$(dialogHtml).insertAfter(this);
			
			var lessTip = this.next("span").find(".f_char_less_than");
			var moreTip = this.next("span").find(".f_char_more_than");
			var charConstantia = this.next("span").find(".f_char_constantia");
			
			this.keyup(function(){
				var charLength = $(this).val().length;
				if(charLength > options.maxLength){
					lessTip.hide();
					moreTip.show();
					charConstantia.css("color",options.color).html(charLength - options.maxLength);
				}else{
					moreTip.hide();
					lessTip.show();
					charConstantia.css("color","#999").html(options.maxLength - charLength);
				}
			});
		}
	});
})(jQuery);