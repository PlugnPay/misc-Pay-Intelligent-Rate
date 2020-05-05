// Input Functions

var Input = new function() {
	this.setAsDecimalInput = function(field) {
		jQuery(field).keydown(function(evt) {
			if (!evt.shiftKey) {
				var current = parseFloat(jQuery(this).val());
	
				var backspace = false;
				
				// empty string becomes zero
				if (isNaN(parseFloat(current))) { current = 0; }
	
				// allow tab to next element
				if (evt.which == 9) {
					return true;
				}
				
				// if backspace or delete, allow it and adjust 
				if (evt.which == 8 || evt.which == 46) {
					// backspace was pressed
					current = parseInt(current * 10) / 100;
					jQuery(this).val(current.toFixed(2)).change();
				}
	
				// get the input key, map it to the correct number
				var digit = evt.which - 48;
				if (digit > 9) {
					digit -= 48;
				}
				if (digit >= 0 && digit <= 9) {
					// set new value for current
					current = ((current * 1000) + digit) / 100;
					jQuery(this).val(current.toFixed(2)).change();
				}
			}
			// so autoswipe.js works.
			if (evt.shiftKey && evt.which == 53) {
				jQuery(this).blur();
				return true;
			}
			return false;
		});
	}

	this.setAsNumericInput = function(field) {
		jQuery(field).keydown(function(evt) {
			if (!evt.shiftKey) {
				// allow tab to next element
				if (evt.which == 9) {
					return true;
				}
	
				var digit = evt.which - 48;
				if (digit > 9) {
					digit -= 48;
				}
	
				// return true only for backspace and numeric characters
				if (evt.which == 8 || evt.which == 46 || (digit >= 0 && digit <= 9)) {
					return true;
				}
			}
			// so autoswipe.js works.
			if (evt.shiftKey && evt.which == 53) {
				jQuery(this).blur();
				return true;
			}
			return false;
		});
	}
}
