/*---------------------------------------------------------------
>>> BACKGROUND
-----------------------------------------------------------------
# Global variable
# Localization
# Listeners
    # Storage change
    # Message
---------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/

var extension = {
	locale: {},
	storage: {}
};


/*--------------------------------------------------------------
# LOCALIZATION
--------------------------------------------------------------*/

function getLocalization(code) {
	var language = code || navigator.language;

	if (language.indexOf('en') === 0) {
		language = 'en';
	}

	fetch(chrome.runtime.getURL('_locales/' + language + '/messages.json')).then(function (response) {
		if (response.ok) {
			response.json().then(function (response) {
				extension.locale = {};

				for (var key in response) {
					extension.locale[key] = response[key].message;
				}
			});
		} else {
			fetch(chrome.runtime.getURL('_locales/en/messages.json')).then(function (response) {
				if (response.ok) {
					response.json().then(function (response) {
						extension.locale = {};

						for (var key in response) {
							extension.locale[key] = response[key].message;
						}
					});
				}
			});
		}
	});
}


/*---------------------------------------------------------------
# LISTENERS
---------------------------------------------------------------*/

/*--------------------------------------------------------------
# STORAGE CHANGE
--------------------------------------------------------------*/

chrome.storage.onChanged.addListener(function (changes) {
	for (var key in changes) {
		extension.storage[key] = changes[key].newValue;
	}

	getLocalization(extension.storage.language);
});


/*---------------------------------------------------------------
# MESSAGE
---------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
	var action = message.action;

	if (action === 'get-locale') {
		var response = extension.locale;

		sendResponse(response);

		return response;
	} else if (action === 'tab-connected') {
		var response = {
			url: new URL(sender.tab.url).hostname,
			id: sender.tab.id
		};

		sendResponse(response);

		return response;
	} else if (action === 'options-page-connected') {
		sendResponse({
			isPopup: sender.hasOwnProperty('tab') === false
		});
	}
});


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

chrome.storage.local.get(function (items) {
	extension.storage = items;

	getLocalization(items.language);
});