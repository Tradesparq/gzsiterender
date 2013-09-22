var heartbeat = new Heartbeat({url:'user2/heartbeat'});

// Tradesparq heartbeat class
function Heartbeat(settings){
	var defaults = {
		minCheckInterval : 15000, // 5 secs
		maxCheckInterval : 60000, // 1 min
		url : 'heartbeat',
		method : 'POST',
		timeout : null,
		retry : 3,
		delay : 100 // Beat now delay in ms
	};
	
	this.settings = $.extend(defaults, settings);
	
	this.duties = {};
	this.dutyCount = 0;
	this.failCount = 0;
	this.beatCount = 0;
	this.t = 0;
	this.startTime = new Date().getTime();
	this.beating = false;
	var that = this;
	
	this.time = function(){
		return new Date().getTime() - this.startTime + ' === ';
	};
	
	this.beat = function(){
//console.log(that.time() + 'Actual beat');
		if(that.timer) clearTimeout(that.timer); // Clear any future scheduded heartbeat.
		if(that.dutyCount == 0) that.rest(); // Relax when there is no duty.
		that.beating = false;
		
		var duties = {};
		var i = 0;
		for(method in that.duties){
			duties[i++] = {
				method : that.duties[method].method,
				params : that.duties[method].params
			};
		}
		
		that.beatCount ++;
		if(that.beatCount == 1 && typeof initBeatData !== 'undefined' && !$.isEmptyObject(initBeatData)){
			that.ajaxCallback(initBeatData, null, null);
			return;
		}
		
		var url = that.settings.url + '/index/' + Math.random();
		if(that.dutyCount > 0 || that.interval){
			$.ajax({
				url: url,
				type: that.settings.method,
				data : {duties : duties},
				dataType : 'json',
				success : that.ajaxCallback,
				error : that.ajaxFail,
				timeout : that.settings.timeout
			});
		}
	};

	
	this.ajaxCallback = function(data, textStatus, jqXHR){
		that.failCount = 0;
		var resultCount = 0;
		for(method in data.result){
			var result = data.result[method];
			if(that.duties[method]){
				var callback = that.duties[method].callback; 
				if(that.duties[method].once) that.remove(method);
				callback(result);
				resultCount++;
			}
		}
		
		if(resultCount == 0){
			that.calculateNextBeatTime();
		}else {
			that.excite();; // Get excited on any action.
		}
		
		if(that.timer) clearTimeout(that.timer); // Clear any future scheduded heartbeat.
		var interval = that.beating ? that.settings.delay : that.interval;
		if(that.interval) that.timer = setTimeout(that.beat, interval); // Prepare next heartbeat.
	};
	
	this.ajaxFail = function(jqXHR, textStatus, errorThrown){
		that.failCount++;
		//console.log(this.time() + 'AJAX ERROR : ' + textStatus); // FIXME: need proper error handling
		if(that.failCount <= that.settings.retry && that.interval){
			var interval = that.beating ? that.settings.delay : that.interval;
			that.timer = setTimeout(that.beat, interval); // Prepare next heartbeat.
		}
	};

	this.excite = function(){
		that.interval = that.settings.minCheckInterval;
		that.t = 0;
	};
	
	this.rest = function(){
		that.interval = that.settings.maxCheckInterval;
		that.t = that.settings.maxCheckInterval * 3;
	};	
	
	// Recalculate the heartbeat period, a shifted atan curve: frequent check for a period then increase gradually till most infrequent
	this.calculateNextBeatTime = function(){
		var min = that.settings.minCheckInterval ? that.settings.minCheckInterval : defaults.minCheckInterval;
		var max = that.settings.maxCheckInterval ? that.settings.maxCheckInterval : defaults.maxCheckInterval;
		var p = that.interval;
		var t = that.t;
		p = min + (max-min) * (Math.atan(t / max * 20 - 20) + 1.53) / 3.08;
		if(that.interval > that.settings.maxCheckInterval) that.interval = that.maxCheckInterval;
		that.t += p;
	};
	
	this.excite();
//	this.beat(); // Relever!
}

// Arrhythmia
Heartbeat.prototype.beatNow = function(){
	this.excite(); // Excited by surprise
	if(this.settings.delay > 0){
		//console.log(this.time() + 'beatNow requested, it will be delayed for ' + this.settings.delay);
		this.beating = true;
		if(this.timer) clearTimeout(this.timer); // Clear any future scheduded heartbeat.
		this.timer = setTimeout(this.beat, this.settings.delay); // Prepare next heartbeat soon
	}else {
		//console.log(this.time() + 'beatNow requested, it will be done right now');
		this.beat();
	}
	
};

Heartbeat.prototype.register = function(method, params, callback, once){
	//console.log(this.time() + 'registering : ' + method);
	this.duties[method] = {
		method : method,
		params : params,
		callback : callback,
		once : once
	};
	if(this.dutyCount == 0) this.excite(); // Excited by first job
	this.dutyCount ++;
	if(this.timer) clearTimeout(this.timer); // Clear any future scheduded heartbeat.
	var interval = this.beating ? this.settings.delay : this.interval;
//console.log(this.time() + "New request registered. beating : " + this.beating + ', so it would be delayed for ' + interval);
	this.timer = setTimeout(this.beat, interval); // Prepare next heartbeat soon
};

Heartbeat.prototype.remove = function(method){
	delete this.duties[method];
	this.dutyCount --;
};