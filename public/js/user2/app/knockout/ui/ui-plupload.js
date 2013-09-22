/**
 * This is a ko ui with jquery plupload.
 *
 * @depend
 * 		js/jquery.plupload/jquery.ui.plupload/css/jquery.ui.plupload.css
 * 		js/jquery.plupload/plupload.full.js
 *
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.plupload = {
    update: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);
		// defined uploader
		var uploader = new plupload.Uploader({
			runtimes : 'gears,html5,flash,silverlight,browserplus',
			browse_button : $element.attr('id'),
			container : 'container' + valueAccessor().index,
			max_file_size : '2mb',
			url : valueAccessor().uploadUrl || BASEURL + 'user/upload',
			flash_swf_url : BASEURL + 'js/jquery.plupload/plupload.flash.swf',
			silverlight_xap_url : BASEURL + 'js/jquery.plupload/plupload.silverlight.xap',
			filters : [
	           	{title : "Image files", extensions : "jpg,gif,png,jpeg"},
	           	{title : "Zip files", extensions : "zip"}
           	]
//			multipart: false
//			resize : {width : 320, height : 240, quality : 90}
		});
		// binding click
		if (valueAccessor().startButton) {
			$(valueAccessor().startButton).click(function(e) {
    			uploader.start();
    			e.preventDefault();
    		});
		}

		// init *** for auto uploading, this must before the below binding codes ***
		uploader.init();

		// binding init
		uploader.bind('Init', valueAccessor().init || function(up, params) {
//			$('#filelist' + valueAccessor().index).html("<div>Current runtime: " + params.runtime + "</div>");
		});
		// binding filesAdded
		uploader.bind('FilesAdded', valueAccessor().filesAdded || function(up, files) {
			if (files.length > valueAccessor().max - valueAccessor().index) {
//				appViewModel.alert('error', '', 'More than ' + valueAccessor().max + ' images');
				$('#filelist' + valueAccessor().index).append("<div class='f_upload_error'>Error: More than " + valueAccessor().max + " images</div>");
				// *** the follow code used to remove files from the queue, branch 2.0 has the same problem too ***
				$.each(files, function(i, file) {
					up.removeFile(file);
				});

				up.refresh(); // Reposition Flash/Silverlight
			} else {
				$.each(files, function(i, file) {
					$('#filelist' + valueAccessor().index).append(
							'<div id="' + file.id + '">' +
							file.name + ' (' + plupload.formatSize(file.size) + ') <b></b>' +
							'<div class="progress progress-success"><div class="bar" style="width: 0%;"></div></div>' +
					'</div>');
				});

				up.refresh(); // Reposition Flash/Silverlight

				up.start(); // *** auto start upload after files add ***
			}
		});
		// binding uploadProgress
		uploader.bind('UploadProgress', valueAccessor().uploadProgress || function(up, file) {
			$('#' + file.id + " b").html(file.percent + "%");
			$('#' + file.id + " div.bar").attr('style', 'width: ' + file.percent + "%;");
			if(file.percent == '100' && valueAccessor().max == '1') $('#filelist' + valueAccessor().index + ' div.f_upload_error').remove();
		});
		// binding error
		uploader.bind('Error', valueAccessor().error || function(up, err) {
			if (err.code == '-600') {
				appViewModel.alert('error', '', "<?=lang('file_size_larger_than')?>" + up.settings.max_file_size / 1024 + 'kb, please try a smaller image.', 5000);
			}

			up.refresh(); // Reposition Flash/Silverlight
		});
		// binding fileUploaded
		uploader.bind('FileUploaded', valueAccessor().fileUploaded || function(up, file, response) {
			var data = $.parseJSON(response.response);
			if(data.error){
				appViewModel.alert('error', '', data.error);
				$('#' + file.id + " div.progress").removeClass('progress-success').addClass('progress-danger');
				return;
			} else {
				appViewModel.alertLifted();
			}

			$('#' + file.id + " b").html("100%");
			$('#' + file.id + " div.bar").attr('style', 'width: 100%;');

			// register afterFilesAdded callback
			if (valueAccessor().afterFileUploaded) {
				// valueAccessor().afterFileUploaded(file, BASEURL + data.file, data.width, data.height);
				valueAccessor().afterFileUploaded(file, data.file, data.width, data.height);
			}
		});
    }
};