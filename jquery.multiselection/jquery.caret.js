//this was originally done by someone else, but I redid it so it doesn't rely on order.
$(function() {
  $.fn.caret = function(pos) {
	if(typeof pos != "undefined") {
    if ($(this).get(0).setSelectionRange) {
      $(this).get(0).setSelectionRange(pos, pos);
    } else if ($(this).get(0).createTextRange) {
      var range = $(this).get(0).createTextRange();
      range.collapse(true);
      range.moveEnd('character', pos);
      range.moveStart('character', pos);
      range.select();
    }
	}
	else {
//took from "the stickman"
var element = this;
if( document.selection ){
	// The current selection
	var range = document.selection.createRange();
	// We'll use this as a 'dummy'
	var stored_range = range.duplicate();
	// Select all text
	stored_range.moveToElementText( element );
	// Now move 'dummy' end point to end point of original range
	stored_range.setEndPoint( 'EndToEnd', range );
	// Now we can calculate start and end points
	element.selectionStart = stored_range.text.length - range.text.length;
	element.selectionEnd = element.selectionStart + range.text.length;
}
		return $(element).get(0).selectionStart;
	}
  }
});
