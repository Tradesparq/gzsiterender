/*
 * Shamelessly copied and modified by EdwardRF
 *  
 * === Pretty date ===
 * 
 * Based on http://bassistance.de/jquery-plugins/jquery-plugin-prettydate/
 * 
 * Based on John Resig's prettyDate http://ejohn.org/blog/javascript-pretty-date
 *
 * Copyright (c) 2009 JÃ¶rn Zaefferer
 *
 * $Id: jquery.validate.js 6096 2009-01-12 14:12:04Z joern.zaefferer $
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *   
 * === AND ===
 * 
 * http://www.zachleat.com/web/2008/03/23/yet-another-pretty-date-javascript/
 * 
 * Javascript Humane Dates
 * Copyright (c) 2008 Dean Landolt (deanlandolt.com)
 * Re-write by Zach Leatherman (zachleat.com)
 * 
 * Adopted from the John Resig's pretty.js
 * at http://ejohn.org/blog/javascript-pretty-date
 * and henrah's proposed modification 
 * at http://ejohn.org/blog/javascript-pretty-date/#comment-297458
 * 
 * Licensed under the MIT license.
 * 
 */

function RemainingDate(options){
	var defaults = {
		messages: {
			now: "just now",
			minute: "1 minute",
			minutes: "{0} minutes",
			hour: "1 hour",
			hours: "{0} hours",
			yesterday: "Yesterday",
			days: "{0} days",
			week: "1 week",
			weeks: "{0} weeks",
			month: "1 month",
			months: "{0} months",
			year: "1 year",
			years: "{0} years"
		}
	};
	
	this.settings = $.extend(defaults, options);
	
	this.template = function(source, params) {
		if ( arguments.length == 1 ) 
			return function() {
				var args = $.makeArray(arguments);
				args.unshift(source);
				return $.remainingDate.template.apply( this, args );
			};
		if ( arguments.length > 2 && params.constructor != Array  ) {
			params = $.makeArray(arguments).slice(1);
		}
		if ( params.constructor != Array ) {
			params = [ params ];
		}
		$.each(params, function(i, n) {
			source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n);
		});
		return source;
	};
	
	this.now = function() {
		return new Date();
	};
	
	this.strToReadable = function(str) {
		var date = new Date(str);
		if(date.getTime()){
//			var diff = (this.now().getTime() - date.getTime()) / 1000;
			var diff = (date.getTime() - this.now().getTime()) / 1000;
			var day_diff = Math.floor(diff / 86400);
			var messages = this.settings.messages;
			var str =  (
				day_diff <= 0 && (
						diff < 60 && messages.now ||
						diff < 120 && messages.minute ||
						diff < 3600 && this.template(messages.minutes, Math.floor( diff / 60 )) ||
						diff < 7200 && messages.hour ||
						diff < 86400 && this.template(messages.hours, Math.floor( diff / 3600 ))
				) ||
				day_diff == 1 && messages.yesterday ||
				day_diff < 7 && this.template(messages.days, day_diff) ||
				day_diff < 31 && this.template(messages.weeks, Math.ceil( day_diff / 7 )) ||
				Math.ceil( day_diff / 31 ) == 1 && messages.month ||
				day_diff < 365 && this.template(messages.months, Math.ceil( day_diff / 31 )) ||
				Math.ceil( day_diff / 365 ) == 1 && messages.year ||
				this.template(messages.years, Math.ceil( day_diff / 365 ))
			);
		}
		return str;
	};
}

RemainingDate.prototype.format = function(datetime, raw){
	if(!datetime) return null;
	var dateStr = datetime;
	if(datetime.date && datetime.timezone){
		dateStr = (datetime.date || "").replace(/-/g,"/") + ' ' + datetime.timezone;
	}
	var readable = this.strToReadable(dateStr);
	if(raw) return readable;
	return '<span class="datetime" title="' + dateStr + '">' + readable+ '</span>';
};