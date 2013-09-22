/*
 * Put all the helper functions here.
 */

/* ---------------------------------I am separator line--------------------------------------- */

/**
 * Method to get id level
 *
 * @param  int id
 * @return string
 *
 * @author Jimmy (2013-04-15)
 */
function idLevel(id) {
	var len = ('' + id).length;
	var padding = new Array(parseInt(13) - parseInt(len)).join('0');
	id = padding + id;
	var step = 0;
	var level = [];
	while (step < 12) {
		level.push(id.substr(step, 4));
		step += 4;
	}
	return level.join('/');
}

/**
 * Method to get s3 static folder path
 *
 * @param int id
 * @param string baseFolder
 * @param string subFolder
 * @return string
 *
 * @author Jimmy (2013-04-15)
 */
function pathStaticS3(id, baseFolder, subFolder) {
	var path = '';
	path += baseFolder + '/';
	path += idLevel(id) + '/';
	if (subFolder) {
		path += subFolder + '/';
	}
	return path;
}

/**
 * Method to get s3 static image path
 *
 * @param int id
 * @param string baseFolder
 * @param string subFolder
 * @param string filename
 * @param int width
 *
 * @author Jimmy (2013-04-15)
 */
function pathStaticImageS3(id, baseFolder, subFolder, filename, width) {
	var prefix = pathStaticS3(id, baseFolder, subFolder);
	var type = baseFolder + '_' + subFolder;
	var suffix = properImageName(type, filename, width);
	return prefix + suffix;
}

/**
 * Method to get proper image name
 *
 * @param string type
 * @param string filename
 * @param int width
 *
 * @author Jimmy (2013-04-15)
 */
function properImageName(type, filename, width) {
	if (width) {
		width = properImageSize(type, width);
		var path = pathinfo(filename);
		return path.url_filename + '.' + width + '_' + width + '.' + path.url_extension;
	}
	return filename;
}

/**
 * Method to find proper image size
 * eg:
 * enter 55 will return 60 from [40, 50, 60, ...]
 *
 * @param string type
 * @param int width
 * @return int
 *
 * @author Jimmy (2013-04-15)
 */
function properImageSize(type, width) {
	if (RESIZESPECIFICATION) {
		// Fix type may be like 'user_product/123123';
		if ((indexOf = type.indexOf('/')) !== -1) {
			type = type.substring(0, indexOf);
		}
		if (RESIZESPECIFICATION[type]) {
			var min = 0;
			var index = 0;
			$.each(RESIZESPECIFICATION[type], function(key, size){
				if (size == width) {
					index = key;
					return false;
				} else {
					var currentMin = Math.abs(parseInt(size) - parseInt(width));
					if (min == 0 || min > currentMin) {
						min = currentMin;
						index = key;
					}
				}
			});
			width = RESIZESPECIFICATION[type][index];
		}
	}
	return width;
}

/**
 * Method to get s3 static file url
 *
 * @param int userId
 * @param string baseFolder
 * @param string subFolder
 * @param string filename
 * @param int width
 * @param bool random
 *
 * @author Jimmy (2013-04-15)
 */
function urlStaticS3(userId, baseFolder, subFolder, filename, width, random) {
	var url = pathStaticImageS3(userId, baseFolder, subFolder, filename, width);
	if (S3URL) {
		url = S3URL + url;
	}
	return random ? url + '?' + Math.random() : url;
}

// alert(urlStaticS3(45618, 'user', 'profile/1231231', 'thumbnail.jpg', 111, 1));
// alert(pathStaticS3(45618, 'webthumb', '');

/* ------------------------------ The old functions below ------------------------------- */

/**
 * Method to get user upload path
 *
 * @param userId
 */
function pathUserUpload(userId) {
	var len = ('' + userId).length;
	var padding = new Array(parseInt(13) - parseInt(len)).join('0');
	userId = padding + userId;
	var step = 0;
	var level = [];
	while (step < 12) {
		level.push(userId.substr(step, 4));
		step += 4;
	}

	return 'uploads/user/' + level.join('/') + '/';
}

