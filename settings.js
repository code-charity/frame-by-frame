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

        section: {
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
            },
            made_with_love: {
                type: 'button',
                before: '<svg fill="#f08f79" viewBox="0 0 24 24"><path d="M13.35 20.13c-.76.69-1.93.69-2.69-.01l-.11-.1C5.3 15.27 1.87 12.16 2 8.28c.06-1.7.93-3.33 2.34-4.29 2.64-1.8 5.9-.96 7.66 1.1 1.76-2.06 5.02-2.91 7.66-1.1 1.41.96 2.28 2.59 2.34 4.29.14 3.88-3.3 6.99-8.55 11.76l-.1.09z"></svg>',
                onclick: function() {
                    window.open('https://chrome.google.com/webstore/detail/frame-by-frame/cclnaabdfgnehogonpeddbgejclcjneh/reviews');
                }
            }
        }
    },
    main: {
        type: 'main',
        appearanceKey: 'home',
        onchange: function() {
            document.querySelector('.satus-text--title').innerText = satus.locale.getMessage(this.history[this.history.length - 1].label) || menu.header.section.title.label;
        },

        appearance_label: {
            type: 'text',
            variant: 'section-label',
            label: 'Appearance'
        },
        appearance_section: {
            type: 'section',

            info: {
                type: 'button',
                class: 'satus-button--info',
                label: 'Info',
                before: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',

                section: {
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
                }
            },
            sorting: {
                type: 'button',
                class: 'satus-button--sorting',
                label: 'Sorting',
                before: '<svg viewBox="0 0 24 24"><path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z"/></svg>',

                section: {
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
            }
        },
        shortcuts_label: {
            type: 'text',
            variant: 'section-label',
            label: 'Shortcuts'
        },
        shortcuts_section: {
            type: 'section',

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