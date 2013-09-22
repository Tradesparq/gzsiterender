(function(){
	easyXDM.DomHelper.requiresJSON('js/easyXDM/json2.js');
	var rpc = new easyXDM.Rpc({},{
		local: {
			setIframeHeight: function(height){
				$('iframe.app', window.parent.parent.document).css('height', height);
			},
			connect: window.parent.parent.connect,
			sendMessage: window.parent.parent.sendMessage,
			inviteJoinApp: window.parent.parent.inviteJoinApp,
			invite: window.parent.parent.invite,
			showDialog: window.parent.parent.showDialog,
			ad: window.parent.parent.ad,
			getCurrentUser: function(fnSuccess, fnFail){fnSuccess(window.parent.parent.getCurrentUser());},
			showNotice: window.parent.parent.showNotice,
			showError: window.parent.parent.showError,
			showCaution: window.parent.parent.showCaution,
			showConfirm: window.parent.parent.showConfirm,
			showWorking: window.parent.parent.showWorking
		},
		remote: {
		}

	});

	$(function(){
		
	});
	
})();