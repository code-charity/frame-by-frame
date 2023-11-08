/*--------------------------------------------------------------
# LOCALIZATION
----------------------------------------------------------------
# Property
# Get
# Import
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# PROPERTY
--------------------------------------------------------------*/

extension.locale = {
	message: {}
};


/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

extension.locale.get = function (message) {
	return this.message[message] || message;
};


/*--------------------------------------------------------------
# IMPORT
--------------------------------------------------------------*/

extension.locale.import = function () {
	extension.message.sent({ action: 'get-locale'}, function (response) {
		extension.locale.message = response;
		document.dispatchEvent(new CustomEvent('locale-updated'));
	});
};