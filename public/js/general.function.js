function set_cookie ( name, value, exp_y, exp_m, exp_d, path, domain, secure ){
  var cookie_string = name + "=" + escape ( value );

  if (exp_y){
    var expires = new Date ( exp_y, exp_m, exp_d );
    cookie_string += "; expires=" + expires.toGMTString();
  }

  if (path){
      cookie_string += "; path=" + escape ( path );
  }
  if (domain){
      cookie_string += "; domain=" + escape ( domain );
  }
  if (secure){
      cookie_string += "; secure";
  }

  document.cookie = cookie_string;
}

function get_cookie(cookie_name){
  var results = document.cookie.match(cookie_name + '=(.*?)(;|$)');
  if(results){
      return (unescape(results[1]));
  }else{
      return null;
  }
}

function delete_cookie( cookie_name ){
  var cookie_date = new Date ( );  // current date & time
  cookie_date.setTime ( cookie_date.getTime() - 1 );
  document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
}

function changeEditorSize(bFlag,sID){
	var editor=document.getElementById(sID);
	var h=parseInt(editor.height);
	if((!bFlag) && (h<=100)){
	    return ;
	}
	h=bFlag?(h+100):(h-100);
	editor.height=h+'px';
}

function changTextareaSize(bFlag,sID){
	var editor=document.getElementById(sID);

	var h = 0 ;
	if(editor.style.height == ''){
		h = editor.style.height ;
	}else{
		h = parseInt(editor.style.height) ;
	}

	if((!bFlag) && (h<=100)){
	    return ;
	}
	h=bFlag?(h+100):(h-100);
	editor.style.height=h+'px';
}

function checkAllBox(obj,sName){
    if(obj.checked == true){
        selectAllBox(sName) ;
    }else{
        clearAllBox(sName) ;
    }
}
function selectAllBox(sName){
	var i=0;
	var checkBox=document.getElementsByName(sName);
	for(i=0;i<checkBox.length;i++){
		checkBox[i].checked = true;
	}
}

function clearAllBox(sName){
	var i=0;
	var checkBox=document.getElementsByName(sName);
	for(i=0;i<checkBox.length;i++){
		checkBox[i].checked = false;
	}
}

function disableAllBox(sName){
	var i=0;
	var checkBox=document.getElementsByName(sName);
	for(i=0;i<checkBox.length;i++){
		checkBox[i].disabled = true;
	}
}

function enableAllBox(sName){
	var i=0;
	var checkBox=document.getElementsByName(sName);
	for(i=0;i<checkBox.length;i++){
		checkBox[i].disabled = false;
	}
}

function getCheckedBox(sName){
	var n=0;
	var checkBox=document.getElementsByName(sName);
	for(i=0;i<checkBox.length;i++){
		checkBox[i].checked?(n++):n;
	}
	return n;
}

function popup_window(url, width, height){
	var iTop  = (window.screen.height - height) / 2;
	var iLeft = (window.screen.width - width) / 2;
	window.open(url,"Popup","scrollbars=yes,alwaysRaised=yes,toolbar=no,location=0,status=0,direction=no,resizable=0 nor resizable=false,Width="+width+",Height="+height+",top="+iTop+",left="+iLeft) ;
}

function input_number(e){
    var keyCode;
    var evt;
    if(isIE()){
        keyCode = window.event.keyCode;
        evt = window.event;
    }else{
        keyCode = e.which;
        evt = e;
    }
	if (keyCode<48 || keyCode>57){
        if(isIE()){
		    evt.returnValue=false ;
        }else{
            evt.preventDefault();
        }
	}
}

function is_empty(value){
	if( value == '' || value == null || value == 0 || value == false){
		return true ;
	}

	return false ;
}

function is_email(value){
	if( value.match( /^[A-z0-9-_\.]+@[A-z0-9-_\.]+$/i ) ){
        return true ;
    }

	return false ;
}

function is_http(value){
	if( value.match( /^http:\/\/.*/i) ){
        return true ;
    }

	return false ;
}

function get_browser_language(){
	var lang = navigator.language || navigator.browserLanguage ;

	return lang.toLowerCase() ;
}

function isIE(){
	var isIE = (document.all && window.ActiveXObject && !window.opera) ? true : false;

	return isIE ;
}

function getScrollHeight(){
	return document.documentElement.scrollTop + document.body.scrollTop ;
}

function getScrollWidth(){
	return document.documentElement.scrollLeft + document.body.scrollLeft ;
}

function getDocumentHeight(){
    if(jQuery.browser.msie){
        return document.compatMode == "CSS1Compat" ? document.documentElement.clientHeight : document.body.clientHeight;
    }else{
        return self.innerHeight;
    }
}

function getDocumentWidth (){
    if(jQuery.browser.msie){
        return document.compatMode == "CSS1Compat" ? document.documentElement.clientWidth : document.body.clientWidth;
    }else{
        return self.innerWidth;
    }
}

function inArray(element, array){
	for(var i=0;i<array.length;i++){
		if(element == array[i]){
			return true ;
		}
	}

	return false ;
}

