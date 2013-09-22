// Fix chat fixed positioning
$(function(){
	$(window).scroll(function(){
		var t = $(this).scrollTop() + $(window).height();
		$('.chat').each(function(){
			$(this).css({top: (t - $(this).height() - 2) + 'px'}); // 2 is for the border
		});
	});	
});