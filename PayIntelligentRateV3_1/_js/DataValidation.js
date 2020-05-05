// data validation functions

var DataValidation = new function() {
	this.luhn10 = function(number) {
		number = number.toString();
	        var sum = 0;
	        var even = 0;
	
	        jQuery.each(number.split('').reverse(), function() {
	                jQuery.each(((this * (1+even)) + '').split(''), function() {
	                        sum += parseInt(this);
	                });
	                even = !even;
	        })
	
	        return ((sum % 10) === 0);
	}
	
	this.isCreditCard = function(number) {
		number = number.toString();
		number = number.replace(/[^\d\*]/g,'');
	        if (number.length >= 13 && number.length <= 20) {
			if (number.indexOf('*') >= 0) {
				return true;
			} else {
				if (DataValidation.luhn10(number)) {
					if (number.match(/^3[47]/) !== null && number.length != 15) {
						return false;
					}
					return true;
				}
			}
	        }
	        return false;
	}
	
	this.isABARoutingNumber = function(number) {
		number = number.toString();
	
		if (number.length == 9) {
			var validationSequence = [3,7,1];
			var sum = 0;
	
			for (j = 0; j < number.length; j++) {
				var multiple = number.charAt(j) * validationSequence[j % validationSequence.length];
				sum += multiple;
			}
	
			if (sum % 10 == 0) {
				return true;
			}
		}
		return false;
	}
	
	this.isExpiredOrInvalid = function(month,year) {
		var returnValue = true;
		if (month != '' && !isNaN(month) && year != '' && !isNaN(year)) {
			month = parseInt(month,10);
			year = parseInt(year,10);
			var today = new Date()
			var todaysMonth = today.getMonth() + 1;
			var todaysYear = today.getFullYear();
			if (month >= 1 && month <= 12 &&
	                    (year > todaysYear || (year == todaysYear && month >= todaysMonth))) {
				returnValue = false;
			}
		}
	
		return returnValue;
	}
}
