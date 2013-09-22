if(!console){
	function Console(){};
	Console.prototype.log = function(){
		var buf = '';
		for( var i = 0; i < arguments.length; i++ ) {
			buf += arguments[i] + ' ';
		}
	};
	var console = new Console(); 
}

function debug(obj, depth, depthLimit){
	var buf = '';
	if(depth == null) depth = 0;
	if(depthLimit == null) depthLimit = 3;
	
	if(obj === null){
		return 'null';
	}else if(obj === undefined){
		return 'undefined';
	}else if(obj.constructor == Array){
		if(depthLimit >= 0 && depth > depthLimit ) return obj + '...';
		buf += '[\n';
		for(var i = 0; i < obj.length; i++){
			buf += _space(depth + 1);
			buf += debug(obj[i], depth + 1, depthLimit) + ', ';
			buf += '\n';
		}
		buf = _close(buf, depth, ']');
	}else if(typeof(obj) == 'object'){
		if(depthLimit >= 0 && depth > depthLimit ) return obj + '...';
		buf += '{\n';
		if(obj){
			for(key in obj){
				if(!obj.hasOwnProperty || obj.hasOwnProperty(key)){
					buf += _space(depth + 1);
					buf += '"' + key + '": ' + debug(obj[key], depth + 1, depthLimit) + ', ';
					buf += '\n';
				}
			}			
		}
		buf = _close(buf, depth, '}');
	}else if(typeof(obj) == 'function'){
		buf += 'function';
	}else {
		buf += '"' + obj + '"';
	}
	return buf;
}

function _close(buf, depth, closeWith){
	if(buf.substring(buf.length - 3) == ', \n'){
		buf = buf.substring(0, buf.length - 3) + '\n';
		buf += _space(depth) + closeWith;
	}else {
		buf = buf.substring(0, buf.lastIndexOf('\n'));
		buf += closeWith;
	}
	return buf;
}

function _space(depth){
	var space = '';
	for(var i = 0; i < depth; i ++){
		space += '    ';
	}
	return space;
}