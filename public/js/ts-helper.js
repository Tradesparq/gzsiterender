(function($){
	
	var methods = {
		url_user_thumbnail : function(user_id){
			var userIdIntatc = methods.str_pad(user_id, 12, '0', 'STR_PAD_LEFT');
			var step = 0;
			var userPath = '';
			while(step < 12){
				userPath += userIdIntatc.substr(step, 4) + '/';
				step += 4;
			}
			return 'uploads/user/' + userPath + 'profile/thumbnail.jpg';
		},
			
		str_pad : function(input, pad_length, pad_string, pad_type) {
			var half = '', pad_to_go;
			var str_pad_repeater = function(s, len){
				var collect = '', i;
				while(collect.length < len){
					collect += s;
				}
				collect = collect.substr(0, len);
				return collect;
			};
			
			input += '';
			pad_string = pad_string !== undefined ? pad_string : ' ';
			
			if (pad_type != 'STR_PAD_LEFT' && pad_type != 'STR_PAD_RIGHT' && pad_type != 'STR_PAD_BOTH') {
		        pad_type = 'STR_PAD_RIGHT';
		    }
			
			if ((pad_to_go = pad_length - input.length) > 0) {
		        if (pad_type == 'STR_PAD_LEFT') {
		            input = str_pad_repeater(pad_string, pad_to_go) + input;
		        } else if (pad_type == 'STR_PAD_RIGHT') {
		            input = input + str_pad_repeater(pad_string, pad_to_go);
		        } else if (pad_type == 'STR_PAD_BOTH') {
		            half = str_pad_repeater(pad_string, Math.ceil(pad_to_go / 2));
		            input = half + input + half;
		            input = input.substr(0, pad_length);
		        }
		    }
			
			return input;
		},
		
		str_pad2 : function(str, len, pad_str, PAD_TYPE){
		    if(typeof str != 'string'){
		        str = new String(str);
		    } 
		    
		    var str_len = str.length;
		     
		    var s = '';
		    var nl = len - str_len ;
		     
		    if(nl < 0 ) nl = 0;
		     
		    for(var i=0; i<nl;i++){
		        s += pad_str;
		    } 
		     
		    var os = '';
		     
		    if(PAD_TYPE == 'STR_PAD_RIGHT' ){
		    	os = str + s;
		    }else{
		    	os = s + str;
		    } 

			return os;
		}
	};
	
	$.fn.helper = function(method){
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else {
			$.error( 'Method ' +  method + ' does not exist.' );
		}
	};
	
	var doNothing = function(){};
})(jQuery);