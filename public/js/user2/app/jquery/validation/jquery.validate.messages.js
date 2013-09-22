$(function(){
	// Override default error message 
	$.validator.messages.required = "* <?php echo lang("this_field_is_required.")?>";  
	// The rest of validation here 
});