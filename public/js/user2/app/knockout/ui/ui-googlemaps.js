// google maps api
ko.bindingHandlers.googlemaps = {
	init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
		var $element = $(element);
		if(!valueAccessor().address) return false;

		if(google && google.maps) {
			var geocoder = new google.maps.Geocoder();
			codeAddress(valueAccessor().address);
		}

		function codeAddress(address) {
			// var address = "No. 153 Yuehua Road, Huli Dist.Xiamen 361006, China"; //$("input#mapaddress").val();
			geocoder.geocode({
				'address': address
			}, function(results, status) {
				// console.log("address results", results);
				if(status == google.maps.GeocoderStatus.OK) { //地址解析成功
					var mapOptions = {
						zoom: 8,
						//缩放级别
						mapTypeId: google.maps.MapTypeId.ROADMAP
					};
					var map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);
					map.setCenter(results[0].geometry.location);
					var marker = new google.maps.Marker({
						map: map,
						position: results[0].geometry.location
					});
				} else {
					console.log("Geocode was not successful for the following reason: " + status);
					//							 $("div#no_maps").attr('style', 'display:none');
					$("div#no_maps").hide();
					$("div#map_canvas").attr('style', 'display:none');
				}
			});
		}
	}
};