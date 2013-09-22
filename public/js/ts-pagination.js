function pagination(data, callback, keyword, filter, filter_name){
	var result  = {
		num_rows: data.num_rows,
		page_num: data.page_num,
		page_count: data.page_count,
		page_size: data.page_size,
		page_links: [],
		callback: callback,
		keyword: keyword,
		filter: filter,
		filter_name: filter_name
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