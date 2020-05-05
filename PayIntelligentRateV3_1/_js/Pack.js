var Pack = new function() {
	this.hexToText = function(data) {
		return this.pack(data,16);
	}

	this.textToHex = function(data) {
		return this.unpack(data,16);
	}

        this.pack = function(data,base) {
                var string = '';
		if (typeof(base) == 'undefined') {
			base = 16;
		}
                for (var i = 0; i < data.length; i += 2) {
                        var packedValue = parseInt(data.substr(i, 2), base);
                        if (packedValue) {
                                string += String.fromCharCode(packedValue);
                        }
                }
                return string;
        }

	this.unpack = function(data,base) {
		var string = '';
		if (typeof(base) == 'undefined') {
			base = 16;
		}

		for (var i = 0; i < data.length; i++) {
			var unpackedValue = data[i].charCodeAt();
			string += unpackedValue.toString(base);
		}
		return string;
	}
}
