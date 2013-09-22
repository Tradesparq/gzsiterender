var estimate_t0 = 1333065600000;
var estimate_m0 = 361643832;

$(update_estimate);

function update_estimate(){
        var now = (new Date()).getTime();
        var estimate_m = estimate_m0;

        if(now > estimate_t0){
                estimate_m += Math.round((now - estimate_t0) * 5 / 144);
        }
        $('.estimated_no').html(format_m(estimate_m));
        var millisec = parseInt(Math.random()*(10000-100+1)+100);
        setTimeout(update_estimate, millisec);
}

function format_m(num){
        var str = String(num);
        var out = '';
        for(var i = 0; i < str.length; i++){
                if(i > 0 && i % 3 == 0 && str.length > i) out = ',' + out;
                out = str.charAt(str.length - i - 1) + out;
        }
        return '$' + out;
}