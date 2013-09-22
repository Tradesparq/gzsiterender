$(function(){
//	$('textarea.richtext').ckeditor();
	
	$('a[action]').click(function(e){
		e.preventDefault();
		url = $(this).attr('action');
		form = $(this).parents('form');
		form.attr('action', url);
		form.submit();
	});
	
	$('a.f_confirm').click(function(e){
		$this = $(this);
		if($this.attr('href') != ''){
			e.preventDefault();
			showConfirm('Confirm Please', 'Make sure you are not click wrong?', null, function(){
				window.location.href = $this.attr('href');
			});
		}
	});
});
