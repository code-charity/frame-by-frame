/*--------------------------------------------------------------
# MESSAGE
----------------------------------------------------------------
# Property
# Listener
# Sent
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# PROPERTY
--------------------------------------------------------------*/

extension.message = {};


/*--------------------------------------------------------------
# LISTENER
--------------------------------------------------------------*/

extension.message.listener = function (callback) {
	chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
		var action = message.action;

		if (action === 'options-page-connected') {
			if (window === window.top) {
				sendResponse(extension.hostname);
			}
		}
	});
};


/*--------------------------------------------------------------
# SENT
--------------------------------------------------------------*/

extension.message.sent = function (message, callback) {
	chrome.runtime.sendMessage(message, callback);
};