/**
 * Method to get company upload path
 *
 * @param companyId
 */
function pathCompanyUpload(companyId) {
	var len = ('' + companyId).length;
	var padding = new Array(parseInt(13) - parseInt(len)).join('0');
	companyId = padding + companyId;
	var step = 0;
	var level = [];
	while (step < 12) {
		level.push(companyId.substr(step, 4));
		step += 4;
	}

	return 'uploads/company/' + level.join('/') + '/';
}

/**
 * Method to get webthumb upload path
 *
 * @param webthumbId
 */
function pathWebthumbUpload(webthumbId) {
	var len = ('' + webthumbId).length;
	var padding = new Array(parseInt(13) - parseInt(len)).join('0');
	webthumbId = padding + webthumbId;
	var step = 0;
	var level = [];
	while (step < 12) {
		level.push(webthumbId.substr(step, 4));
		step += 4;
	}

	return 'uploads/webthumb/' + level.join('/') + '/';
}

/* ---------------------------------I am separator line--------------------------------------- */


/**
 * Method to get user thumbnail picture url
 *
 * @param userId
 * @param width
 * @param height
 * @returns {String}
 */
function urlThumbnail(userId, width, height) {
	if(!userId) return;
	if( ! height) height = width;
	// var url = pathUserUpload(userId) + "profile/thumbnail." + width + "_" + height + ".jpg";
	// TODO: how to check file type thumbnail.[jpg,jpeg,png,gif]
	var url = urlStaticS3(userId, 'user', 'profile', 'thumbnail.jpg', width);
	// 当前用户每秒使用新的url
	if (CURRENTUSER && userId == CURRENTUSER.id) {
		url += '?' + new Date().getTime();
	}
	return url;
}

/**
 * Method to get user thumbnail picture url
 *
 * @param userId
 * @param width
 * @param height
 * @returns {String}
 */
function urlCompanyLogo(companyId, width, height) {
	if(!companyId) return;
	if( ! height) height = width;
	// var url = pathCompanyUpload(companyId) + "logo/logo." + width + "_" + height + ".jpg";
	// TODO: how to check file type logo.[jpg,jpeg,png,gif]
	var url = urlStaticS3(companyId, 'company', 'logo', 'logo.jpg', width);
	// 当前用户每秒使用新的url
	if (CURRENTUSER && CURRENTUSER.company && companyId == CURRENTUSER.company.id) {
		url += '?' + new Date().getTime();
	}
	return url;
}

/**
 * Method to get webthumb url
 *
 * @param webthumb
 * @param width
 * @param height
 * @returns {String}
 */
function urlWebthumb(webthumb, width, height) {
	if( ! height) height = width;
	if (webthumb) {
		// var dirName = pathWebthumbUpload(webthumb.id);
		var dirName = pathStaticS3(webthumb.id, 'webthumb');
		if (S3URL) {
			dirName = S3URL + dirName;
		}
		var point = webthumb.filename.lastIndexOf(".");
		var filename = webthumb.filename.substr(0, point);
		var extension = webthumb.filename.substr(point + 1);
		return dirName + filename + "." + width + "_" + height + "." + extension;// + '?' + Math.random();
	} else {
		return "uploads/user/images/no_picture." + width + "_" + height + ".gif";
	}
}

/**
 * Method to get user profile page url
 *
 * @param userId
 * @returns {String}
 */
function urlProfile(userId) {
	if(CURRENTUSER.id == userId){
		return '#profile';
	} else {
		return '#search/profiledetail/user_id=' + userId;
	}

}

/**
 * Method to get user product page url
 *
 * @param productId
 * @param userId
 * @returns {String}
 */
function urlProduct(productId, userId) {
	if(CURRENTUSER.id == userId){
		return urlMyProduct(productId);
	} else {
		return '#search/productdetail/id=' + productId;
	}
}

/**
 * Method to get customs shipments page url
 * @param companyId
 */
