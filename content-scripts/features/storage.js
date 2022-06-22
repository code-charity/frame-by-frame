/*--------------------------------------------------------------
# STORAGE
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# IMPORT
--------------------------------------------------------------*/

document.addEventListener('storage-import', function () {
	var items = extension.storage.items;

	if (items.hasOwnProperty('increase_framerate') === false) {
		items.increase_framerate = {
			keys: {
				38: {
					key: 'ArrowUp'
				}
			}
		};
	}

	if (items.hasOwnProperty('decrease_framerate') === false) {
		items.decrease_framerate = {
			keys: {
				40: {
					key: 'ArrowDown'
				}
			}
		};
	}

	if (items.hasOwnProperty('next_shortcut') === false) {
		items.next_shortcut = {
			keys: {
				39: {
					key: 'ArrowRight'
				}
			}
		};
	}

	if (items.hasOwnProperty('prev_shortcut') === false) {
		items.prev_shortcut = {
			keys: {
				37: {
					key: 'ArrowLeft'
				}
			}
		};
	}

	if (items.hasOwnProperty('hide_shortcut') === false) {
		items.hide_shortcut = {
			keys: {
				72: {
					key: 'h'
				}
			}
		};
	}

	if (items.hasOwnProperty('framerate')) {
		extension.framerate = items.framerate;
	}
});


/*--------------------------------------------------------------
# CHANGE
--------------------------------------------------------------*/

document.addEventListener('storage-change', function (event) {
	if (event.detail.key === 'framerate') {
		extension.framerate = event.detail.value;
	}
});