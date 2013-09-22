function mac_ul()
{
	$("ul.mac_ul li a").addClass($("ul.mac_ul").attr('btn'));
	$("ul.mac_ul li:first-child a").addClass("btnL");
	$("ul.mac_ul li:last-child a").addClass("btnR");
	$("ul.mac_ul li:not(':first-child,:last-child') a").addClass("btnC");
}
$(function(){mac_ul();});


