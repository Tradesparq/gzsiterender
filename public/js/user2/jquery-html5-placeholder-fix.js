/**
 * FIX placeholder for ie with jQuery
 */
function placeholderFix() {
	if( ! Modernizr.input.placeholder){
		// setTimeout: after ko render
		setTimeout(function(){
			$("input[placeholder]").each(function(){
				$this = $(this);
				if($this.val()=="" && $this.attr("placeholder")!=""){
					$this.val($this.attr("placeholder"));
					$this.focus(function(){
						if($this.val()==$this.attr("placeholder")) $this.val("");
					});
					$this.blur(function(){
						if($this.val()=="") $this.val($this.attr("placeholder"));
					});
				}
			});
		}, 1000);
	}
}