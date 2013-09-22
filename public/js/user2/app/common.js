/*
 * Put all the common functions here.
 */

/* ---------------------------------I am separator line--------------------------------------- */

/* ---------------------------------以下函数来自Branch3.0--------------------------------------- */

/**
 * Method to inherit a base class
 */
function inherit(base, sub){
	sub.prototype = new base();
	return sub;
}

/**
 * 解决IE6兼容trim()
 * TODO: 3.0版不再支持IE6,7，这里可以移除？
 */
if (typeof String.prototype.trim !== 'function') {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, '');
	};
}

/**
 * To add compatible Object.keys support in older environments that do not natively support it, copy the following snippet: 
 */
if ( ! Object.keys) {
	Object.keys = (function() {
		var hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !({
			toString : null
		}).propertyIsEnumerable('toString'), dontEnums = [ 'toString',
				'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf',
				'propertyIsEnumerable', 'constructor' ], dontEnumsLength = dontEnums.length

		return function(obj) {
			if (typeof obj !== 'object' && typeof obj !== 'function'
					|| obj === null)
				throw new TypeError('Object.keys called on non-object')

			var result = []

			for ( var prop in obj) {
				if (hasOwnProperty.call(obj, prop))
					result.push(prop)
			}

			if (hasDontEnumBug) {
				for ( var i = 0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i]))
						result.push(dontEnums[i])
				}
			}
			return result
		}
	})()
};

/**
 * Convert params to uri
 * 
 * @param params {Object}
 * @returns {String}
 */
function paramsToUri(params) {
	var result = '';
	
	var keys = Object.keys(params) || [];
	
	$.each(keys, function(index, item){
		result += item;
		result += '=';
		result += encodeURIComponent(params[item]); // FIXES #1253 $.URLEncode(params[item]);
		result += '&';
	});
	
	if (result.lastIndexOf('&') == result.length - 1) {
		result = result.substring(0, result.length - 1);
	}
	
	return result;
}

/**
 * Convert uri to params
 * 
 * References http://jsfiddle.net/QqAqq/
 * 
 * @param uri {String}
 * @returns {Object}
 */
function uriToParams(uri) {
/*	var result = {};
	var hashes = uri.split('&');
	for (var i = 0, len = hashes.length; i < len; i++) {
		var hash = hashes[i].split('=');
		if (hash[0]) {
			result[hash[0]] = hash[1] || '';
		}
	}
	return result;*/
	
	var result = {};
	var arr = uri.split(/(?:=|&(?=[^&]*=))/);
	for (var i=0, len = arr.length; i < len; i+=2) {
		if(arr[i]) {
			result[arr[i]] = arr[i+1] || '';
		}
	}

	return result;
}

/**
 * get path info
 * 
 * @param path
 * @returns {String}
 */
function pathinfo(path) {
	if ( ! path) {
		return false;
	}
	
	var result = {};
	
	result.url = path;
	
	var lastSlash = path.lastIndexOf('/');
	
	result.url_dirname = path.substring(0, lastSlash);
	
	result.url_extension = path.substr(path.lastIndexOf('.') + 1);
	
	var filename = path.substr(lastSlash + 1);
	
	result.url_filename = filename.substring(0, filename.lastIndexOf('.'));
	
	result.picture = result.url_filename.indexOf('.') > -1 ? result.url_filename.substring(0, result.url_filename.indexOf('.')) + '.' + result.url_extension : result.url_filename + '.' + result.url_extension;
	
	return result;
}

/* ---------------------------------I am separator line--------------------------------------- */

/**
 * convert first char to uppercase
 * 
 * @param str
 * @returns {String}
 */
function firstToUpper(str) {
	if( ! str) return;
	str = str.replace(/\b\w+\b/g, function(word){
        return word.substring(0,1).toUpperCase() + word.substring(1);
    });
	return str;
}

/**
 * Validate email address
 * 
 * @param email
 * @returns {Boolean}
 */
function validEmail(email) {
	var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
	return regex.test(email);
}

/**
* 图片头数据加载就绪事件 - 更快获取图片尺寸
* @version 2011.05.27
* @param   {String}    图片路径
* @param   {Function}  尺寸就绪
* @param   {Function}  加载完毕 (可选)
* @param   {Function}  加载错误 (可选)
* @example imgReady(imgurl, function () {
     alert('size ready: width=' + this.width + '; height=' + this.height);
 });
*/
var imgReady = (function () {
 var list = [], intervalId = null,

 // 用来执行队列
 tick = function () {
     var i = 0;
     for (; i < list.length; i++) {
         list[i].end ? list.splice(i--, 1) : list[i]();
     };
     !list.length && stop();
 },

 // 停止所有定时器队列
 stop = function () {
     clearInterval(intervalId);
     intervalId = null;
 };

 return function (url, ready, load, error) {
     var onready, width, height, newWidth, newHeight,
         img = new Image();

     img.src = url;

     // 如果图片被缓存，则直接返回缓存数据
     if (img.complete) {
         ready.call(img);
         load && load.call(img);
         return;
     };

     width = img.width;
     height = img.height;

     // 加载错误后的事件
     img.onerror = function () {
         error && error.call(img);
         onready.end = true;
         img = img.onload = img.onerror = null;
     };

     // 图片尺寸就绪
     onready = function () {
         newWidth = img.width;
         newHeight = img.height;
         if (newWidth !== width || newHeight !== height ||
             // 如果图片已经在其他地方加载可使用面积检测
             newWidth * newHeight > 1024
         ) {
             ready.call(img);
             onready.end = true;
         };
     };
     onready();

     // 完全加载完毕的事件
     img.onload = function () {
         // onload在定时器时间差范围内可能比onready快
         // 这里进行检查并保证onready优先执行
         !onready.end && onready();

         load && load.call(img);

         // IE gif动画会循环执行onload，置空onload即可
         img = img.onload = img.onerror = null;
     };

     // 加入队列中定期执行
     if (!onready.end) {
         list.push(onready);
         // 无论何时只允许出现一个定时器，减少浏览器性能损耗
         if (intervalId === null) intervalId = setInterval(tick, 40);
     };
 };
})();