function urlCustomsSearch(keyword, type){
	var url = '#search/customs';
	if(keyword) url += '/keyword=' + keyword;
	if(type)
	{
		if(keyword)
		{
			url += '&type=' + type;
		}
		else
		{
			url += '/type=' + type;
		}
	}

	return url;
};

/**
 * Method to get customs shipments page url
 * @param companyId
 */
function urlCustomshipments(companyId, Type){
	return '#search/customshipments/type=' + Type + '&id=' + companyId;
};


/**
 * Method to get customs page url
 *
 * @param customsId
 * @returns {String}
 */
function urlCustoms(customsId, keyword) {
	var url = '#search/customsdetail/id=' + customsId;
	if(keyword) url += '&keyword=' + keyword;
	return url;
}

/**
 * Method to get user products page url
 *
 * @param userId
 * @returns {String}
 */
function urlProducts(userId) {
	if(CURRENTUSER.id == userId){
		return '#products';
	} else {
		return '#search/productsdetail/user_id=' + userId;
	}
}

/**
 * Method to get user company page url
 *
 * @param userId
 * @returns {String}
 */
function urlCompany(userId) {
	if(CURRENTUSER.id == userId){
		return '#company';
	} else {
		return '#search/companydetail/user_id=' + userId;
	}
}

/**
 * Method to get user owner product page url
 *
 * @param productId
 * @returns {String}
 */
function urlMyProduct(productId) {
	return '#products/view/id=' + productId;
}

/**
 * Method to get user owner product edit page url
 *
 * @param productId
 * @returns {String}
 */
function urlMyProductEdit(productId) {
	return '#products/edit/id=' + productId;
}
/**
 * Method to get product picture url
 *
 * @param picture {Object}
 * @param width
 * @param height
 * @returns {String}
 */
function urlProductPicture(picture, width, height) {
	// get proper image size
	width = properImageSize('user_product', width);
	height = width; // if( ! height)
	if (picture) {
		var dirName = typeof picture.url_dirname == 'function' ? picture.url_dirname() : picture.url_dirname;
		var filename = typeof picture.url_filename == 'function' ? picture.url_filename() : picture.url_filename;
		var extension = typeof picture.url_extension == 'function' ? picture.url_extension() : picture.url_extension;
		return dirName + "/" + filename + "." + width + "_" + height + "." + extension;// + '?' + Math.random();
	} else {
		return "uploads/user/images/no_picture." + width + "_" + height + ".gif";
	}
}

/**
 * Method to get advertising picture url
 *
 * @param picture {Object}
 * @param width
 * @param height
 * @returns {String}
 */
function urlAdPicture(picture, width, height) {
	// get proper image size
	width = properImageSize('user_ad', width);
	height = width; // if( ! height)
	if (picture) {
		var dirName = typeof picture.url_dirname == 'function' ? picture.url_dirname() : picture.url_dirname;
		var filename = typeof picture.url_filename == 'function' ? picture.url_filename() : picture.url_filename;
		var extension = typeof picture.url_extension == 'function' ? picture.url_extension() : picture.url_extension;
		return dirName + "/" + filename + "." + width + "_" + height + "." + extension;// + '?' + Math.random();
	} else {
		return "uploads/user/images/no_picture." + width + "_" + height + ".gif";
	}
}

/**
 * Method to get shijian picture url
 *
 * @param picture {Object}
 * @param width
 * @param height
 * @returns {String}
 */
function urlShijianPicture(picture, width, height) {
	if( ! height) height = width;
	if (picture) {
		var dirName = typeof picture.url_dirname == 'function' ? picture.url_dirname() : picture.url_dirname;
		var filename = typeof picture.url_filename == 'function' ? picture.url_filename() : picture.url_filename;
		var extension = typeof picture.url_extension == 'function' ? picture.url_extension() : picture.url_extension;
		return dirName + "/" + filename + "." + width + "_" + height + "." + extension;// + '?' + Math.random();
	} else {
		return "uploads/user/images/no_picture." + width + "_" + height + ".gif";
	}
}

