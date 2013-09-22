var TS = {};
var base_url = "<?=base_url();?>";
(function(){
	var API_URL = base_url + 'public/app/';
	easyXDM.DomHelper.requiresJSON('js/easyXDM/json2.js');
	var url = $('iframe.app').attr('src');
	TS.rpc = new easyXDM.Rpc({
			remote: API_URL + '/xdm/'
		},{
			local:{},
			remote:{
				setIframeHeight:{},
				sendMessage:{},
				inviteJoinApp:{},
				connect:{},
				getJtmpl:{},
				showDialog:{},
				getCurrentUser:{},
				ad:{},
				showNotice:{},
				showError: {},
				showCaution: {},
				showConfirm: {},
				showWorking: {}
			}
		}
	);
	
})();

TS.setIframeHeight = function(height){
	if(!height){
		height = $('body').outerHeight();
	}
	TS.rpc.setIframeHeight(height);
};

TS.inviteJoinApp = function(target_id, target_name, target_type, target_owner_id, default_message){
	TS.rpc.inviteJoinApp(target_id, target_name, target_type, target_owner_id, default_message);
};

TS.connect = function(user_id, full_name, success){
	TS.rpc.connect(user_id, full_name, success);
};

TS.sendMessage = function(user_id, full_name){
	TS.rpc.sendMessage(user_id, full_name);
};

TS.showDialog = function(message, redirect, dissapear, footnote){
	TS.rpc.showDialog(message, redirect, dissapear, footnote);
};

TS.getCurrentUser = function(fn){
	TS.rpc.getCurrentUser(fn);
};

TS.ad = function(keyword){
	TS.rpc.ad(keyword);
};

TS.showNotice = function(msg, container, animation, cancel, autoClose, closeAfter){
	TS.rpc.showNotice(msg, container, animation, cancel, autoClose, closeAfter);
};

TS.showError = function(msg, container, animation, cancel, autoClose, closeAfter){
	TS.rpc.showError(msg, container, animation, cancel, autoClose, closeAfter);
};

TS.showCaution = function(msg, container, animation, cancel, autoClose, closeAfter){
	TS.rpc.showCaution(msg, container, animation, cancel, autoClose, closeAfter);
};

TS.showConfim = function(title, msg, container, ok, cancel){
	TS.rpc.showConfirm(title, msg, container, ok, cancel);
};

TS.showWorking = function(title, data, autoClose, closeAfter){
	TS.rpc.showWorking(title, data, autoClose, closeAfter);
};

$(function(){
});


