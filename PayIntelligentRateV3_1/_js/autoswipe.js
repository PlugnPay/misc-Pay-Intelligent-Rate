var autoswipe = new function() {
	this.swipeDetectionBuffer = '';
	this.swipeDetectionlastUpdate = '0';
	
	this.setup = function() {
		jQuery(document).on('keypress',function(event) {
			var elementType = event.target.nodeName;
			if (elementType != 'TEXTAREA') {
				return autoswipe.readEvent(event);
			}
		});

		setInterval(function() {
			autoswipe.checkBuffer();
		}, 500);
	}

	this.callback = function(cdata) {
		alert(cdata['name']);
		alert(cdata['firstName']);
		alert(cdata['lastName']);
		alert(cdata['expirationMonth']);
		alert(cdata['expirationYear']);
		alert(cdata['expiration']);
	}

	this.checkBuffer = function () {
		var now = new Date().getTime();
		if (now - this.swipeDetectionlastUpdate > 1000) {
			if (this.swipeDetectionBuffer.charAt(0) == '%' && this.swipeDetectionBuffer.toLowerCase().charAt(1) == 'b') {
				var focused = document.activeElement;
				var cdata = this.parseSwipedData(this.swipeDetectionBuffer);
				if (jQuery(focused).is('input')) {
					jQuery(focused).val('');
				}
				this.callback(cdata);
				this.swipeDetectionBuffer = '';
				jQuery('body').css('overflow','scroll'); // turn scrolling back on
			}
		}
	}

	this.readEvent = function(event) {
		var nextChar = String.fromCharCode(event.which);
		this.swipeDetectionlastUpdate = new Date().getTime();

		if (nextChar == '/') {
			event.preventDefault();
		}
		
		if (nextChar == '%') {
			this.swipeDetectionBuffer = '';
		}

		// Turn off scrolling so carriage returns from swiper does not scroll the page
		if (nextChar.toLowerCase() == 'b' && this.swipeDetectionBuffer.charAt(0) == '%') {
			jQuery('body').css('overflow','hidden');
		}
	
		if (nextChar != "\n" && nextChar != "\r") {	
			this.swipeDetectionBuffer += nextChar;
		} else {
			return false;
		}

		return true;
	}

	this.results = function() {
		return this.parseSwipedData(this.swipeDetectionBuffer);
	}
	
	this.parseSwipedData = function(buffer) {
		var cardData = {};

		cardData['raw'] = buffer;


		var encrypted = false;
		if (buffer.indexOf('|') !== -1) {
			encrypted = true;
		}
		cardData['encrypted'] = encrypted;
		

		// get track 1
		buffer = buffer.slice(2,buffer.search('/;/'));
	
		cardData['expiration'] = buffer.slice((buffer.search(/\^/,2) + 1),(buffer.search(/\^/) + 5));
		cardData['expiration_month'] = cardData['expiration'].slice(2,4);
		cardData['expiration_year'] = cardData['expiration'].slice(0,2);
		cardData['expiration'] = cardData['expiration_month'] + "/" + cardData['expiration_year'];
		
		// get the card number
		var number = buffer.slice(0,buffer.search(/\^/));

		if (encrypted) {
			var substitution = Array(number.length - 7).join('*');
			number = number.substring(0,4) + substitution + number.substring(number.length - 4, number.length);
		}

		cardData['number'] = number;

		// get the card name, get the start of the expiration string for later
		var name = buffer.slice(buffer.search(/\^/)+1);
		var expiration = name.slice(name.search(/\^/)+1); // saving this for later
		name = name.slice(0,name.search(/\^/));
		name = name.replace(/\s\s*$/, '');
		cardData['name'] = name;

		// get the first and last names from the card name
		var slashLocation = name.search(/\//);
		cardData['firstName'] = name.slice(slashLocation+1);
		cardData['lastName'] = name.slice(0,slashLocation);

		expiration = expiration.slice(0,4);
		cardData['expirationMonth'] = expiration.slice(2,4);
		cardData['expirationYear'] = expiration.slice(0,2);
		cardData['expiration'] = cardData['expirationMonth'] + '/' + cardData['expirationYear'];
	
		return cardData;
	}
}