/**
 * Method to write reference to user
 *
 * @param userId
 * @returns {String}
 */
function urlReference(userId) {
	return '#search/writereference/id=' + userId;
}

/**
 * Method to request reference from contacts
 *
 * @returns {String}
 */
function urlRequestReference() {
	return '#profile/request_reference';
}

/**
 * Method to inquire product
 *
 * @param productId
 * @param userId
 * @returns {String}
 */
function urlInquireProduct(productId, userId) {
	if(userId == CURRENTUSER.id) {
		return 'javascript:void(0);';
	} else {
		return '#search/inquireproduct/id=' + productId;
	}
}

/**
 * Method to get send message url
 *
 * @param userId
 * @returns {String}
 */
function urlSendMessage(userId, target) {
	return '#search/sendmessage/user_id=' + userId + '&target=' + target;
}

/**
 * Method to send user
 *
 * @param userId
 * @returns {String}
 */
function urlInquireUser(userId) {
	return '#search/inquireuser/user_id=' + userId;
}

/**
 * Method to connect user
 *
 * @param userId
 * @returns {String}
 */
function urlConnect(userId) {
	return '#search/connect/id=' + userId;
}

/**
 * Url add ratings
 *
 * @param userId
 * @returns {String}
 */
function urlAddRating(userId) {
	if(userId == CURRENTUSER.id) {
		return 'javascript:void(0);';
	} else {
		return '#reviews/default/' + userId;
	}
}

/**
 * Method to get user ratings page url
 *
 * @param userId
 * @returns {String}
 */
function urlRating(userId) {
	if(userId == CURRENTUSER.id) {
		return 'javascript:void(0);';
	} else {
		return '#search/ratings/user_id=' + userId;
	}
}

/**
 * Url import connections
 *
 * @returns {String}
 */
function urlImportConnections() {
	return '#profile/import_contacts';
}

/**
 * Url product newsletter
 *
 * @returns {String}
 */
function urlProductNewsletter(productId) {
	return '#products/newsletter' + (productId ? '/' + productId : '');
}

/**
 * Url add product
 *
 * @returns {String}
 */
function urlAddProduct() {
	return '#products/add';
}

/**
 * Url edit profile
 *
 * @returns {String}
 */
function urlEditProfile() {
	return '#profile/edit';
}

/**
 * Url add advertising
 *
 *
 */
function urlAddAdvertising(){
	return '#advertising/createad';
}

/**
 * Url share profile
 *
 * @returns {String}
 */
function urlShareProfile() {
	return '#profile/share';
}

/**
 * Url message detail
 *
 * @returns {String}
 */
function urlMessagesDetail(id) {
	return '#messages/detail/' + id;
}

/**
 * Public product url
 *
 * @param productName
 * @param productId
 * @returns {String}
 */
function publicProductUrl(productName, productId) {
	return BASEURL + "products/" + productId + "/" + productName + "-manufacturers";
}

/**
 * Public user url
 *
 * @param userId
 * @returns {String}
 */
function publicUserUrl(userId) {
	return BASEURL + "users/" + userId + '/preview';
}

/**
 * Url view public profile
 *
 * @returns {String}
 */
function urlViewPublicProfile(data, event) {
	// check if user's progress < 25, can't be found from public site
	if (CURRENTUSER && CURRENTUSER.progress && CURRENTUSER.progress < 25) {
		appViewModel.confirm("<?php echo lang('sorry,_you_do_not_have_enough_information_on_your_profile_to_be_shown_publicly.')?>", "<?php echo lang('improve_your_profile_now!')?>", function(){
			app.setLocation(urlEditProfile());
		});
		return;
	}

	var left = (screen.width / 2) - 400;
	var top = (screen.height / 2) - 250;

	// set stop redirect in cookie: js/jquery.treeview/lib/jquery.cookie.js
	$.cookie('stop_redirect', true, { path: '/' });

	window.open(BASEURL + "users/" + ko.utils.unwrapObservable(data.id) + '/preview',
		"",
		"height=600, width=800, left=" + left + ", top=" + top + " toolbar=no, menubar=no, scrollbars=no, resizable=no,location=no, status=yes");
}

