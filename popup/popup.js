/*--------------------------------------------------------------
>>> POPUP:
----------------------------------------------------------------
# Skeleton
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# SKELETON
--------------------------------------------------------------*/

var skeleton = {
	component: 'base',

	header: {
		component: 'header',

		back: {
            component: 'button',
            attr: {
                'hidden': 'true'
            },
            on: {
                click: 'layers.back'
            },
            pluviam: true,

            svg: {
                component: 'svg',
                attr: {
                    'viewBox': '0 0 24 24',
                    'stroke-width': '1.5'
                },

                path: {
                    component: 'path',
                    attr: {
                        'd': 'M14 18l-6-6 6-6'
                    }
                }
            }
        },
        title: {
            component: 'span',
            text: 'Frame By Frame'
        }
	},
	layers: {
		component: 'layers',
		on: {
            open: function () {
                var skeleton = this.path[this.path.length - 1];

                this.base.skeleton.header.back.rendered.hidden = this.path.length <= 1;
                this.base.skeleton.header.title.rendered.innerText = satus.locale.get(skeleton.title) || 'Frame By Frame';
            }
        },

		toolbar: {
	        component: 'switch',
	        class: 'satus-switch--domain'
	    },
		section: {
			component: 'section',
			class: 'satus-section--card',

			appearance: {
				component: 'button',
				text: 'appearance',
				on: {
					click: {
						component: 'section',
						class: 'satus-section--card',
						title: 'appearance',

						hide_in_fullscreen: {
							component: 'switch',
							text: 'hideInFullscreen'
						},
						background_color: {
							component: 'color-picker',
							text: 'backgroundColor',
							value: '#000'
						},
						opacity: {
							component: 'slider',
							text: 'opacity',
							value: .85,
							step: .05,
							storage: 'opacity'
						}
					}
				}
			},
			shortcuts: {
				component: 'button',
				text: 'shortcuts',
				on: {
					click: {
						component: 'section',
						class: 'satus-section--card',
						title: 'shortcuts',

						next_shortcut: {
							component: 'shortcut',
							text: 'nextFrame',
							value: {
								keys: {
									37: {
										key: 'ArrowRight'
									}
								}
							}
						},
						prev_shortcut: {
							component: 'shortcut',
							text: 'previousFrame',
							value: {
								keys: {
									39: {
										key: 'ArrowLeft'
									}
								}
							}
						},
						hide_shortcut: {
							component: 'shortcut',
							text: 'hide',
							value: {
								keys: {
									72: {
										key: 'h'
									}
								}
							}
						}
					}
				}
			}
		},

		made_with_love: {
	        component: 'a',
	        class: 'made-with-love',
	        attr: {
	        	target: '_blank',
	        	href: 'https://chrome.google.com/webstore/detail/improve-youtube-open-sour/bnomihfieiccainjcjblhegjgglakjdd'
	        },
	        properties: {
	        	innerHTML: 'Made with <svg viewBox="0 0 24 24"><path d="M13.35 20.13c-.76.69-1.93.69-2.69-.01l-.11-.1C5.3 15.27 1.87 12.16 2 8.28c.06-1.7.93-3.33 2.34-4.29 2.64-1.8 5.9-.96 7.66 1.1 1.76-2.06 5.02-2.91 7.66-1.1 1.41.96 2.28 2.59 2.34 4.29.14 3.88-3.3 6.99-8.55 11.76l-.1.09z"></svg> by <span>ImprovedTube</span>'
	        }
	    }
	}
};


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

satus.storage.import(function (items) {
    satus.fetch('../_locales/' + (items.language || 'en') + '/messages.json', function (object) {
        for (var key in object) {
            satus.locale.strings[key] = object[key].message;
        }

        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        	chrome.tabs.sendMessage(tabs[0].id, {}, function(response) {
        		skeleton.layers.toolbar.text = response || 'accessIsDenied';

					if (!response) {
						skeleton.layers.toolbar.component = 'span';
						skeleton.layers.toolbar.class = 'satus-span--error';
					} else {
						skeleton.layers.toolbar.storage = 'domains/' + response;
					}

					satus.render(skeleton);
        	});
        });
    });
});