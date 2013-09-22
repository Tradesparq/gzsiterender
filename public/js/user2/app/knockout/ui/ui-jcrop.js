/**
 * This is a ko ui with jquery jcrop.
 *
 * @depend
 * 		js/jquery.jcrop/css/jquery.Jcrop.min.css
 * 		js/jquery.jcrop/js/jquery.Jcrop.min.js
 *
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.jcrop = {
    update: function (element, valueAccessor, allBindings, viewModel) {

		if (valueAccessor().data && valueAccessor().data.crop()) {

			var $element = $(element);

			var workWidth = valueAccessor().workWidth || 350;
			var workHeight = valueAccessor().workHeight || 350;
			var workAspectRatio = workWidth / workHeight;

			// TODO: 新添加的图片要给一个默认值crop
			// var crop = eval(valueAccessor().data.crop());
			// ie9下出现array数据结构
			var crop;
			if (valueAccessor().data.crop() instanceof Array) {
				crop = valueAccessor().data.crop();
			} else {
				crop = $.parseJSON(valueAccessor().data.crop());
			}
			var x = crop[0];
			var y = crop[1];
			var w = crop[2];
			var h = crop[3];
			var ow = crop[4];
			var oh = crop[5];
			var ratio = (ow / oh > workAspectRatio) ? workWidth / ow : workHeight / oh;
			// TODO: 缩放部分如何更好的方式来实现？
			$element.parents('div.cropbox').eq(0).css('margin-left', (workWidth - ow * ratio) / 2).css('margin-top', (workHeight - oh * ratio) / 2);
			$element.parents('div.cropmask').eq(0).css('margin-left', 0).css('margin-top', 0);
			$element.css('height', oh * ratio).css('width', ow * ratio);

			/**
			 * Update preview
			 * @param obj c
			 */
			var updatePreview = function(c) {
				if (parseInt(c.w) > 0) {
					var $pcnt = $('div.preview-pane .preview-container');
			        var xsize = $pcnt.width();
			        var ysize = $pcnt.height();
					var rx = xsize / c.w;
					var ry = ysize / c.h;
					$('img#imgPreview').css({
						width: Math.round(rx * 350) + 'px',
						height: Math.round(ry * 350) + 'px',
						marginLeft: '-' + Math.round(rx * c.x) + 'px',
						marginTop: '-' + Math.round(ry * c.y) + 'px'
					});
				}
			};

			// 延时防止太快crop
			setTimeout(function() {
				$element.Jcrop({
					// FIX the focus move bug
					fixedSupport: false,
					// bgFade: true,
					// bgOpacity: 0.8,
					aspectRatio: 1,
					setSelect: [x * ratio, y * ratio, x * ratio + w * ratio, y * ratio + h * ratio],
					// addClass: 'jcrop-dark', // jcrop-light
					// bgColor: 'yellow',
					onChange: valueAccessor().onChange || updatePreview,
					onSelect: valueAccessor().onSelect || function(coords) {
						if (parseInt(coords.w) > 0) {
							var newCrop = '[' + Math.round(coords.x / ratio) + ', ' + Math.round(coords.y / ratio) + ', ' + Math.round(coords.w / ratio) + ', ' + Math.round(coords.h / ratio) + ', ' + ow + ', ' + oh + ']';
							valueAccessor().data.crop(newCrop);
						}
					}
				});
			}, 0);
		}
    }
};