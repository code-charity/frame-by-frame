var skeleton = {
	header: {
		type: 'header',
		innerText: 'Frame By Frame'
	},
	main: {
		type: 'main',

		toolbar: {
	        type: 'section',
	        class: 'satus-section--toolbar',

	        enable: {
	            type: 'switch',
	            label: '',
	            value: true
	        }
	    },

	    section_label: {
            type: 'text',
            class: 'satus-section--label',
            label: 'shortcuts'
        },

		section: {
			type: 'section',

			next_shortcut: {
				type: 'shortcut',
				label: 'next',
				value: {
					key: '>'
				}
			},
			prev_shortcut: {
				type: 'shortcut',
				label: 'prev',
				value: {
					key: '<'
				}
			},
			hide_shortcut: {
				type: 'shortcut',
				label: 'hide',
				value: {
					key: 'i'
				}
			}
		},

	    section_2_label: {
            type: 'text',
            class: 'satus-section--label',
            label: 'other'
        },

		section_2: {
			type: 'section',

			hide_in_fullscreen: {
				type: 'switch',
				label: 'hideInFullscreen'
			}
		},

		made_with_love: {
	        type: 'text',
	        class: 'made-with-love',
	        innerHTML: 'Made with <svg viewBox="0 0 24 24"><path d="M13.35 20.13c-.76.69-1.93.69-2.69-.01l-.11-.1C5.3 15.27 1.87 12.16 2 8.28c.06-1.7.93-3.33 2.34-4.29 2.64-1.8 5.9-.96 7.66 1.1 1.76-2.06 5.02-2.91 7.66-1.1 1.41.96 2.28 2.59 2.34 4.29.14 3.88-3.3 6.99-8.55 11.76l-.1.09z"></svg> by <span>ImprovedTube</span>',
	        onclick: function() {
	            window.open('https://chrome.google.com/webstore/detail/improve-youtube-open-sour/bnomihfieiccainjcjblhegjgglakjdd');
	        }
	    }
	}
};

satus.storage.import(function(items) {
	satus.locale.import(function() {
	    satus.modules.updateStorageKeys(skeleton, function() {
			satus.render(skeleton);

			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {
					document.querySelector('.satus-section--toolbar .satus-switch__label').innerText = response || chrome.i18n.getMessage('accessIsDenied');

					if (!response) {
						document.querySelector('.satus-section--toolbar').style.opacity = .25;
						document.querySelector('.satus-section--toolbar').style.pointerEvents = 'none';
					} else {
						document.querySelector('.satus-section--toolbar input').dataset.storageKey = response;
					}
				});
			});
		});
	});
});