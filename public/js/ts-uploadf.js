function Uploadfer(options){
	var doNothing = function(){};
	var defaults = {
		// ID for dom handlers
		browseButton: 'upload-browse-button',
		container: 'upload-container',
		dropElement: null,
		dropContent: 'Drop your files here to upload.',
		dropClass: 'upload-drop',
		
		// File type
		filters : [
   			{title : "Document files", extensions : "csv,xlsx,xls"},
   		],
//           {title : "All files", extensions : "jpg,gif,tiff,png,psd,php,htm,html,css,zip,rar,tar,gzip,txt,doc,docx,xls,xlsx,ppt,pptx,pps,odt,ods,odp,sxw,sxc,sxi,wpd,pdf,rtf,csv,tsv,mp3,ogg,wav,mov,mp4,f4v,flv"},
//           {title : "Image files", extensions : "jpg,gif,tiff,png,psd"},
//           {title : "Web files", extensions : "php,htm,html,css"},
//           {title : "Archive files", extensions : "zip,rar,tar,gzip"},
//           {title : "Document files", extensions : "txt,doc,docx,xls,xlsx,ppt,pptx,pps,odt,ods,odp,sxw,sxc,sxi,wpd,pdf,rtf,csv,tsv"},
//           {title : "Audio files", extensions : "mp3,ogg,wav"},
//           {title : "Video files", extensions : "mov,mp4,f4v,flv"},
   		
   		// Url setting
   		uploadUrl: base_url + 'user/upload/file',
   		
   		// Events
   		filesAdded: doNothing,
   		progress: doNothing,
   		onError: doNothing,
   		fileUploaded: doNothing
   		
	};
	this.settings = $.extend(defaults, options);
	this.allowDragging = true;
	var self = this;
	
	if(!this.settings.dropElement){
		this.dropId = this.settings.container + '-drop';
		var drop = this.drop = $('<div id="' + this.dropId + '" style="display:none;position:absolute;" class="' + this.settings.dropClass + '">' + this.settings.dropContent + '</div>');
		var container = $('#' + this.settings.container);
		this.drop.css({top: 0, left: 0, width: container.outerWidth(), height: container.outerHeight()});
		container.append(this.drop);
		
		// FIXME: Chrome fix for the size of the drop box: ready is fired before the size of div is fixed
		// PROBLEM: is this may be fired too late, as window.load is only fired after all images are rendered.
		$(window).load(function(){
//			console.log('loaded : ',  container.outerWidth(), container.outerHeight());
			drop.css({top: 0, left: 0, width: container.outerWidth(), height: container.outerHeight()});
		});
		
	}else {
		this.dropId = this.settings.dropElement;
	}
	
	var uploader = this.uploader = new plupload.Uploader({
		runtimes : 'gears,html5,flash,silverlight,browserplus',
		browse_button : this.settings.browseButton,
		container: this.settings.container,
		max_file_size : '10mb',
		chunk_size : '2mb',
		url: this.settings.uploadUrl,
		flash_swf_url : base_url + 'js/plupload/plupload.flash.swf',
        silverlight_xap_url : base_url + 'js/plupload/plupload.silverlight.xap',
        drop_element: this.dropId,
        filters : this.settings.filters
	});
	
	uploader.bind('Init', function(up, params) {
//		console.log("Current runtime: " + params.runtime + ", Browser Version : " + $.browser.version +  " Uploader ID : " + '#input_' + up.id);
		if(params.runtime == 'gears' || params.runtime == 'browserplus' || params.runtime == 'html5'){
			
			var t = null;
			$(document).bind('dragover', function(e){
				self.drop.show();
				if(t) clearTimeout(t);
			});
			
			$(document).bind('dragleave', function(){
				t = setTimeout("$('#" + self.dropId + "').hide();", 100);
			});
			
			$(document).bind('drop', function(){
				$('#' + self.dropId).hide();
			});
			// fix bug when at chrome：拖动元素到文本框时 dragleave and drop 事件失效
			$(document).bind('mousemove', function(){
				$('#' + self.dropId).hide();
			});
		}
		
		if(params.runtime == 'html5'){
			uploader.bind('PostInit', function(up, params) {
				//FIX for the input box size, make it high enough
				$('#' + up.id + '_html5').css({'font-size': '60px'});
			});
		}
		
	});
	
	$('#' + this.settings.browseButton).click(function(e) {
		uploader.start();
		e.preventDefault();
	});
	
	uploader.init();
	
	uploader.bind('FilesAdded', this.settings.filesAdded);

	uploader.bind('UploadProgress', this.settings.progress);
	
	uploader.bind('Error', this.settings.onError);

	uploader.bind('FileUploaded', this.settings.fileUploaded);
	
	// if chrome 暂时解决chrome下z-index引起的plupload无法使用问题
	if(jQuery.browser.webkit){
		var file_input_cntr = $('#'+this.settings.container + ' div').last();
		file_input_cntr.attr('style', file_input_cntr.attr('style').replace('z-index: -1;', 'z-index: 2000;'));
		var browse_btn = $('#' + this.settings.browseButton);
		browse_btn.attr('style', browse_btn.attr('style').replace('z-index: 0;', 'z-index: 2001;'));
	}
}

Uploadfer.prototype.enableDrag = function(enabled){
	this.allowDragging = enabled;
};
