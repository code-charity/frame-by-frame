/*--------------------------------------------------------------
>>> FUNCTIONS
----------------------------------------------------------------
# Export settings
# Import settings
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# EXPORT SETTINGS
--------------------------------------------------------------*/

extension.exportSettings = function () {
	if (location.href.indexOf('action=export-settings') !== -1) {
		satus.render({
			component: 'modal',
			variant: 'confirm',
			content: 'areYouSureYouWantToExportTheData',
			buttons: {
				cancel: {
					component: 'button',
					text: 'cancel',
					on: {
						click: function () {
							this.modalProvider.close();
						}
					}
				},
				ok: {
					component: 'button',
					text: 'ok',
					on: {
						click: function () {
							try {
								var blob = new Blob([JSON.stringify(satus.storage.data)], {
									type: 'application/json;charset=utf-8'
								});

								chrome.permissions.request({
									permissions: ['downloads']
								}, function (granted) {
									if (granted) {
										chrome.downloads.download({
											url: URL.createObjectURL(blob),
											filename: 'frame-by-frame.json',
											saveAs: true
										}, function () {
											setTimeout(function () {
												close();
											}, 1000);
										});
									}
								});
							} catch (error) {
								console.error(error);
							}
						}
					}
				}
			}
		}, extension.skeleton.rendered);
	}
};


/*--------------------------------------------------------------
# IMPORT SETTINGS
--------------------------------------------------------------*/

extension.importSettings = function () {
	if (location.href.indexOf('action=import-settings') !== -1) {
		satus.render({
			component: 'modal',
			variant: 'confirm',
			content: 'areYouSureYouWantToImportTheData',
			buttons: {
				cancel: {
					component: 'button',
					text: 'cancel',
					on: {
						click: function () {
							this.modalProvider.close();
						}
					}
				},
				ok: {
					component: 'button',
					text: 'ok',
					on: {
						click: function () {
							var input = document.createElement('input');

							input.type = 'file';

							input.addEventListener('change', function () {
								var file_reader = new FileReader();

								file_reader.onload = function () {
									var data = JSON.parse(this.result);

									for (var key in data) {
										satus.storage.set(key, data[key]);
									}

									setTimeout(function () {
										chrome.runtime.sendMessage({
											action: 'import-settings'
										});

										setTimeout(function () {
											close();
										}, 128);
									}, 256);
								};

								file_reader.readAsText(this.files[0]);
							});

							input.click();
						}
					}
				}
			}
		}, extension.skeleton.rendered);
	}
};