(function($){
	
	var settings = {
		frontend:'user/dashboard/j_friends',
		backend:'admin/user/auto_search',
		contactsUrl: 'user/connections/j_contacts'
	};
	
	var methods = {
			
		user : function(target, onChange, backend, exists){
			return this.each(function(){
				var $this = $(this);
				var url = settings.frontend;
				if(backend) url = settings.backend;
				$this.autocomplete({
					source:  function( request, response ) {
						// 排除已存在的好友ids
						var exclude = null;
						if(exists) exclude = exists();
						
						$.ajax({
							url: url,
							dataType: "json",
							type: "POST",
							data: {
								exclude: exclude,
								search: request.term
							},
							success: function( data ) {
								datas = eval(data);
								if(datas != null){
									response( $.map(datas, function( item ) {
										return {
											label: item.full_name,
											picture: urlThumbnail(item.id, '15'),
											id: item.id
										};
									}));
								}else{
									$this.removeClass('ui-autocomplete-loading');
								}
							}
							
						});
					},
				    select:  function( event, ui ) {
				    	if(target) target.val(ui.item.id);
						if(onChange) onChange(ui.item);
					},
					close: function(event, ui) { 
						if(!backend){
							$this.val('');
						}
					}
					
					
				}).data('uiAutocomplete')._renderItem = function(ul, item){
					return $('<li></li>').data( "item.autocomplete", item ).append('<a><img src="' + item.picture + '" class="to_person_img" /> <span class="to_person_name">' + item.label + '</span><div class="cl"></div></a>').appendTo(ul);
				};
			});
		},
		
		contacts : function(target, onChange, exists, onlyImport){
			return this.each(function(){
				var $this = $(this);
				var url = onlyImport ? settings.contactsUrl + '/' + onlyImport : settings.contactsUrl;
				$this.autocomplete({
					source:  function( request, response ) {
						// 排除已存在的好友ids/imports
						var exclude = null;
						if(exists) exclude = exists();
						
						$.ajax({
							url: url,
							dataType: "json",
							type: "POST",
							data: {
								exclude_users: exclude.users,
								exclude_imports: exclude.imports,
								keyword: request.term
							},
							success: function( data ) {
								datas = eval(data);
								if(datas != null){
									response( $.map(datas, function( item ) {
										if(item.id){
											return {
												label: item.full_name,
												picture: urlThumbnail(item.id, '15'),
												id: item.id
											};											
										}
										if(item.email){
											return {
												email: item.email,
												nick_name: item.nick_name ? item.nick_name : item.email  
											};
										}
									}));
								}else{
									$this.removeClass('ui-autocomplete-loading');
								}
							}
							
						});
					},
				    select:  function( event, ui ) {
				    	if(target) target.val(ui.item.id);
						if(onChange) onChange(ui.item);
					},
					close: function(event, ui) { 
						$this.val(''); // 支持输入email地址
					},
					delay: 500
				}).data('uiAutocomplete')._renderItem = function(ul, item){
					if(item.id){
						return $('<li></li>').data( "item.autocomplete", item ).append('<a><img src="' + item.picture + '" class="to_person_img" /> <span class="to_person_name">' + item.label + '</span><div class="cl"></div></a>').appendTo(ul);
					}
					if(item.email){
						return $('<li></li>').data( "item.autocomplete", item ).append('<a> <span class="to_person_name">' + item.nick_name + '</span><div class="cl"></div></a>').appendTo(ul);
					}
				};
			});
		},
		
		location : function(target, onChange){
			return this.each(function(){
				var $this = $(this);
				$this.autocomplete({
					source: function( request, response ) {
						$.ajax({
							url: "http://ws.geonames.org/searchJSON",
							dataType: "jsonp",
							data: {
								featureClass: "P",
								style: "full",
								maxRows: 12,
								name_startsWith: request.term
							},
							success: function( data ) {
								response( $.map( data.geonames, function( item ) {
									return {
										label: item.name + (item.adminName1 ? ", " + item.adminName1 : "") + ", " + item.countryName,
										value: item.name + (item.adminName1 ? ", " + item.adminName1 : "") + ", " + item.countryName
									};
								}));
							}
						});
					},
					minLength: 2,
					select:  function( event, ui ) {
						target.val(ui.item.countryName);
						if(onChange) onChange(ui.item.countryName);
					}
				});

			});
		}
		
	};
	
	$.fn.autoComp = function(method){
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else {
			$.error( 'Method ' +  method + ' does not exist.' );
		}
	};
	
	var doNothing = function(){};
})(jQuery);