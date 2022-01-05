/*--------------------------------------------------------------
>>> POPUP:
----------------------------------------------------------------
# Skeleton
# Functions
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# SKELETON
--------------------------------------------------------------*/

var skeleton = {
	component: 'base',

	header: {
		component: 'header',

		section_1: {
			component: 'section',
			variant: 'align-start',

			back: {
				component: 'button',
				attr: {
					'hidden': 'true'
				},
				on: {
					click: 'layers.back'
				},

				svg: {
					component: 'svg',
					attr: {
						'viewBox': '0 0 24 24',
						'fill': 'none',
						'stroke-width': '1.5',
						'stroke': 'currentColor'
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
		section_2: {
			component: 'section',
			variant: 'align-end',

			menu: {
                component: 'button',
                on: {
                    click: {
                        component: 'modal',
                        variant: 'vertical',

                        label: {
                        	component: 'span',
                        	text: 'theme'
                        },
                        theme: {
                        	component: 'tabs',
                        	items: [
                        		'light',
                        		'default',
                        		'black'
                        	],
                        	value: 'default'
                        },
                        divider: {
                        	component: 'divider'
                        },
                        language: {
							component: 'select',
							on: {
								change: function (name, value) {
									var self = this;

									satus.ajax('_locales/' + this.querySelector('select').value + '/messages.json', function (response) {
										response = JSON.parse(response);

										for (var key in response) {
											satus.locale.strings[key] = response[key].message;
										}

										self.base.skeleton.header.section_1.title.rendered.textContent = satus.locale.get('languages');

										self.base.skeleton.layers.rendered.update();
									});
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
                            }],

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
                            on: {
                                click: function () {
                                    if (location.href.indexOf('/options.html?action=export') !== -1) {
                                        exportData();
                                    } else {
                                        chrome.tabs.create({
                                            url: 'ui/options.html?action=export'
                                        });
                                    }
                                }
                            },

							svg: {
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
							label: {
								component: 'span',
								text: 'export'
							}
						},
						import: {
							component: 'button',
                            on: {
                                click: function () {
                                    if (location.href.indexOf('/options.html?action=import') !== -1) {
                                        importData();
                                    } else {
                                        chrome.tabs.create({
                                            url: 'ui/options.html?action=import'
                                        });
                                    }
                                }
                            },

							svg: {
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
							label: {
								component: 'span',
								text: 'import'
							}
						}
                    }
                },

                svg: {
                    component: 'svg',
                    attr: {
                        'viewBox': '0 0 24 24',
                        'fill': 'currentColor'
                    },

                    circle_1: {
                        component: 'circle',
                        attr: {
                            'cx': '12',
                            'cy': '5.25',
                            'r': '1'
                        }
                    },
                    circle_2: {
                        component: 'circle',
                        attr: {
                            'cx': '12',
                            'cy': '12',
                            'r': '1'
                        }
                    },
                    circle_3: {
                        component: 'circle',
                        attr: {
                            'cx': '12',
                            'cy': '18.75',
                            'r': '1'
                        }
                    }
                }
            }
		}
	},
	layers: {
		component: 'layers',
		on: {
			open: function () {
				var skeleton = this.path[this.path.length - 1],
					parent = skeleton.parent,
					section = this.base.skeleton.header.section_1,
					is_home = this.path.length <= 1,
					title = 'Frame By Frame';

				if (parent) {
					if (parent.label) {
						title = parent.label.text;
					} else if (parent.text) {
						title = parent.text;
					}
				}

				section.back.rendered.hidden = is_home;
				section.title.rendered.innerText = satus.locale.get(title);
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
							value: [0, 0, 0]
						},
						text_color: {
							component: 'color-picker',
							text: 'textColor',
							value: [255, 255, 255]
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
						'fill': 'var(--satus-primary)'
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
				},

				icon: {
					component: 'svg',
					attr: {
						'viewBox': '0 0 24 24',
						'fill': 'var(--satus-primary)'
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
# FUNCTIONS
--------------------------------------------------------------*/

function exportData() {
	if (location.href.indexOf('action=export') !== -1) {
        var blob;

        try {
        	blob = new Blob([JSON.stringify(satus.storage.data)], {
		        type: 'application/json;charset=utf-8'
		    });
        } catch (error) {
        	return modalError(error);
        }

	    satus.render({
	    	component: 'modal',

	    	label: {
	    		component: 'span',
	    		text: 'areYouSureYouWantToExportTheData'
	    	},
	    	actions: {
	    		component: 'section',
	    		variant: 'actions',

	    		ok: {
					component: 'button',
					text: 'ok',
					on: {
						click: function () {
							try {
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
			                	return modalError(error);
			                }

							this.parentNode.parentNode.parentNode.close();
						}
					}
				},
				cancel: {
					component: 'button',
					text: 'cancel',
					on: {
						click: function () {
							this.parentNode.parentNode.parentNode.close();
						}
					}
				}
	    	}
	    });
    }
}

function importData() {
	if (location.href.indexOf('action=import') !== -1) {
        satus.render({
	    	component: 'modal',

	    	label: {
	    		component: 'span',
	    		text: 'areYouSureYouWantToImportTheData'
	    	},
	    	actions: {
	    		component: 'section',
	    		variant: 'actions',

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

			                        close();
			                    };

			                    file_reader.readAsText(this.files[0]);
			                });

			                input.click();

							this.parentNode.parentNode.parentNode.close();
						}
					}
				},
				cancel: {
					component: 'button',
					text: 'cancel',
					on: {
						click: function () {
							this.parentNode.parentNode.parentNode.close();
						}
					}
				}
	    	}
	    });
    }
}


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

satus.storage.attributes = {
    theme: true
};

satus.storage.import(function (items) {
	satus.locale.import(items.language, '../_locales/', function () {
		chrome.tabs.query({
			active: true,
			currentWindow: true
		}, function (tabs) {
			chrome.tabs.sendMessage(tabs[0].id, 'init', function (response) {
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

		exportData();
		importData();
	});
});