function userIdInArray(user_id, array){
	for(i in array){
		if(user_id == i){
			return true ;
		}
	}

	return false ;
}

function getIntersect(obj1, obj2, sizeLimit){
	if(sizeLimit == undefined) sizeLimit = 3;
	var result = [] ;
	var k = 0;
	for(id in obj1){
		if(obj2[id]){
			result.push({id: id, full_name: obj2[id]});
			k++;
			if(sizeLimit > 0 && k > sizeLimit) break;
		}
	}
	return result ;
}

function getIntersectSize(obj1, obj2){
	var k = 0 ;
	for(id in obj1){
		if(obj2[id]){
			k++;
		}
	}
	return k ;
}


function pathUserUpload(user_id)
{
	var len = (''+user_id).length;
	var padding = new Array(parseInt(13) - parseInt(len)).join('0');
	user_id = padding + user_id;
	var step = 0;
	var level = [];
	while(step < 12){
		level.push(user_id.substr(step, 4));
		step += 4;
	}

	return 'uploads/user/' + level.join('/') + '/';
}

function urlThumbnail(user_id, width, height)
{
	if(!height) height = width;
	return pathUserUpload(user_id) + "profile/thumbnail." + width + "_" + height + ".jpg?" + RndNum('10');
}

function pathAppUpload(app_name, app_id)
{
	var len = (''+app_id).length;
	var padding = new Array(parseInt(13) - parseInt(len)).join('0');
	app_id = padding + app_id;
	var step = 0;
	var level = [];
	while(step < 12){
		level.push(app_id.substr(step, 4));
		step += 4;
	}

	return 'uploads/' + app_name + '/' + level.join('/') + '/';
}

function urlAppLogo(app_name, app_id, width)
{
	return pathAppUpload(app_name, app_id) + app_name + "_logo." + width + "_" + width + ".jpg?" + RndNum('10');
}

function urlProductPicture(pictures, width, height)
{
	if(!height) height = width;
	if(!is_empty(pictures))
	{
		if(width){
			return pictures.url_dirname + "/" + pictures.url_filename + "." + width + "_" + height + "." + pictures.url_extension;
		}else {
			return pictures.url_dirname + "/" + pictures.url_filename + "." + pictures.url_extension;
		}
	}
	else
	{
		return "images/no_picture.gif";
	}
}

function getCurrentPageName(){
	var strUrl=window.location.href;
	var arrUrl=strUrl.split("/");

	return arrUrl[arrUrl.length-1];
}

function showDialog(message, redirect, dissapear, footnote)
{
	var messageDialog = $("#jtmpl_show_dialog").tmpl({message:message, dissapear:dissapear, footnote:footnote});

	messageDialog.find('#f_ok').click(function(e){
		e.preventDefault();

		if(!is_empty(redirect))
		{
			window.location.href = redirect;
			return false;
		}
		messageDialog.dialog('close');
	});

	if(dissapear)
	{
		setTimeout(function(){messageDialog.dialog('close');}, 1500);
	}

//alert(debug(buttons));
	messageDialog.dialog({
		dialogClass : 'dialog-no-title dialog-content',
		modal: true,
		resizable: false,
		close: function(){messageDialog.remove();}
	});
}

function hideDialog()
{
	$('#show_dialog').remove();
	$('#show_dialog').dialog("close");
}

function scrollUp(){
	$(window).scrollTop(0);
}

function iFrameHeight(current, name) {
	var ifm = current;
	//var ifm= document.getElementById("iframepage");
	var subWeb = document.frames ? document.frames[name].document : ifm.contentDocument;
	if(ifm != null && subWeb != null) {
	   ifm.height = subWeb.body.scrollHeight;
	}
}

// Below copied from http://stackoverflow.com/questions/143847/best-way-to-find-an-item-in-a-javascript-array
if (!Array.prototype.indexOf){

	Array.prototype.indexOf = function(searchElement){

		"use strict";

		if (this === void 0 || this === null) throw new TypeError();

		var t = Object(this);
		var len = t.length >>> 0;
		if (len === 0) return -1;

		var n = 0;
		if (arguments.length > 0){
			n = Number(arguments[1]);
			if (n !== n)
				n = 0;
			else if (n !== 0 && n !== (1 / 0) && n !== -(1 / 0))
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
		}

		if (n >= len) return -1;

		var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);

		for (; k < len; k++){
			if (k in t && t[k] === searchElement) return k;
		}
		return -1;
	};

}

function dateDiff(date1, date2){
	var d1 = new Date((date1.date || "").replace(/-/g,"/") + ' ' + date1.timezone);
	var d2 = new Date((date2.date || "").replace(/-/g,"/") + ' ' + date2.timezone);

	return d1.getTime() - d2.getTime();
}

function ucFirst(str)
{
	if(!is_empty(str))
	{
		return (str.substring(0,1).toUpperCase()) + (str.substring(1));
	}
	else
	{
		return null;
	}
}