/**
 * Method to get user event page url
 *
 * @param eventId
 * @returns {String}
 */
function urlMyEvent(eventId) {
	if(!eventId){
		return '#event';
	} else {
		return '#event/view/id=' + eventId;
	}

}

/**
 * Method to get search user one event page url
 *
 * @param eventId
 * @returns {String}
 */
function urlEvent(eventId) {
	if(!eventId){
		return '#event';
	} else {
		return '#search/eventdetail/id=' + eventId;
	}

}

/**
 * Method to get css name based on type
 *
 * @string type
 * @returns {String}
 */
function SocialIconCss(type) {
	switch(type) {
		case 'wei_xin' :
			type = 'weichat';
			break;
		case 'personal_website' :
			type = 'globe'
			break;
		case 'other_website' :
			type = 'globe'
			break;
		case 'other' :
			type = 'globe'
			break;
		default:
			break;
	}

	var chineseSocial = new Array("qq", "qmail", "qzone", "weichat", "penyou", "xing", "sohu",
			"renren", "weibo", "meilishuo", "douban", "foxmail", "wanyiweibo", "wanyimail", "ali",
			"youku", "tudou", "tudou", "gmail", "xing", "foxmail", "outlook");

	if ($.inArray(type, chineseSocial) != '-1') {
		// For Chinese Social network icons
		return "icon-chinasocial-" + type;
	} else {
		// For Foreign social network icons
		return "icon-" + type;
	}

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
	if(!type) return;
	if(!user_id) user_id = 0;
	if(!value) value = '';
	if(!target_id) target_id = '';
	var url = callback ? 'user/dashboard/save_actions/true' : 'user/dashboard/save_actions';
	$.post(url, {type:type, user_id:user_id, value:value, target_id:target_id}, function(data){
		if(callback) callback(data);
	});
}

/**
 * 替换字符串中所有url为链接
 * @param string $text
 *
 * Author：shaquille
 * Creation Time：2012-11-23
 */