/**
 * get random indexes
 * 依赖jQuery $.inArray
 */
function randomIndexes(min, max, len) {
	min = min || 0;
	len = len || max - min;
	if (len > max - min) len = max - min;
	
	var indexes = [];
	while (indexes.length < len) {
		var index = Math.floor(Math.random() * max + min);
		if ($.inArray(index, indexes) == -1) {
			indexes.push(index);
		}
	}
	return indexes;
}

/**
 * get days diff
 * 
 * @param datetime1
 * @param datetime2
 * @returns
 */
function diffDay(datetime1, datetime2){
	var dateStr = datetime1;
	if(datetime1.date && datetime1.timezone){
		dateStr = (datetime1.date || "").replace(/ /g,"T") + datetime1.timezone;
	}
	var date1 = new Date(dateStr);
	// fix ie6 NaN error
	if(isNaN(date1)) date1 = new Date((datetime1.date || "").replace(/-/g,"/") + ' UTC');
	var date2 = datetime2 ? new Date(datetime2) : new Date();
	var diff = (date1.getTime() - date2.getTime()) / 1000;
	var day_diff = Math.floor(diff / 86400);
	return day_diff;
}

/**
 * get minute diff
 * 
 * @param datetime1 (curr time)
 * @param datetime2 (last time)
 * @returns
 */
function diffMinute(datetime1, datetime2) {
	var date1 = convertDate(datetime1);
	var date2 = convertDate(datetime2);
	var diff = (date1.getTime() - date2.getTime()) / 1000;
	var diffMinute = Math.floor(diff / 60);
	return diffMinute;
}

/**
 * convert date
 * 
 * @param datetime
 * @returns {Date}
 */
function convertDate(datetime) {
	var dateStr = datetime;
	if(datetime.date && datetime.timezone){
		// use timezoneJS to convert datetime.date like "2013-07-19 10:35:06"
		var arrDatetime = datetime.date.split(" ");
		var arrDate = arrDatetime[0].split("-");
		var arrTime = arrDatetime[1].split(":");
		var timezoneDate = new timezoneJS.Date(arrDate[0], arrDate[1]-1, arrDate[2], arrTime[0], arrTime[1], arrTime[2], datetime.timezone);
		dateStr = timezoneDate.getTime();
	}
	var date = new Date(dateStr);
	// fix ie6 NaN error 默认使用UTC得出时间不准确？
	if(isNaN(date)) date = new Date((datetime.date || "").replace(/-/g,"/") + ' UTC');
	return date;
}

/**
 * Method to convert date and format
 *
 * @param  {Object} datetime
 * @param  {String} pattern
 *
 * @return {String}
 *
 * @author Jimmy (2013-07-18)
 */
function convertDateFormat (datetime, pattern) {
	var pattern = pattern || 'yyyy-mm-dd HH:MM:ss';
	return convertDate(datetime).format(pattern);
}

/**
 * Method to serialize object
 * 
 * remove null property for form post
 * 
 * @param obj
 */
function serializeObject(obj){
	if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
		throw new TypeError('serializeObject called on non-object');
	}
	
	var hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !({
		toString : null
	}).propertyIsEnumerable('toString'), dontEnums = [ 'toString',
			'toLocaleString', 'valueOf', 'hasOwnProperty', 'isPrototypeOf',
			'propertyIsEnumerable', 'constructor' ], dontEnumsLength = dontEnums.length

	for ( var prop in obj) {
		if (hasOwnProperty.call(obj, prop)) {
			if (obj[prop] === null) {
				delete obj[prop];
			} else if (typeof obj[prop] == 'object') {
				serializeObject(obj[prop]);
			}
		}
	}
	
    return obj;
}

/**
 * Method to cut string
 * 
 * @param str
 * @param len
 * 
 * @returns string
 */
function str_len(str, len) {
	return str && str.length > len ? str.substr(0, len - 2) + '...' : str;
}

/**
 * Method to check if http url
 * 
 * @param url
 * 
 * @return {Boolean}
 */
function isHttp(url){
	if( url.match( /^https?:\/\/.*/i) ){
        return true ;
    }

	return false ;
}