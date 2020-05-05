var PayScreens = new function() {
	var self = this;
	var _currentPaymentType;
	var _settings;
	var _currencySymbolHTML;
	var _coaEnabled = 0;
	var _convenienceFeeEnabled = 0;
	var _calculatorURL;
	var _language;
	var _jsonFile;
	var _calculatorTimer;
	var _calculatedTotal = 0;
	var _calculatedCardNumber = '';
	var _lastCalculatedResults;
	var _cardNumberBuffer = '';
	var _originalTotal = '';
	var _customData;
	var _companyName = '';
	var _chargeAccountCompanyName = '';
	var _achEnabled = 0;
	var _creditEnabled = 0;
	var _avsOnlyEnabled = 0;
	var _seqrEnabled = 0;
	var _errorFieldNameArray = new Array(); 
	var _coaSessionID = '';
	var _countries = {};
	var _states = {};
	var _timeRemaining;
	var _callServerTimeRemaining;
	var _callTimer;
	var _cardBrand;
	var _cardCheckTimer;
	var _cardType;
	var _disabledCardTypes;
	var _checkCardBrand = '';
	var _checkCardType = '';

	this.init = function(settingsArray) {
		jQuery('document').ready(function() {
			_gatewayAccount = settingsArray['account'];
			_language = settingsArray['language'];
			_currentPaymentType = settingsArray['paymentType'];
			_currencySymbolHTML = settingsArray['currencySymbolHTML'];

			PayScreens.setACHEnabled(settingsArray['achEnabled']);
			PayScreens.setCreditEnabled(settingsArray['creditEnabled']);

			PayScreens.setDisabledCardTypes(settingsArray['disabledCardTypes']);
			PayScreens.setCompanyName(settingsArray['companyName']);
			PayScreens.setChargeAccountCompanyName(settingsArray['chargeAccountCompanyName']);
			PayScreens.setCustomParameters(settingsArray['customFields']);
			PayScreens.setAvsOnlyEnabled(settingsArray['avsOnlyEnabled']);
			PayScreens.setSeqrEnabled(settingsArray['seqrEnabled']);
			PayScreens.setCOAEnabled(settingsArray['coaEnabled']);
			PayScreens.setCOASessionID(settingsArray['coaSessionID']);
			PayScreens.setConvenienceFeeEnabled(settingsArray['convenienceFeeEnabled']);

			var metaphraseSetting = '';
                        if (settingsArray['metaphraseTemplate'] != '') {
                          metaphraseSetting = '&pd_text_template=' + settingsArray['metaphraseTemplate'];
                        }

			// initiate card brand check
			if (self.getInputValue('pb_cards_allowed') != '') {
				_checkCardBrand = 1
			}

			// initiate card type check
			if (self.getDisabledCardTypes() != '') {
				_checkCardType = 1
			}

			self.initCardAttributesCheck(_checkCardBrand,_checkCardType);

        
			//_jsonFile = '/pay/_json/merchants/' + _gatewayAccount + '/payscreens/' + _language + '/data.json?pd_transaction_payment_type=' + _currentPaymentType + metaphraseSetting;
			_jsonFile = '_json/data.json';

			/* Set up autoswipe callback */
			autoswipe.setup();
			autoswipe.callback = PayScreens.populateSwipeData;

			PayScreens.doSubstitutions(settingsArray['substitutions']);
	
			jQuery.getJSON(_jsonFile,function(data) {
				_settings = data;

				/* set the terminal mode */
				var paymentType = _settings['pd_transaction_payment_type'];
				PayScreens.setPaymentType(paymentType);

				/* make the form visible */
				jQuery('#formContainer').css('visibility','visible');

				/* get countries */
				var country = _settings['countriesAndStates'];
				jQuery.each(country, function(code) {
					var countryCode = code;
					var twoLetter = country[code].twoLetter;
					var countryName = country[code].commonName;
					_countries[twoLetter] = countryName;
				});

				jQuery('#submitButton').click(function() {
					return PayScreens.validate();
				})

				jQuery('form').submit(function() {
					jQuery('#submitButton').attr('disabled',true);
				});

				jQuery('input[name=pi_error_message]').blur(function() {
					jQuery('#errorSection h1').html(PayScreens.getInputValue('pi_error_message'));
				}).blur();

				jQuery('span.currencySymbol').html(PayScreens.getCurrencySymbolHTML());

				//set value of pt_transaction_amount and hide amount field for itemization
				if (PayScreens.getInputValue('pd_display_items') == "yes") {
					jQuery('#pt_transaction_amount').hide();
				}

				if (typeof PayScreens.additionalSetup !== 'undefined') {
					PayScreens.additionalSetup();
				}
	
			});
		});
	}

	this.setOriginalTotal = function(total) {
		_originalTotal = total;
	}

	this.getOriginalTotal = function() {
		return _originalTotal;
	}

	this.setCompanyName = function(name) {
		_companyName = name;
	}

	this.getCompanyName = function() {
		return _companyName;
	}

	this.setChargeAccountCompanyName = function(name) {
		_chargeAccountCompanyName = name;
	}

	this.getChargeAccountCompanyName = function() {
		return _chargeAccountCompanyName;
	}

	this.setCurrencySymbolHTML = function(html) {
		_currencySymbolHTML = html;
	}

	this.getCurrencySymbolHTML = function() {
		return _currencySymbolHTML;
	}

	this.setCustomParameters = function(customDataArray) {
		_customData = customDataArray;
	}

	this.getCustomParameter = function(customFieldName) {
		return _customData[customFieldName];
	}

	this.setACHEnabled = function(enabled) {
		_achEnabled = parseInt(enabled,10);
	}

	this.getACHEnabled = function() {
		return _achEnabled;
	}

	this.setCreditEnabled = function(enabled) {
		_creditEnabled = parseInt(enabled,10);
	}

	this.getCreditEnabled = function(enabled) {
		return _creditEnabled;
	}

	this.addErrorFieldName = function(fieldName) {
		 _errorFieldNameArray.push(fieldName);
	}

	this.getErrorFieldName = function() {
		return _errorFieldNameArray;
	}

	this.clearErrorFieldNameArray = function() {
		_errorFieldNameArray.length = 0;
	}

	this.setCOASessionID = function(sessionID) {
		_coaSessionID = sessionID;
	}

	this.getCOASessionID = function() {
		return _coaSessionID;
	}

	this.setAvsOnlyEnabled = function(enabled) {
		_avsOnlyEnabled = parseInt(enabled,10);
	}

	this.getAvsOnlyEnabled = function() {
		return _avsOnlyEnabled;
	}

	this.setSeqrEnabled = function(enabled) {
		_seqrEnabled = parseInt(enabled,10);
	}

	this.getSeqrEnabled = function() {
		return _seqrEnabled;
	}

	this.setCardBrand = function(brand) {
		_cardBrand = brand;
	}

	this.getCardBrand = function() {
		return _cardBrand;
	}

	this.setCardType = function(type) {
		_cardType = type;
	}

	this.getCardType = function() {
		return _cardType;
	}

	this.setDisabledCardTypes = function(type) {
		_disabledCardTypes = type;
	}

	this.getDisabledCardTypes = function() {
		return _disabledCardTypes;
	}
	

	/**************************************/
	/* Methods to get and set form values */
	/**************************************/
	this.setInputValueFromArray = function(field,array) {
		self.setInputValue(field,array.join(''));
	}

	this.setInputValue = function(field,value) {
		jQuery('input[name=' + field + ']').val(value).blur();
	}

	this.getInputValue = function(field) {
		return jQuery('input[name=' + field + ']').val();
	}

	this.setSelectValue = function(field,value) {
		jQuery('select[name=' + field + ']').val(value).blur();
	}

	this.getSelectValue = function(field) {
		return jQuery('select[name=' + field + ']').val();
	}

	this.setCheckbox = function(field,checked) {
		fieldSelector = 'input[name=' + field + ']';
		jQuery(fieldSelector).prop('checked',(checked ? true : false)).blur();
	}

	this.focusOn = function(field) {
		if (typeof(field) == 'string') {
			jQuery('input[name=' + field + ']').focus();
		} else {
			jQuery(field).focus();
		}
	}
	/*********************************************/
	/* End of methods to get and set form values */
	/*********************************************/

	/*******************************/
	/* Form initialization methods */
	/*******************************/
	this.setSelectOptions = function(identifier,arrayOfOptions) {
		jQuery('select[name=' + identifier + ']').html('');
		for (var optionValue in arrayOfOptions) {
			var option = jQuery('<option>');
			option.val(optionValue);
			option.html(arrayOfOptions[optionValue]);
			jQuery('form select[name=' + identifier + ']').append(option);
		}
	}


	this.displayField = function(field,showIt) {
		if (typeof(field) != 'object') {
			field = '#' + field;
		}
		if (showIt) {
			jQuery(field).removeClass('displayNone');
		} else {
			jQuery(field).addClass('displayNone');
		}
	}

	this.enableField = function(field,showIt) {
		if (showIt) {
			self.enableElement(field);
		} else {
			self.disableElement(field);
		}
	}

	
	this.enableElement = function(element) {
		if (typeof(element) != 'object') {
			element = '#' + element;
		}
		if (jQuery(element).hasClass('section')) {
			jQuery(element).find('label').each(function() { self.enableElement(this); });
		} else {
			jQuery(element).find('input').removeProp('disabled'); // so it gets submitted
			jQuery(element).find('select').removeProp('disabled'); // so it gets submitted
		}
	}
	
	this.disableElement = function(element) {
		if (typeof(element) != 'object') {
			element = '#' + element;
		}
		if (jQuery(element).hasClass('section')) {
			jQuery(element).find('label').each(function() { self.disableElement(this); });
		} else {
			jQuery(element).find('input').prop('disabled',true); // so it doesn't get submitted
			jQuery(element).find('select').prop('disabled',true); // so it doesn't get submitted
		}
	}

	this.requireField = function(field,requireIt) {
		if (typeof(field) != 'object') {
			field = 'input[name=' + field + ']';
		}
		var requiredMarkerWrapper = jQuery(field).parent().find('.requiredMarkerWrapper');
		if (requireIt) {
			jQuery(field).addClass('required');
			/* if requiredMarkerWrapper is not there, add it, if it is there, show it */
			if (requiredMarkerWrapper.length <= 0) {
				jQuery(field).after('<div class="requiredMarkerWrapper"><span class="requiredMarker">*</span></div>');
			}
			else {
				requiredMarkerWrapper.show();
			}
		}
		else {
			jQuery(field).removeClass('required');
			if (jQuery(field).hasClass('required_empty')) {
				jQuery(field).removeClass('required_empty');
			}
			/* if requiredMarkerWrapper is there, remove it */
			if (requiredMarkerWrapper.length > 0) {
				requiredMarkerWrapper.hide();
			}
		}
	}

	this.doSubstitutions = function(substitutions) {
		for (var selector in substitutions) {
			jQuery(selector).html(Pack.hexToText(substitutions[selector]));
		}
	}
	/**************************************/
	/* End of form initialization methods */
	/**************************************/

	this.setPaymentType = function(paymentType) {
		if (paymentType != 'all') {
			self.setPaymentType('all');
		}
	
		_currentPaymentType = paymentType;

		/* Set required fields */
		for (var element in _settings['required'][paymentType]) {
			if (element != '') {
				self.requireField(element,(_settings['required'][paymentType][element] == 1));
			}
		}

		/* Set up MetaPhrase Text */
		for (var selector in _settings['text'][paymentType]) {
			jQuery(selector).html(_settings['text'][paymentType][selector]['text']);
		};
	
		/* Set up form field visibility */
		for (var element in _settings['visible'][paymentType]) {
			if (element != '') {
				self.displayField(element,(_settings['visible'][paymentType][element] == 1));
			}
		}

		/* Enable/Disable fields */
		for (var element in _settings['enabled'][paymentType]) {
			if (element != '') {
				self.enableField(element,(_settings['enabled'][paymentType][element] == 1));
			}
		}

		/* Set up the tab order of fields */
		for (var element in _settings['tabOrder']) {
			if (element != '') {
				jQuery(element).attr('tabindex',_settings['tabOrder'][element]);
			}
		}
	}

	this.getPaymentType = function() {
		return _currentPaymentType;
	}

	this.isAvsOnlyTransaction = function() {
		var avsOnlyEnabled = PayScreens.getAvsOnlyEnabled();
		var avsOnlyTransaction = PayScreens.getInputValue('pb_avs_only');
		var amount = parseFloat(PayScreens.getInputValue('pt_transaction_amount'));

		if (avsOnlyEnabled && avsOnlyTransaction == 'yes' && amount == 0) {
			return true;
		}
		return false;
	}

	this.populateSwipeData = function(swipeData) {
		PayScreens.setInputValue('pt_payment_name',	  swipeData['firstName'] + ' ' + swipeData['lastName']);
		PayScreens.setInputValue('pt_card_number',	   swipeData['number']);
		PayScreens.setInputValue('pt_card_expiration_month', swipeData['expirationMonth']);
		PayScreens.setInputValue('pt_card_expiration_year',  swipeData['expirationYear']);

		if (swipeData['encrypted']) {
			PayScreens.setInputValue('pt_magensa',     swipeData['raw']);
		} else {
			PayScreens.setInputValue('pt_magstripe',       swipeData['raw']);
		}

		self.focusOn('pt_card_security_code');	

		jQuery('input[name=pt_card_number]').trigger('keyup');

		var number = swipeData['number'];
		var expirationMonth = swipeData['expirationMonth'];
		var expirationYear = swipeData['expirationYear'];

		if (PayScreens.postSwipeDataPopulation) {
			self.postSwipeDataPopulation(number,expirationMonth,expirationYear);
		}
			
	}

	/******************************************/
	/* COA and Convenience Fee methods */
	/******************************************/
       this.setCOAEnabled = function(enabled) {
		if (enabled == 1) {
			_coaEnabled = 1;
			self.initCOA();
		} else {
			_coaEnabled = 0;
		}
	}


	this.getCOAEnabled = function() {
		return _coaEnabled;
	}

	this.initCOA = function() {
		_calculatorURL = '/api/coa/coa.cgi';
		self.initCalculator();
	}


	this.setConvenienceFeeEnabled = function(enabled) {
		if (enabled == 1) {
			_convenienceFeeEnabled = 1;
			self.initConvenienceFee();
		} else {
			_convenienceFeeEnabled = 0;
		}
	}

	this.getConvenienceFeeEnabled = function() {
		return _convenienceFeeEnabled;
	}

	this.initConvenienceFee = function() {
		_calculatorURL = '/api/convfee/convfeecalc.cgi';
		self.initCalculator();
	}

	this.getCardNumberBufferLength = function() {
		return _cardNumberBuffer.length;
	}

	this.initCalculator = function() {
		jQuery('input[name=pt_card_number]').on('keyup',self.cardNumberCheck);

		jQuery('input[name=pt_transaction_amount]').on('keyup',function() {
			self.callCalculator();
		});
	}

	this.cardNumberCheck = function() {
		var cardNumber = jQuery('input[name=pt_card_number]').val();
		// cardNumber should only have numbers and *
		if (cardNumber.match(/^[0-9*]+$/)) { 
			// check if buffer is less than 9 digits and field at least 9  digits
			if (PayScreens.getCardNumberBufferLength() < 9 && cardNumber.length >= 9) {
				PayScreens.callCalculator();
			}
		}

		PayScreens._cardNumberBuffer = cardNumber;
	}


	this.preCalculatorSetup = function() { 
		var bin = jQuery('input[name=pt_card_number]').val().substr(0,9);
		var lastBin = self.getLastCalculatedCardNumber().substr(0,9);
		return (bin != lastBin);
	}

	this.getLastCalculatedTotal = function() {
		return _calculatedTotal;
	}

	this.getLastCalculatedCardNumber = function() {
		return _calculatedCardNumber;
	}

	this.callCalculator = function(option) {
		var isACH = false;
		var altCardNumber;

		var preCalculatorSetupResult = self.preCalculatorSetup();
		if (typeof preCalculatorSetupResult != 'undefined' && preCalculatorSetupResult == false) { 
			return 
		};
		window.clearTimeout(_calculatorTimer);
		// set timer duration based on wether or not amount is editable
		var amountInputField = jQuery('input[name=pt_transaction_amount]');
		var timerDuration;
		if (amountInputField.prop('type') == 'hidden' ||
		    amountInputField.prop('readonly') == true) {
			timerDuration = 0;
		} else {
			timerDuration = 1000;
		}
                
		_calculatorTimer = window.setTimeout(function() {
			var cardNumber = '000000';

			if (typeof option == 'boolean') {
				isACH = option;
			}
			else {
				altCardNumber = option;
			}

			if (jQuery('input[name=pt_card_number]').val().indexOf('*') != -1) { //encrypted swipe
				var cardNumberFieldValue = jQuery('#pt_magensa').val().substr(2,6);
			}
			else {
				var cardNumberFieldValue = jQuery('input[name=pt_card_number]').val()
			}

			if (typeof altCardNumber != 'undefined') {
				cardNumber = altCardNumber;
			}

			if ((typeof isACH == 'undefined' || !isACH) && cardNumberFieldValue.length >= 1) {
				cardNumber = cardNumberFieldValue;
			}

			var total = jQuery('input[name=pt_transaction_amount]').val();
			if (typeof total != 'undefined' && total != '') {
				total = parseFloat(total.replace(/[^\d\.]/g,''),10);
			} else {
				total = 0.00;
			}

			if (_calculatedTotal === total && _calculatedCardNumber === cardNumber) {
				self.calculatorCallback(_lastCalculatedResults,isACH);
				return; // don't actually call the calculator
			} 

			_calculatedTotal = total;
			_calculatedCardNumber = cardNumber;

			var account = _gatewayAccount;
			var sessionID = self.getCOASessionID();
			if (total != '' && cardNumber.length >= 6) {
				//self.showCalculatorSpinner();
				var postString = 'pt_gateway_account=' + account + '&total=' + total + '&bin=' + cardNumber.substr(0,9) + '&pt_coa_session_id=' + sessionID;
				jQuery.post(_calculatorURL, postString, function(data,status) {
					if (status == 'success') {
						_lastCalculatedResults = data;
						self.calculatorCallback(data,isACH);
					}
				}, 'json');
			}
		},timerDuration);
	}

	this.calculatorCallback = function(data,isACH) {
		alert('Calculator callback not defined.');
	}

	this.showCalculatorSpinner = function() {
		if (typeof _calculatorSpinner == 'undefined') {
			var opts = {
				lines: 9, // The number of lines to draw
				length: 3, // The length of each line
				width: 2, // The line thickness
				radius: 2, // The radius of the inner circle
				corners: 1, // Corner roundness (0..1)
				rotate: 0, // The rotation offset
				direction: 1, // 1: clockwise, -1: counterclockwise
				color: '#000', // #rgb or #rrggbb or array of colors
				speed: 1, // Rounds per second
				trail: 50, // Afterglow percentage
				shadow: false, // Whether to render a shadow
				hwaccel: false, // Whether to use hardware acceleration
				className: 'spinner', // The CSS class to assign to the spinner
				zIndex: 2e9, // The z-index (defaults to 2000000000)
				top: 'auto', // Top position relative to parent in px
				left: 'auto' // Left position relative to parent in px
			};
			_calculatorSpinner = new Spinner(opts).spin(document.getElementById('calculatorSpinner'));
		}
	}
	/**********************************************/
	/* End COA and Convenience Fee methods */
	/**********************************************/

	this.validate = function() {
		var result = self._validate();

		/* If result[0] is 1, then validation passed, return true so the form submits */
		if (result[0] == 1) {
			return true;
		}

		self.setErrorMessage(result);
		return false;
	}

	this.setErrorMessage = function(result) {
		if (result[1] == -1) {
			message = result[2];
		} else {
			message = self.lookupErrorMessageByID(result[1]);
		}
		self.setInputValue('pi_error_message',message);
	}

	this.lookupErrorMessageByID = function(id) {
		var message;
		switch(id) {
			case 0:
				message = '';
				break;
			case 1001:
				message = 'Required field is missing information';
				break;
			case 2001:
				message = 'Invalid Card Number';
				break;
			case 2002:
				message = 'Card is Expired or Expiration is invalid.';
				break;
			case 2003:
				message = 'Card brand, ' + self.getCardBrand() + ', not supported';
				break;
			case 2004:
				message = 'Card type, ' + self.getCardType() + ', not supported';
				break;
			case 3001:
				message = 'Invalid Routing Number';
				break;
			default:
				message = 'Unknown Error, code: ' + id;
		}
		return message;
	}

			

	this._validate = function() {
		// Check the required inputs are filled 
		PayScreens.clearErrorFieldNameArray();
		var requiredInputsResult = self.validateRequiredInputs();
		if (!(requiredInputsResult[0] == 1)) {
			return requiredInputsResult;
		}

		// Check the payment Information 
		var paymentValidationResult = self.validatePaymentInformation();
		if (!(paymentValidationResult[0] == 1)) {
			return paymentValidationResult;
		}

		// Do custom validation 
		var customValidationResult = self.customValidation();
		if (!(customValidationResult[0] == 1)) {
			return customValidationResult;
		}

		return [1,0];
	}

	this.validateRequiredInputs = function() {
		var status = 1;
		var messageID = 0;
		var focusElement = '';
	        jQuery('input.required, select.required, textarea.required').each(function() {
			var fieldResult = self.validateRequired(this);
			status &= fieldResult[0];
			if (messageID == 0) {
				messageID = fieldResult[1];
			}
			if (focusElement == '') {
				focusElement = fieldResult[2];
			}
	        });
		if (typeof(focusElement) != 'undefined') {
			self.focusOn(focusElement);
		}
		return [status,messageID];
	}

	this.validateRequired = function(field) {
		var status = 1;
		var messageID = 0;
		var focusElement = '';
		if (!jQuery(field).prop('disabled')) {
			var isFilled = false;
			if (jQuery(field).attr('type') == 'checkbox') {
				isFilled = jQuery(field).is(':checked');
			} else {
				isFilled = jQuery(field).val() != '';
			}
	
			if (!isFilled) {
			       	status &= 0;
				messageID = 1001;
				jQuery(field).addClass('required_empty');
				PayScreens.addErrorFieldName(jQuery(field).attr('name'));
				focusElement = field;
			} else {
				jQuery(field).removeClass('required_empty');
			}
		}
		return [status,messageID,focusElement];
	}

	this.validatePaymentInformation = function() {
		var status = 1;
		var messageID = 0;
		var cardNumber = self.getInputValue('pt_card_number');
		var magensa = self.getInputValue('pt_magensa'); 
		var magstripe = self.getInputValue('pt_magstripe');
		// Checks specific to the payment type
		if (_currentPaymentType == 'credit') {
			status &= self.validateCardNumber();
			if (!status) {
				messageID = 2001;
				return [status,messageID];
			}
			status &= self.validateExpiration();
			if (!status) {
				messageID = 2002;
				return [status,messageID];
			}
			status &= self.validateCardBrands();
			if (!status) {
				messageID = 2003
				return [status,messageID];
			}
			status &= self.validateCardTypes();
			if (!status) {
				messageID = 2004
				return [status,messageID];
			}
		} else if (_currentPaymentType == 'ach') {
			status &= self.validateRoutingNumber();
			if (!status) {
				messageID = 3001;
				return [status,messageID];
			}
		}
		return [status,messageID];
	}


	this.validateCardNumber = function() {
		var cardNumber = self.getInputValue('pt_card_number');
		if (DataValidation.isCreditCard(cardNumber)) {
			jQuery('input[name=pt_card_number]').removeClass('required_empty');
			return 1;
		}
		jQuery('input[name=pt_card_number]').addClass('required_empty');
		return 0;
	}

	this.validateRoutingNumber = function() {
		var routingNumber = self.getInputValue('pt_ach_routing_number');
		return (DataValidation.isABARoutingNumber(routingNumber) ? 1 : 0);
	}

	this.validateExpiration = function() {
		var month = self.getInputValue('pt_card_expiration_month');
		var year  = self.getInputValue('pt_card_expiration_year');
		if (year < 100) {
			year = parseInt(year,10) + 2000;
		}

		return (DataValidation.isExpiredOrInvalid(month,year) ? 0 : 1);
	}

	this.validateCardBrands = function() {
		var cardBrand = self.getCardBrand();
		var cardBrandsAllowed = self.getInputValue('pb_cards_allowed').toLowerCase();

		if (typeof cardBrand != 'undefined' && cardBrand != null && cardBrandsAllowed != '') {
			cardBrand = cardBrand.toLowerCase();
			if (cardBrand == "american express") { cardBrand = "amex" }
			if (new RegExp(cardBrand).test(cardBrandsAllowed) == true) {
				jQuery('input[name=pt_card_number]').removeClass('required_empty');
				self.cardCheckError('');
				return 1;
			}
			jQuery('input[name=pt_card_number]').addClass('required_empty');
			self.cardCheckError(self.lookupErrorMessageByID(2003));
			return 0;
		}
		return 1;
        }

	this.validateCardTypes = function() {
		var currentCardType = self.getCardType();
		var disabledCardTypeArray = self.getDisabledCardTypes().split(",");
		if (disabledCardTypeArray.indexOf(currentCardType) > -1) {
			jQuery('input[name=pt_card_number]').addClass('required_empty');
			self.cardCheckError(self.lookupErrorMessageByID(2004));
			return 0;
		}
		jQuery('input[name=pt_card_number]').removeClass('required_empty');
		self.cardCheckError('');
		return 1;
	}

	this.customValidation = function() {
		return [1,0];
	}

	this.inputToTextArea = function(inputName,rows,columns) {
		var textAreaName = inputName + '_textarea';

		var textArea = jQuery('<textarea name="' + textAreaName + '"></textarea>');

		// add rows
		if (typeof rows !== undefined && rows !== false) {
			textArea.attr('rows',rows);
		}

		// add columns
		if (typeof columns !== undefined && columns !== false) {
			textArea.attr('cols',columns);
		}

		// add required
		if (jQuery('#' + inputName + ' input').hasClass('required')) {
			textArea.addClass('required');
		}

		// add placeholder
		var placeHolder = jQuery('input[name=' + inputName + ']').attr('placeholder');
		if (typeof placeHolder !== undefined && placeHolder !== false) {
			textArea.attr('placeholder',placeHolder);
		}

		// hide the input put the textarea after it
		var input = jQuery('input[name=' + inputName + ']');
		if (!jQuery('textarea[name=' + textAreaName + ']').length) {
			input.after(textArea);
			input.addClass('displayNone');
		}

		// when the input changes, change the textarea 
		input.change(function() {
			var value = jQuery(this).val();
			jQuery(this).parent().find('textarea').val(value);
		}).change();

		// when the textarea changes, change the input
		textArea.change(function() {
			var value = jQuery(this).val();
			jQuery(this).parent().find('input').val(value);
		}).change();
	}

	this.inputToSelect = function(inputName,selectHash,selected,sortFunction,selectClassName,selectFieldName) {
                // create a select with the inputted options
		if (jQuery('#' + inputName + ' input').hasClass('required')) {
			var select = jQuery('<select class="required ' + selectClassName + '" name="' + selectFieldName + '">');
		}
		else {
                	var select = jQuery('<select class="' + selectClassName + '" name="' + selectFieldName + '">');
		}

		// get and sort keys
		var keys = new Array();
		for (var key in selectHash) {
			keys.push(key);
		}

		if (typeof sortFunction == 'function') {
			keys.sort(sortFunction);
		}

		keys.forEach(function(key) {
			value = selectHash[key];
                        var option = jQuery('<option>');
                        option.prop('value',key);
                        option.html(value);
                        if (key == selected) {
                                option.attr('selected',true);
                        }
                        select.append(option);
                });

		var input = jQuery('input[name=' + inputName + ']');
		input.after(select);
		input.addClass('displayNone');

		// when the input changes, change the select
		input.on('blur',function() {
			var value = jQuery(this).val();
			jQuery(this).parent().find('select').val(value);
		});

		// when the select changes, change the input
		select.change(function() {
			var value = jQuery(this).val();
			jQuery(this).parent().find('input').val(value);
		}).change();

	}

	this.integerSort = function(a,b) { 
		return parseInt(a,10) - parseInt(b,10); 
	}

	this.alphaSort = function(x,y) {
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	}

	this.sortSelectByText = function(inputName) {
		var values = jQuery("input[name=" + inputName + "] + select option");
		var selected = jQuery("input[name=" + inputName + "]").val();
		values.sort(function(a,b){
			a = a.innerHTML;
			b = b.innerHTML;
			return ((a < b) ? -1 : ((a > b) ? 1 : 0));
		});
		jQuery("input[name=" + inputName + "] + select").html(values);
		jQuery("input[name=" + inputName + "] + select").val(selected);
	}

	this.expirationMonthToSelect = function() {
		var months = { '01':'1', '02':'2', '03':'3', '04':'4', '05':'5', '06':'6', '07':'7', '08':'8', '09':'9', '10':'10', '11':'11', '12':'12' };
		var currentMonth = new Date().getMonth() + 1;
		var expirationMonthClass = "expirationMonthSelect"; 
		var expirationMonthName = "expirationMonth_select";

		if (currentMonth < 10) {
			currentMonth = 0 + '' + currentMonth;
		}
		
		if ((!jQuery('.expirationMonthSelect').length)) {
			self.inputToSelect('pt_card_expiration_month',months,currentMonth,self.integerSort,expirationMonthClass,expirationMonthName);
		}
	}

	this.expirationYearToSelect = function() {
		var currentYear = parseInt(new Date().getFullYear());
		var years = {};
		for (var i = 0; i < 15; i++) {
			var fourDigitYear = '' + (currentYear + i);
			var twoDigitYear = fourDigitYear.substr(2,2);
			years[twoDigitYear] = fourDigitYear;
		}
		var expirationYearClass = "expirationYearSelect";
		var expirationYearName = "expirationYear_select";

		if ((!jQuery('.expirationYearSelect').length)) {
			self.inputToSelect('pt_card_expiration_year',years,currentYear + '',self.integerSort,expirationYearClass,expirationYearName);
		}
	}

	this.getStates = function(countryCodeSelected,stateField) {
		var country = _settings['countriesAndStates'];

		jQuery.each(country, function(code) {
			_states = {};
			_states[""] = " Please Select";
			var state = country[countryCodeSelected]['states'];
			if (state != undefined) {
				jQuery.each(state, function(code) {
					var stateCode = code;
					var stateName = state[code].state_name;
					_states[stateCode] = stateName;
				});
			}
			else {	
				_states = {};
				var stateCode = "ZZ";
				var stateName = "Country other than US or CA";
				_states[stateCode] = stateName;
			}
		});
		PayScreens.stateToSelect(stateField);
	}

	this.changeStatesByCountry = function(countryField,stateField) {
		jQuery('#' + countryField + ' .countrySelect').change(function(){
			countryCodeSelected = jQuery(this).val();
			PayScreens.getStates(countryCodeSelected,stateField);
			// when state list changes, select first option and set field value to it
			jQuery('#' + stateField + ' .stateSelect option:first-child').prop('selected',true);
			PayScreens.setInputValue(stateField,[jQuery('#' + stateField + ' .stateSelect option:first-child').val()]);
		});
	}

	this.stateToSelect = function(stateField) {
		var currentState = this.getInputValue(stateField);
		var stateClass = "stateSelect";
		var stateName = "state_select";

		if ((jQuery('#' + stateField + ' .stateSelect').length)) { //if it already exists remove it
			jQuery('#' + stateField + ' .stateSelect').remove();
		}
		self.inputToSelect(stateField,_states,currentState,self.alphaSort,stateClass,stateName);
		self.sortSelectByText(stateField);
	}

	this.countryToSelect = function(countryField) {
		var currentCountry = this.getInputValue(countryField);
		var countryClass = "countrySelect";
		var countryName = "country_select";

		self.inputToSelect(countryField,_countries,currentCountry,self.alphaSort,countryClass,countryName);
		self.sortSelectByText(countryField);
	}

	this.unpackText = function(data,base) {
		var string = '';
		for (var i = 0; i < data.length; i += 2) {
			var unpackedValue = parseInt(data.substr(i, 2), base);
			if (unpackedValue) {
				string += String.fromCharCode(unpackedValue);
			}
		}
		return string;
	}

	this.showMultiplePaymentOptions = function(payment_type) {
		var hasCreditOption = PayScreens.getCreditEnabled(); 
		var hasACHOption = PayScreens.getACHEnabled();
		var hasSeqrOption = PayScreens.getSeqrEnabled();

		if ((payment_type != 'swipe') && (hasACHOption || hasSeqrOption)) {
			return true;
		}
		return false;
	}

	// generate seqr code
	this.generateSeqrCode = function(resultsLocation) {
		var data = jQuery('form').serialize();
		jQuery(resultsLocation).html('Loading...');
		jQuery.post('/payment/auth.cgi', data, function(results){
			jQuery(resultsLocation).html(results);
		});
	}
	
	this.updateServerTimeRemaining = function() {
		var account = _gatewayAccount;
		var sessionID = jQuery('input[name=pb_remote_session]').val(); 
		var timeDuration = jQuery('input[name=pb_remote_session_timeout]').val(); 
		var postString = 'pt_gateway_account=' + account + '&pb_remote_session=' + sessionID + '&pb_remote_session_timeout=' + timeDuration; 	
		jQuery.post('/pay/_json/timer_json.cgi', postString, function(data,status) {
			if (status == 'success') {
				self.setTimeRemaining(parseFloat(data['timeRemaining']));
			}
		}, 'json');
	}
	this.setTimeRemaining = function(timeRemaining) {
		_timeRemaining = timeRemaining;
	}
	this.getTimeRemaining = function() {
		return _timeRemaining;
	}

	this.timer =  function() {
		var timeRemaining = self.getTimeRemaining();

		if (timeRemaining > 0) {
			self.setTimeRemaining(timeRemaining - 1000);
			self.displayTimerCallback(self.secondsToHms(timeRemaining/1000));
		}
		else {
			clearInterval(_callTimer);
			clearInterval(_callServerTimeRemaining);
			self.timerIsDoneCallback();
		}
	}

	this.secondsToHms = function(seconds) {
		// for timer display
		seconds = Number(seconds);
		var h = Math.floor(seconds / 3600);
		var m = Math.floor(seconds % 3600 / 60);
		var s = Math.floor(seconds % 3600 % 60);
		return ((h > 0 ? h + ":" : "") + (m > 0 ? (h > 0 && m < 10 ? "0" : "") + m + ":" : "0:") + (s < 10 ? "0" : "") + s);
	}

	this.displayTimerCallback = function() {}
	this.timerIsDoneCallback = function() {}

	this.startTimer = function() {
		PayScreens.updateServerTimeRemaining(); // call once immediately 
		_callServerTimeRemaining = setInterval(function() {
			PayScreens.updateServerTimeRemaining();
		}, 10000);

		_callTimer = setInterval(function() {
			if (typeof PayScreens.getTimeRemaining() != 'undefined') {
				PayScreens.timer();
			}
		}, 1000);
	}

	// card brand and type checking
	this.initCardAttributesCheck = function(checkBrand,checkType) {
		if (checkBrand != '' || checkType != '') {
			var currentCard;
			var bin = "000000000";
			jQuery('input[name=pt_card_number]').on('input keyup change blur',function() {
				if (jQuery('input[name=pt_card_number]').val().indexOf('*') != -1) { //encrypted swipe
					currentCard = jQuery('#pt_magensa').val().substr(2,9);
				}
				else {
					currentCard = jQuery(this).val();
				}

				// Remove card check error if card number field is empty
				if ( currentCard.length < 1 ) {
					self.cardCheckError('');
					jQuery('input[name=pt_card_number]').removeClass('required_empty');
				}

				if (currentCard.match(/^[0-9*]+$/)) {
					if ( currentCard.length >= 9 && bin != currentCard.substring(0,9) ){
						self.checkCardAttributes(currentCard.substr(0,9),checkBrand,checkType);
						bin = currentCard.substring(0,9);
					}
				}
			});
		}
	}

	this.checkCardAttributes = function(cardNumber,checkBrand,checkType) {
		window.clearTimeout(_cardCheckTimer);
		_cardCheckTimer = window.setTimeout(function() {
			jQuery.ajax({
				url: '_json/cardtype_check.cgi',
				type: "POST",
				data: "account="+_gatewayAccount+"&number="+cardNumber,
				success: function(data){
					if (checkBrand) {
						self.setCardBrand(data['brand']);
						self.validateCardBrands();
					}
					if (checkType && self.validateCardBrands()) { // card brands valid
						self.setCardType(data['type']);
						self.validateCardTypes();
					}
				}
			});
		},1000);
	}

	this.cardCheckError = function(error) {
		if (jQuery('#cardCheckError').length < 1) {
			jQuery('input[name=pt_card_number]').after("<span id='cardCheckError' style='display:block; color:#f00;'></span>");
		}
		if (error != '') { jQuery('#cardCheckError').text(error); }
		else { jQuery('#cardCheckError').text(''); }
	}
	
}