function replaceUrl(text){
	// 反向否定预查，非://www.格式的链接替换为http://www.
//	var str = text.replace(/(?<!\:\/\/)www\./, "http://www.");
	// The Regular Expression filter
	var regExp = /(((http|https|ftp|ftps)\:\/\/|www\.)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?)/g;
	// make the urls hyper links
	var str = text.replace(regExp, '<a href="$1" rel="nofollow" target="_blank">$1</a>');

	return str.replace(/href="www./g, 'href="http://www.');
}

/**
 * 获取字符串中所有url地址
 * @param string $text
 *
 * Author：shaquille
 * Creation Time：2012-11-23
 */
function text2urls(text){
	// 反向否定预查，非://www.格式的链接替换为http://www.
//	var str = text.replace(/(?<!\:\/\/)www\./, "http://www.");
	// The Regular Expression filter
	var regExp = /((http|https|ftp|ftps)\:\/\/|www\.)[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?/g;
	// Check if there is a url in the text
	var arr = text.match(regExp);

	if(arr){
		return arr;
	} else {
		return false;
	}
}

/**
 * 获取字符串中ip地址
 * @param string $text
 *
 * Author：shaquille
 * Creation Time：2012-11-22
 */
function text2ip(text){
	//ip pattern

	var regExp = /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/;

	var arr = text.match(regExp);

	// Check if there is a ip in the text
	if(arr){
		return arr;
	} else {
		// if no urls in the text just return false
		return false;
	}
}

//高亮显示搜索到的关键字
function highLight(ele,keys)
{
	var reg = new RegExp("(" + keys.replace(/[^A-Za-z0-9]/g,"|") + ")","gi");

	ele.innerHTML = ele.innerHTML.replace(reg,"<span class='keyword-highlight'>$1</span>");
}

/**
 * Method to set popover placement
 * 根据当前元素相对于浏览器文档的偏移距离，容器宽高来计算上下左右位置显示
 *
 * @param $element // clicked element jquery object
 * @param $container // content template jquery object
 * @param placement
 */
function setPopoverPlacement($element, $container, placement) {
	// get offset
	var top = $element.offset().top;
	var left = $element.offset().left;
	// set default placement
	var placement = placement || 'bottom';
	// auto check proper placement
	if (placement == 'auto') {
		var $window = $(window);
		if (($window.height() + $window.scrollTop()) >
			(top + $element.outerHeight() + $container.outerHeight())
			&& left > ($container.outerWidth() / 2 - $element.outerWidth() / 2)
			&& ($window.width() + $window.scrollLeft()) >
			(left + $element.outerWidth() / 2 + $container.outerWidth() / 2)) {
			 // bottom 底部足够高，左侧足够宽，右侧足够宽
			placement = 'bottom';
		} else if (($window.height() + $window.scrollTop())
			> (top + $element.outerHeight() / 2 + $container.outerHeight() / 2)
			&& (left) > ($container.outerWidth() + $element.outerWidth() -
				$element.width())) {
			// left 底部足够高，左侧足够宽
			placement = 'left';
		} else if ((top - $window.scrollTop()) >
			($element.innerHeight() / 2 + $container.outerHeight())
			&& left > ($container.outerWidth() / 2 - $element.outerWidth() / 2)
			&& ($window.width() + $window.scrollLeft()) >
			(left + $element.outerWidth() / 2 + $container.outerWidth() / 2)) {
			// top 顶部足够高，左侧足够宽，右侧足够宽
			placement = 'top';
		} else if (($window.height() + $window.scrollTop()) >
			(top + $element.outerHeight() / 2 + $container.outerHeight() / 2)
			&& ($window.width() + $window.scrollLeft()) >
			(left + $container.outerWidth())) {
			// right 底部足够高，右侧足够宽
			placement = 'right';
		}
	}
	// compute the offset
	switch(placement){
		case 'left':
			top += $element.outerHeight() / 2;
			top -= $container.outerHeight() / 2;
			left -= $container.outerWidth();
			left -= ($element.outerWidth() - $element.width()) / 2;
			// TODO: why need to remove element's border width?
			// does default offset left hasn't contain the border width?
			left -= $element.outerWidth() - $element.innerWidth();
			break;
		case 'right':
			top += $element.outerHeight() / 2;
			top -= $container.outerHeight() / 2;
			left += $element.outerWidth();
			break;
		case 'top':
			// TODO: why need to remove half innerHeight of the element? pandding width?
			top -= $element.innerHeight() / 2;
			top -= $container.outerHeight();
			left += $element.outerWidth() / 2;
			left -= $container.outerWidth() / 2;
			break;
		case 'bottom':
		default:
			placement = 'bottom'; // fix default
			top += $element.outerHeight();
			left += $element.outerWidth() / 2;
			left -= $container.outerWidth() / 2;
			break;
	}
	// add class
	if (placement !== 'auto' && ! $container.hasClass(placement)) {
		// clear then add class
		$container.removeClass('bottom left top right').addClass(placement);
	}
	// set offset
	$container.attr('style', 'top: '+top+'px; left: '+left+'px; display: block;');
}

/**
 * Method to check user email type
 *
 * @param  string email
 * @return string|null
 *
 * @author Jimmy (2013-04-22)
 */
function checkImportEmailType(email) {
	var type = null;
	if (email) {
		if (email.search(/@gmail.com/i) !== -1) {
			type = 'gmail';
		} else if (email.indexOf('@yahoo.') != -1) { // .com.[cn, tw,in,ca?]
			type = 'yahoo';
		} else if (email.indexOf('@qq.com') != -1) {
			type = 'qq';
		} else if (email.indexOf('@126.com') != -1) {
			type = '126';
		} else if (email.indexOf('@sohu.com') != -1) {
			type = 'sohu';
		}
	}
	return type;
}