// google chart api

ko.bindingHandlers.googlechart = {
	init: function(element, valueAccessor, allBindingsAccessor, viewModel) {
		var $element = $(element);
		if(!valueAccessor().quantity_data) return false;
		if(google) {
			codeAddres(valueAccessor().quantity_data);
		}

		function codeAddres(quantity_data) {
			var quantity = [];
			$.each(quantity_data, function(k, v){
				if(k != 0)
				{
					if(k != 'Month')
					{
						quantity.push([ k, parseInt(v) ]);
					}
					else
					{
						quantity.push([ k, v ]);
					}
				}
			});
			var data = google.visualization.arrayToDataTable(
					quantity
			);
		    var options = {
			    // Chart Area
			    chartArea: {
				    width: "80%",
				    height: "70%",
				    top: "20"
			    },
			    width: 800,
			    height: 300,
			    // Title Styles
		    	title: 'Shipment History',
		    	titleTextStyle: {color: 'black', fontSize: 16}, 
		    	titlePosition: 'none', // hidden
		    	// Chart Background Color
		    	backgroundColor: 'none',
		    	// Chart Element colors ( can specify more than 1)
		    	colors: ['#ff9b00'],
			    	            
		        // Horizontal Axis
		        hAxis: {
			        title: 'Month',  
			        titleTextStyle: {
				      color: 'black', 
				      italic: false, 
				      bold: true, 
				      fontSize: 14 
				    },
				    textStyle: {
				    	color: '#808080',  
				    	fontSize: 12 
				    }
				  },
				  
					  // Vertical Axis
			      vAxis: {
				      title: 'Number Of Shipments',  
				      titleTextStyle: {
					      color: 'black', 
					      italic: false, 
					      bold: true, 
					      fontSize: 14 
					  	},
					  	textStyle: {
					  		color: '#808080',  
					  		fontSize: 12 
					  	},
					  	gridlines: {
						  	color: '#808080'
					  	}, 
					  	baselineColor: '#808080'
					  },
					  
					  // Legend
			      legend: {
				      position: 'none'
					  }
					  
			    };
			    
			    var chart = new google.visualization.ColumnChart(document.getElementById('column_chart_div'));
			    chart.draw(data, options);
		}
	}
};
