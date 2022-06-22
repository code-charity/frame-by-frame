/*--------------------------------------------------------------
# STORAGE
----------------------------------------------------------------
# Property
# Get
# Set
# Import
# Onchanged
--------------------------------------------------------------*/

extension.storage = {
	items: {}
};


/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

extension.storage.get = function (key) {
	return this.items[key];
};


/*--------------------------------------------------------------
# SET
--------------------------------------------------------------*/

extension.storage.set = function (key, value) {
	var object = {};

	object[key] = value;

	this.items[key] = value;

	chrome.storage.local.set(object);
};


/*--------------------------------------------------------------
# IMPORT
--------------------------------------------------------------*/

extension.storage.import = function (callback) {
	chrome.storage.local.get(function (items) {
		extension.storage.items = items;

		document.removeEventListener('storage-import', callback);
		document.addEventListener('storage-import', callback);

		document.dispatchEvent(new CustomEvent('storage-import'));
	});
};


/*--------------------------------------------------------------
# ON CHANGED
--------------------------------------------------------------*/

extension.storage.onchanged = function (callback) {
	chrome.storage.onChanged.addListener(function (changes) {
		for (var key in changes) {
			var value = changes[key].newValue;

			extension.storage.items[key] = value;

			document.removeEventListener('storage-change', callback);
			document.addEventListener('storage-change', callback);

			document.dispatchEvent(new CustomEvent('storage-import'), {
				detail: {
					key,
					value
				}
			});
		}
	});
};