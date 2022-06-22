/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

extension.observer.create();

extension.message.sent({
	action: 'tab-connected'
}, function (response) {
	extension.hostname = response.url;

	extension.message.listener();
	extension.ui.create();

	extension.storage.import(function () {
		if (!extension.storage.items.domains || extension.storage.items.domains[extension.hostname] !== false) {
			extension.enable();
		}
	});

	extension.locale.import();
});

extension.storage.onchanged(function (key, value) {
	if (key === 'domains') {
		if (value[extension.hostname] !== false) {
			extension.enable();
			extension.observer.query();
		} else {
			extension.disable();
		}
	}

	extension.ui.styles();
});

document.addEventListener('fullscreenchange', function () {
	if (document.fullscreenElement && extension.storage.items.hide_in_fullscreen === true) {
		extension.ui.style.display = 'none';
	} else {
		extension.ui.style.display = '';
	}
});