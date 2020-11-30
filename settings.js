/*---------------------------------------------------------------
>>> SETTINGS
-----------------------------------------------------------------
# Menu
# Initialization
---------------------------------------------------------------*/

/*---------------------------------------------------------------
# MENU
---------------------------------------------------------------*/

var menu = {
    header: {
        type: 'header',

        section_start: {
            type: 'section',

            go_back: {
                type: 'button',
                class: 'satus-button--back',
                before: '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M14 18l-6-6 6-6"/></svg>',
                onclick: function() {
                    if (document.querySelector('.satus-dialog__scrim')) {
                        document.querySelector('.satus-dialog__scrim').click();
                    } else {
                        document.querySelector('.satus-main').back();
                    }
                }
            },
            title: {
                type: 'text',
                variant: 'title',
                label: 'Frame By Frame'
            }
        },
        section_end: {
            type: 'section',
            variant: 'align-end',

            vertical_menu: {
                type: 'button',
                before: '<svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="5.25" r="0.45"/><circle cx="12" cy="12" r="0.45"/><circle cx="12" cy="18.75" r="0.45"/></svg>',

                onclick: {
                    type: 'dialog',
                    variant: 'vertical-menu',

                    github: {
                        type: 'button',
                        label: 'GitHub',
                        before: '<svg fill="none" stroke="var(--satus-theme-primary)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>',
                        onclick: function() {
                            window.open('https://github.com/victor-savinov/frame-by-frame/', '_blank');
                        }
                    }
                }
            }
        }
    },
    main: {
        type: 'main',
        appearanceKey: 'home',
        onchange: function() {
            document.querySelector('.satus-text--title').innerText = satus.locale.getMessage(this.history[this.history.length - 1].label) || menu.header.section_start.title.label;
        },

        section: {
            type: 'section',
            variant: 'card',

            appearance: {
                type: 'button',
                label: 'Appearance',
                before: '<svg fill="none" stroke="var(--satus-theme-primary)" stroke-width="1.75" viewBox="0 0 24 24"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>',

                text_statistics: {
                    type: 'text',
                    variant: 'section-label',
                    label: 'Statistics'
                },
                section_statistics: {
                    type: 'section',
                    variant: 'card',

                    font_size: {
                        type: 'select',
                        label: 'Font size',
                        value: 'medium',

                        options: [{
                            label: 'Small',
                            value: 'small'
                        }, {
                            label: 'Medium',
                            value: 'medium'
                        }, {
                            label: 'Large',
                            value: 'large'
                        }]
                    },
                    background_color: {
                        type: 'color-picker',
                        label: 'Background color'
                    }
                },
                text_items: {
                    type: 'text',
                    variant: 'section-label',
                    label: 'Items'
                },
                section_items: {
                    type: 'section',
                    variant: 'card',

                    sortable_list: {
                        type: 'list',
                        compact: true,
                        sortable: true,

                        time: {
                            type: 'button',
                            label: 'Time'
                        },
                        duration: {
                            type: 'button',
                            label: 'Duration'
                        },
                        frame: {
                            type: 'button',
                            label: 'Frame'
                        }
                    }
                }
            },
            shortcuts: {
                type: 'button',
                label: 'Shortcuts',
                before: '<svg fill="none" stroke="var(--satus-theme-primary)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><path d="M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3H6a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3h12a3 3 0 003-3 3 3 0 00-3-3z"/></svg>',

                section: {
                    type: 'section',
                    variant: 'card',

                    shortcut_previous_frame: {
                        type: 'shortcut',
                        label: 'Previous frame',
                        value: {
                            key: 'ArrowLeft'
                        }
                    },
                    shortcut_next_frame: {
                        type: 'shortcut',
                        label: 'Next frame',
                        value: {
                            key: 'ArrowRight'
                        }
                    }
                }
            },
            settings: {
                type: 'button',
                label: 'Settings',
                before: '<svg fill="none" stroke="var(--satus-theme-primary)" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',

                section: {
                    type: 'section',
                    variant: 'card'
                }
            }
        }
    }
};


/*---------------------------------------------------------------
# INITIALIZATION
---------------------------------------------------------------*/

satus.storage.import(function(items) {
    satus.locale.import(items.language, function() {
        satus.updateStorageKeys(menu, function() {
            satus.render(menu, document.body);
        });
    });
});