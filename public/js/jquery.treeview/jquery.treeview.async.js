/*
 * Async Treeview 0.1 - Lazy-loading extension for Treeview
 * 
 * http://bassistance.de/jquery-plugins/jquery-plugin-treeview/
 *
 * Copyright (c) 2007 Jörn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id$
 *
 */

;(function($) {

function load(settings, root, child, container) {
	function createNode(parent) {
		// Change by Jimmy 2011/06/09 : this.text --> this.name
		var current = $("<li/>").attr("id", this.id || "").html("<span>" + this.name + "</span>").appendTo(parent);
		if (this.classes) {
			current.children("span").addClass(this.classes);
		}
		if (this.expanded) {
			current.addClass("open");
		}
		if (this.hasChildren || this.children && this.children.length) {
			var branch = $("<ul/>").appendTo(current);
			if (this.hasChildren) {
				current.addClass("hasChildren");
				createNode.call({
					classes: "placeholder",
					text: "&nbsp;",
					children:[]
				}, branch);
			}
			if (this.children && this.children.length) {
				$.each(this.children, createNode, [branch])
			}
		}
		// Code add by Jimmy 2011/06/09
		if(!this.hasChildren && (!this.children || this.depth >= 3)){
			if(settings.type == 'single'){
				if(!this.depth || this.depth > 3){
					var addBtn = $('<input type="checkbox" name="selected[]" text="'+this.name+'" value="'+this.id+'" />');
					addBtn.bind('click', function(e){ if(settings.onCheckBoxClick) settings.onCheckBoxClick(e, $(this)); });
					current.children('span').prepend(addBtn);
				}
			}else{
				var addBtn = $('<a href="javascript:void(0);" class="f_add btn4 fl_r" category_depth="'+this.depth+'" category_text="'+this.name+'" category_id="'+this.id+'">Add</a>');
				addBtn.bind('click', function(e){ e.preventDefault(); if(settings.onCheckBoxClick) settings.onCheckBoxClick(e, $(this)); });
				current.children('span').append(addBtn);
			}
		}
	}
	$.ajax($.extend(true, {
		url: settings.url,
		dataType: "json",
		data: {
			root: root
		},
		success: function(response) {
			if(!response){
				if(settings.onReturnNull) settings.onReturnNull();
			}else{
				child.empty();
				$.each(response, createNode, [child]);
				$(container).treeview({add: child});
				if(settings.onAfterSearch) settings.onAfterSearch($(container));
			}
	    }
	}, settings.ajax));
	/*
	$.getJSON(settings.url, {root: root}, function(response) {
		function createNode(parent) {
			var current = $("<li/>").attr("id", this.id || "").html("<span>" + this.text + "</span>").appendTo(parent);
			if (this.classes) {
				current.children("span").addClass(this.classes);
			}
			if (this.expanded) {
				current.addClass("open");
			}
			if (this.hasChildren || this.children && this.children.length) {
				var branch = $("<ul/>").appendTo(current);
				if (this.hasChildren) {
					current.addClass("hasChildren");
					createNode.call({
						classes: "placeholder",
						text: "&nbsp;",
						children:[]
					}, branch);
				}
				if (this.children && this.children.length) {
					$.each(this.children, createNode, [branch])
				}
			}
		}
		child.empty();
		$.each(response, createNode, [child]);
        $(container).treeview({add: child});
    });
    */
}

var proxied = $.fn.treeview;
$.fn.treeview = function(settings) {
	if (!settings.url) {
		return proxied.apply(this, arguments);
	}
	var container = this;
	if (!container.children().size())
		load(settings, "source", this, container);
	var userToggle = settings.toggle;
	return proxied.call(this, $.extend({}, settings, {
		collapsed: true,
		toggle: function() {
			var $this = $(this);
			if ($this.hasClass("hasChildren")) {
				var childList = $this.removeClass("hasChildren").find("ul");
				load(settings, this.id, childList, container);
			}
			if (userToggle) {
				userToggle.apply(this, arguments);
			}
		}
	}));
};

})(jQuery);