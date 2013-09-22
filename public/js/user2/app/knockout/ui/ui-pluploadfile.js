/**
 * This is a ko ui with jquery pluploadfile.
 * 
 * @depend 
 * 		js/jquery.plupload/jquery.ui.plupload/css/jquery.ui.plupload.css
 * 		js/jquery.plupload/plupload.full.js
 * 
 * @author jimmy
 */
/*global document, window, $, ko, debug, setTimeout, alert, BASEURL, appViewModel*/
ko.bindingHandlers.pluploadfile = {
    update: function (element, valueAccessor, allBindings, viewModel) {
    	var $element = $(element);
		// defined uploader
		var uploader = new plupload.Uploader({
			runtimes : 'gears,html5,flash,silverlight,browserplus',
			browse_button : $element.attr('id'),
			container : valueAccessor().container, // 未知的运行时错误：IE 8, （只在ui-importcontacts方式调用时发生，不设置container）
			max_file_size : '10mb',
			chunk_size : '2mb',
			url : valueAccessor().uploadUrl || BASEURL + 'user/upload/file',
			flash_swf_url : BASEURL + 'js/jquery.plupload/plupload.flash.swf',
			silverlight_xap_url : BASEURL + 'js/jquery.plupload/plupload.silverlight.xap',
			filters : [
	           	{title : "Document files", extensions : "csv,xlsx,xls"}
           	]
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
			if (valueAccessor().index) {
				$('#filelist' + valueAccessor().index).html("<div>Current runtime: " + params.runtime + "</div>");
			}
		});
		// binding filesAdded
		uploader.bind('FilesAdded', valueAccessor().filesAdded || function(up, files) {
			if(files.length > 1){
				$.each(files, function(i, file){
					up.removeFile(file);
				});
				up.refresh();
				appViewModel.alert('error', '', "<?=lang('more_than_1_file')?><?=lang('.')?>", 5000);
			}else{
				// TODO: 检测如果已经有文件了
				if (valueAccessor().file) {
					// TODO: 出现confirm时，如何关闭文件上传窗口的再弹出
					appViewModel.confirm("<?=lang('reupload')?>", "<?=lang('are_you_sure_you_want_to_upload_a_new_file')?><?=lang('?')?>", function(){
						$('#' + valueAccessor().filelist).empty();
						$.each(files, function(i, file){
							$('#' + valueAccessor().filelist).append(
									'<div id="' + file.id + '">' +
									file.name + ' (' + plupload.formatSize(file.size) + ') <b></b>' +
									'<div class="progress progress-success"><div class="bar" style="width: 0%;"></div></div>' +
							'</div>');
//							up.refresh(); // Reposition Flash/Silverlight
							up.start();
						});
					}, function(){
						$.each(files, function(i, file){
							up.removeFile(file);
						});
						up.refresh();
					});
				}else{
					$('#' + valueAccessor().filelist).empty();
					$.each(files, function(i, file){
						$('#' + valueAccessor().filelist).append(
								'<div id="' + file.id + '">' +
								file.name + ' (' + plupload.formatSize(file.size) + ') <b></b>' +
								'<div class="progress progress-success"><div class="bar" style="width: 0%;"></div></div>' +
						'</div>');
//						up.refresh(); // Reposition Flash/Silverlight
						up.start();
					});
				}
			}
		});
		// binding uploadProgress
		uploader.bind('UploadProgress', valueAccessor().uploadProgress || function(up, file) {
			$('#' + file.id + " b").html(file.percent + "%");
			$('#' + file.id + " div.bar").attr('style', 'width: ' + file.percent + "%;");
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
				valueAccessor().afterFileUploaded(data.file);
			}
		});
    }
};