/**
 * A temporary pagination plugin for 3.0
 * TODO: make this better and put it to the right position
 * 
 * @param data
 * @param callback
 * @param keyword
 * @param filter
 * @param filter_name
 * @returns {___anonymous121_370}
 */
function pagination(data, callback){
	if (data && data.num_rows) {
		var result  = {
				num_rows: ko.utils.unwrapObservable(data.num_rows),
				page_num: ko.utils.unwrapObservable(data.page_num),
				page_count: ko.utils.unwrapObservable(data.page_count),
				page_size: ko.utils.unwrapObservable(data.page_size),
				page_prefix: ko.utils.unwrapObservable(data.page_prefix),
				page_links: [],
				callback: callback
		};
		if(result.page_count < 11){
			for(var i = 1 ; i <= result.page_count; i++){
				result.page_links.push(i);
			}
		}else{
			if(result.page_num > 5 && result.page_num < (result.page_count - 5)){
				result.first = true;
				result.last = true;
				for(var i = result.page_num - 5; i <= result.page_num - (-5); i++){
					result.page_links.push(i);
				}
			}else{
				if(result.page_num <= 5){
					result.last = true;
					for(var i = 1; i <= 10 ; i++){
						result.page_links.push(i);
					}
				}
				if(result.page_num >= (result.page_count - 5)){
					result.first = true;
					for(var i = result.page_count - 9; i <= result.page_count; i++){
						result.page_links.push(i);
					}
				}
			}
		}
		
		return result;
	}
}