function firstToUpper(str){
	if(!str) return;
	str = str.replace(/\b\w+\b/g, function(word){
        return word.substring(0,1).toUpperCase() +
               word.substring(1);
    });
	return str;
}

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

function RndNum(n){
	var rnd="";
	for(var i=0;i<n;i++)
	rnd+=Math.floor(Math.random()*10);
	return rnd;
}

function parseStr(s) {
	var rv = {}, decode = window.decodeURIComponent || window.unescape;
	(s == null ? location.search : s).replace(/^[?#]/, "").replace(
    /([^=&]*?)((?:\[\])?)(?:=([^&]*))?(?=&|$)/g,
    function ($, n, arr, v) {
      if (n == "")
        return;
      n = decode(n);
      v = decode(v);
      if (arr) {
        if (typeof rv[n] == "object")
          rv[n].push(v);
        else
          rv[n] = [v];
      } else {
        rv[n] = v;
      }
    });
  	return rv;
}

function http_build_query(var_arr, key_prefix, key_suffix){
	var str = "";
	// loop over the var_arr;
	for(key in var_arr){
	// add a variable separator if it is not the first key
	if( str.length ) str += "&";
	// if var_arr[key] is an Object, recurrse
	if( var_arr[key] instanceof Object ){
	 // if there is not prefix/suffix, set them to "" by default
	 if( !key_prefix ) key_prefix = "";
	 if( !key_suffix ) key_suffix = "";
	 // call the same function
	 str += http_build_query(var_arr[key], key_prefix + key +"[", "]" + key_suffix);
	}else{
	 // build the string to encode this variable
	 str += key_prefix + escape(key) + key_suffix + "=" + escape(var_arr[key]);
	}
	}
	// return the just built string
	return str;
}

function is_numeric (mixed_var) {
    return (typeof(mixed_var) === 'number' || typeof(mixed_var) === 'string') && mixed_var !== '' && !isNaN(mixed_var);
}

function inText(text, var_arr)
{
	if(is_array(var_arr) === false)
	{
		var var_arr = new Array(var_arr);
	}

	for(i=0; i<var_arr.length; i++)
	{
		if(text.indexOf(var_arr[i]) >= 0)
		{
			return true;
		}
	}

	return false;
}

function is_array(str)
{
	return Object.prototype.toString.apply(str) === '[object Array]';
}

/**
 * 对Date的扩展，将 Date 转化为指定格式的String
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
 * eg:
 * (new Date()).pattern("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
 * (new Date()).pattern("yyyy-MM-dd E HH:mm:ss") ==> 2009-03-10 二 20:09:04
 * (new Date()).pattern("yyyy-MM-dd EE hh:mm:ss") ==> 2009-03-10 周二 08:09:04
 * (new Date()).pattern("yyyy-MM-dd EEE hh:mm:ss") ==> 2009-03-10 星期二 08:09:04
 * (new Date()).pattern("yyyy-M-d h:m:s.S") ==> 2006-7-2 8:9:4.18
 */

Date.prototype.pattern=function(fmt) {
    var o = {
    "M+" : this.getMonth()+1, //月份
    "d+" : this.getDate(), //日
    "h+" : this.getHours()%12 == 0 ? 12 : this.getHours()%12, //小时
    "H+" : this.getHours(), //小时
    "m+" : this.getMinutes(), //分
    "s+" : this.getSeconds(), //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S" : this.getMilliseconds() //毫秒
    };
    var week = {
    "0" : "\u65e5",
    "1" : "\u4e00",
    "2" : "\u4e8c",
    "3" : "\u4e09",
    "4" : "\u56db",
    "5" : "\u4e94",
    "6" : "\u516d"
    };
    if(/(y+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    if(/(E+)/.test(fmt)){
        fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "\u661f\u671f" : "\u5468") : "")+week[this.getDay()+""]);
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}

function str_len(str, len){
	return str && str.length > len ? str.substr(0, len) + '...' : str;
}

/**
 * Method to save user actions
 * @param type
 * @param user_id
 * @param value
 * @param target_id
 * @param callback
 */
function saveUserActions(type, user_id, value, target_id, callback){
	if(is_empty(type)) return;
	if(is_empty(user_id)) user_id = 0;
	if(is_empty(value)) value = '';
	if(is_empty(target_id)) target_id = '';
	var url = callback ? 'user/dashboard/save_actions/true' : 'user/dashboard/save_actions';
	$.post(url, {type:type, user_id:user_id, value:value, target_id:target_id}, function(data){
		if(callback) callback(data);
	});
}

// public site save user actions
function savePublicUserActions(type, user_id, value, target_id, callback){
	if(is_empty(type)) return;
	if(is_empty(user_id)) user_id = '';
	if(is_empty(value)) value = '';
	if(is_empty(target_id)) target_id = '';
	var url = callback ? 'public/user/save_actions/true' : 'public/user/save_actions';
	$.post(url, {type:type, user_id:user_id, value:value, target_id:target_id}, function(data){
		if(callback) callback(data);
	});
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