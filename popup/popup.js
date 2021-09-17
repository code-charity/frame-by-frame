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

        toolbar: {},

		section: {
			component: 'section',
			class: 'satus-section--card',

			appearance: {
				component: 'button',
				on: {
					click: {
						component: 'section',
						class: 'satus-section--card',
						title: 'appearance',

						background_color: {
							component: 'color-picker',
							text: 'backgroundColor',
							value: {
								rgb: [0, 0, 0]
							}
						},
						text_color: {
							component: 'color-picker',
							text: 'textColor',
							value: {
								rgb: [255, 255, 255]
							}
						},
						blur: {
							component: 'slider',
							text: 'blur',
							value: 4,
							max: 16,
							storage: 'blur'
						},
						opacity: {
							component: 'slider',
							text: 'opacity',
							value: .85,
							step: .05,
							storage: 'opacity'
						},
						hide_in_fullscreen: {
							component: 'switch',
							text: 'hideInFullscreen'
						}
					}
				},

				icon: {
					component: 'svg',
					attr: {
						'viewBox': '0 0 24 24',
						'fill': '#4e4e7e'
					},

					path: {
						component: 'path',
						attr: {
							'd': 'M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3zm13.71-9.37-1.34-1.34a.996.996 0 0 0-1.41 0L9 12.25 11.75 15l8.96-8.96a.996.996 0 0 0 0-1.41z'
						}
					}
				},
				label: {
					component: 'span',
					text: 'appearance'
				}
			},
			shortcuts: {
				component: 'button',
				on: {
					click: {
						component: 'section',
						class: 'satus-section--card',
						title: 'shortcuts',

						prev_shortcut: {
							component: 'shortcut',
							text: 'previousFrame',
							value: {
								keys: {
									37: {
										key: 'ArrowLeft'
									}
								}
							}
						},
						next_shortcut: {
							component: 'shortcut',
							text: 'nextFrame',
							value: {
								keys: {
									39: {
										key: 'ArrowRight'
									}
								}
							}
						},
						hide_shortcut: {
							component: 'shortcut',
							text: 'hidePanel',
							value: {
								keys: {
									72: {
										key: 'h'
									}
								}
							}
						}
					}
				},

				icon: {
					component: 'svg',
					attr: {
						'viewBox': '0 0 24 24',
						'fill': '#4e4e7e'
					},

					path: {
						component: 'path',
						attr: {
							'd': 'M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z'
						}
					}
				},
				label: {
					component: 'span',
					text: 'shortcuts'
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
        		skeleton.layers.toolbar.text = response || '';

					if (!response) {
						skeleton.layers.toolbar = {
							component: 'alert',
							text: 'somethingWentWrongTryReloadingThePage',
							variant: 'error'
						};
					} else {
						skeleton.layers.toolbar = {
							component: 'switch',
							class: 'satus-switch--domain',
							text: response,
							storage: 'domains/' + response,
							value: true
						};
					}

					satus.render(skeleton);
        	});
        });
    });
});