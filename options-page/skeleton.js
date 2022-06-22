/*--------------------------------------------------------------
>>> SKELETON
----------------------------------------------------------------
# Base
# Header
# Main
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# BASE
--------------------------------------------------------------*/

extension.skeleton.component = 'base';


/*--------------------------------------------------------------
# HEADER
--------------------------------------------------------------*/

extension.skeleton.header = {
	component: 'header',

	sectionStart: {
		component: 'section',
		variant: 'align-start',

		back: {
			component: 'button',
			variant: 'icon',
			attr: {
				'hidden': 'true'
			},
			on: {
				click: 'main.layers.back'
			},

			svg: {
				component: 'svg',
				attr: {
					'viewBox': '0 0 24 24',
					'stroke-width': '1.5',
					'stroke': 'currentColor',
					'fill': 'none'
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
			variant: 'title'
		}
	},
	sectionEnd: {
		component: 'section',
		variant: 'align-end',

		menu: {
			component: 'button',
			variant: 'icon',
			on: {
				click: {
					component: 'modal',
					variant: 'vertical-menu',

					language: {
						component: 'select',
						on: {
							change: function () {
								var language = satus.storage.get('language');

								if (!language || language === 'default') {
									language = window.navigator.language;
								}

								satus.locale.import(language, function () {
									var layers = document.querySelector('.satus-layers');

									extension.skeleton.main.layers.rendered.dispatchEvent(new CustomEvent('open'));

									satus.empty(layers.firstChild);

									satus.render(satus.last(layers.path), layers.firstChild, undefined, true);
								}, '_locales/');
							}
						},
						options: [{
								value: 'en',
								text: 'English'
							},
							{
								value: 'he',
								text: 'עברית'
							}, {
								value: 'ru',
								text: 'Русский'
							}, {
								value: 'de',
								text: 'Deutsch'
							}, {
								value: 'ar',
								text: 'العربية'
							}
						],

						svg: {
							component: 'svg',
							attr: {
								'viewBox': '0 0 24 24',
								'fill': 'currentColor'
							},

							path: {
								component: 'path',
								attr: {
									'd': 'M12.9 15l-2.6-2.4c1.8-2 3-4.2 3.8-6.6H17V4h-7V2H8v2H1v2h11.2c-.7 2-1.8 3.8-3.2 5.3-1-1-1.7-2.1-2.3-3.3h-2c.7 1.6 1.7 3.2 3 4.6l-5.1 5L4 19l5-5 3.1 3.1.8-2zm5.6-5h-2L12 22h2l1.1-3H20l1.1 3h2l-4.5-12zm-2.6 7l1.6-4.3 1.6 4.3H16z'
								}
							}
						},
						label: {
							component: 'span',
							text: 'language'
						}
					},
					export: {
						component: 'button',
						text: 'export',
						before: {
							component: 'svg',
							attr: {
								'viewBox': '0 0 24 24',
								'fill': 'none',
								'stroke': 'currentColor',
								'stroke-linecap': 'round',
								'stroke-linejoin': 'round',
								'stroke-width': '2'
							},

							path: {
								component: 'path',
								attr: {
									'd': 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12'
								}
							}
						},
						on: {
							click: function () {
								if (location.href.indexOf('options-page/index.html?action=export-settings') !== -1) {
									extension.exportSettings();
								} else {
									chrome.tabs.create({
										url: 'options-page/index.html?action=export-settings'
									});
								}
							}
						}
					},
					import: {
						component: 'button',
						text: 'import',
						before: {
							component: 'svg',
							attr: {
								'viewBox': '0 0 24 24',
								'fill': 'none',
								'stroke': 'currentColor',
								'stroke-linecap': 'round',
								'stroke-linejoin': 'round',
								'stroke-width': '2'
							},

							path: {
								component: 'path',
								attr: {
									'd': 'M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3'
								}
							}
						},
						on: {
							click: function () {
								if (location.href.indexOf('options-page/index.html?action=import-settings') !== -1) {
									extension.importSettings();
								} else {
									chrome.tabs.create({
										url: 'options-page/index.html?action=import-settings'
									});
								}
							}
						}
					}
				}
			},

			svg: {
				component: 'svg',
				attr: {
					'viewBox': '0 0 24 24',
					'stroke-width': '2',
					'stroke': 'currentColor',
					'fill': 'none'
				},

				circle1: {
					component: 'circle',
					attr: {
						'cx': '12',
						'cy': '5.25',
						'r': '0.45'
					}
				},
				circle2: {
					component: 'circle',
					attr: {
						'cx': '12',
						'cy': '12',
						'r': '0.45'
					}
				},
				circle3: {
					component: 'circle',
					attr: {
						'cx': '12',
						'cy': '18.75',
						'r': '0.45'
					}
				}
			}
		}
	}
};


/*--------------------------------------------------------------
# MAIN
--------------------------------------------------------------*/

extension.skeleton.main = {
	component: 'main',

	layers: {
		component: 'layers',
		on: {
			open: function () {
				var skeleton = satus.last(this.path),
					section = this.baseProvider.skeleton.header.sectionStart,
					title = 'Frame By Frame';

				if (skeleton.parentSkeleton) {
					if (skeleton.parentSkeleton.label) {
						title = skeleton.parentSkeleton.label.text;
					} else if (skeleton.parentSkeleton.text) {
						title = skeleton.parentSkeleton.text;
					}
				}

				section.back.rendered.hidden = this.path.length <= 1;
				section.title.rendered.innerText = satus.locale.get(title);

				var vertical_menu = document.querySelector('.satus-modal--vertical-menu');

				if (vertical_menu) {
					vertical_menu.close();
				}
			}
		},

		toolbar: {},
		section: {
			component: 'section',
			variant: 'card',

			background_color: {
				component: 'color-picker',
				text: 'backgroundColor',
				value: [0, 0, 0]
			},
			outline_color: {
				component: 'color-picker',
				text: 'outlineColor',
				value: [255, 255, 255]
			},
			text_color: {
				component: 'color-picker',
				text: 'textColor',
				value: [255, 255, 255]
			},
			blur: {
				component: 'slider',
				variant: 'row',
				text: 'blur',
				value: 4,
				max: 16
			},
			opacity: {
				component: 'slider',
				variant: 'row',
				text: 'opacity',
				value: .85,
				step: .05
			},
			hide_in_fullscreen: {
				component: 'switch',
				text: 'hideInFullscreen'
			},
			shortcuts: {
				component: 'button',
				text: 'shortcuts',
				on: {
					click: {
						component: 'section',
						class: 'satus-section--card',
						title: 'shortcuts',

						increase_framerate: {
							component: 'shortcut',
							text: 'increaseFramerate',
							value: {
								keys: {
									38: {
										key: 'ArrowUp'
									}
								}
							}
						},
						decrease_framerate: {
							component: 'shortcut',
							text: 'decreaseFramerate',
							value: {
								keys: {
									40: {
										key: 'ArrowDown'
									}
								}
							}
						},
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
				}
			}
		}
	}
};