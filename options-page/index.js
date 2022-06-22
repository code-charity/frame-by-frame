/*--------------------------------------------------------------
>>> OPTIONS PAGE
----------------------------------------------------------------
# Global variable
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/

var extension = {
	skeleton: {}
};


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

satus.storage.import(function (items) {
	var language = items.language;

	if (!language || language === 'default') {
		language = window.navigator.language;
	}

	satus.locale.import(language, function () {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, {
				action: 'options-page-connected'
			}, function (response) {
				extension.hostname = response;

				if (!response) {
					extension.skeleton.main.layers.toolbar = {
						component: 'alert',
						variant: 'error',
						text: function () {
							return satus.locale.get('somethingWentWrongTryReloadingThePage');
						}
					};
				} else if (
					response.startsWith('about:') ||
					response.startsWith('chrome') ||
					response.startsWith('edge') ||
					response.startsWith('https://addons.mozilla.org') ||
					response.startsWith('https://chrome.google.com/webstore') ||
					response.startsWith('https://microsoftedge.microsoft.com/addons') ||
					response.startsWith('moz') ||
					response.startsWith('view-source:') ||
					response.endsWith('.pdf')
				) {
					extension.skeleton.main.layers.toolbar = {
						component: 'alert',
						variant: 'error',
						text: function () {
							return satus.locale.get('thePageHOSTNAMEisProtectedByBrowser').replace('HOSTNAME', response);
						}
					};
				} else {
					extension.skeleton.main.layers.toolbar = {
						component: 'alert',
						variant: 'success',

						switch: {
							component: 'switch',
							text: response,
							storage: 'domains/' + response,
							value: true
						}
					};
				}

				satus.render(extension.skeleton);

				extension.exportSettings();
				extension.importSettings();
			});
		});
	}, '_locales/');
});

chrome.runtime.sendMessage({
	action: 'options-page-connected'
}, function (response) {
	if (response.isPopup === false) {
		document.body.setAttribute('tab', '');
	}
});