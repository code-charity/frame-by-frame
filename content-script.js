/*--------------------------------------------------------------
>>> TABLE OF CONTENTS:
----------------------------------------------------------------
# Global variable
# User interface
# Observer
# Keyboard
# Mouse
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLES
--------------------------------------------------------------*/

var extension = {
        handlers: {},
        videos: [],
        rects: [],
        mouse: {
            x: 0,
            y: 0
        },
    },
    tab_url = location.hostname,
    storage = {},
    ui = {},
    media = [],
    mouse = {
        x: 0,
        y: 0
    },
    scroll = {
        x: 0,
        y: 0
    },
    position = {
        x: 0,
        y: 0
    },
    changing = false,
    sleeping_mode = false;


function isset(variable) {
    return !(typeof variable === 'undefined' || variable === null);
}


/*--------------------------------------------------------------
# USER INTERFACE
--------------------------------------------------------------*/

function createUserInterfaceItem(name, container) {
    var element = document.createElement('div'),
        element_name = document.createElement('div'),
        element_value = document.createElement('div');

    element.className = 'frame-by-frame__' + name;

    element_name.innerText = chrome.i18n.getMessage(name);

    ui[name] = element_value;

    element.appendChild(element_name);
    element.appendChild(element_value);

    container.appendChild(element);
}

function createUserInterface() {
    var container = document.createElement('div'),
        info_panel = document.createElement('div'),
        show_hide_button = document.createElement('div'),
        drag_and_drop_button = document.createElement('div');

    container.className = 'frame-by-frame';
    info_panel.className = 'frame-by-frame__info-panel';
    show_hide_button.className = 'frame-by-frame__show-hide';
    drag_and_drop_button.className = 'frame-by-frame__drag-and-drop';

    show_hide_button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg>';
    drag_and_drop_button.innerHTML = '<svg viewBox="0 0 24 24"><path d="M10 9h4V6h3l-5-5-5 5h3v3zm-1 1H6V7l-5 5 5 5v-3h3v-4zm14 2l-5-5v3h-3v4h3v3l5-5zm-9 3h-4v3H7l5 5 5-5h-3v-3z"/></svg>';

    show_hide_button.addEventListener('click', function () {
        this.parentNode.classList.toggle('frame-by-frame__info-panel--collapsed');

        chrome.storage.local.set({
            hidden: this.parentNode.classList.contains('frame-by-frame__info-panel--collapsed')
        });
    });

    function mousemove(event) {
        var x = event.clientX - ui.info_panel.offsetWidth - ui.container.offsetLeft,
            y = event.clientY - ui.container.offsetTop;

        event.preventDefault();

        if (x < -1) {
            x = -1;
        } else if (x + ui.info_panel.offsetWidth > ui.container.offsetWidth - 1) {
            x = ui.container.offsetWidth - ui.info_panel.offsetWidth - 1;
        }

        if (y < -1) {
            y = -1;
        } else if (y + ui.info_panel.offsetHeight > ui.container.offsetHeight - 1) {
            y = ui.container.offsetHeight - ui.info_panel.offsetHeight - 1;
        }

        position.x = event.clientX;
        position.y = event.clientY;

        ui.info_panel.style.left = x + 'px';
        ui.info_panel.style.top = y + 'px';

        return false;
    }

    function mouseup(event) {
        window.removeEventListener('mousemove', mousemove);
        window.removeEventListener('mouseup', mouseup);

        ui.container.classList.remove('frame-by-frame--dragging');

        chrome.storage.local.set({
            position: position
        }, function () {
            changing = false;
        });
    }

    drag_and_drop_button.addEventListener('mousedown', function (event) {
        event.preventDefault();

        ui.container.classList.add('frame-by-frame--dragging');
        changing = true;

        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);
    });

    ui.container = container;
    ui.info_panel = info_panel;

    createUserInterfaceItem('time', info_panel);
    createUserInterfaceItem('duration', info_panel);
    createUserInterfaceItem('frame', info_panel);

    info_panel.appendChild(show_hide_button);
    info_panel.appendChild(drag_and_drop_button);
    container.appendChild(info_panel);
    document.body.appendChild(container);
}

function moveUserInterface() {
    var x = position.x - ui.info_panel.offsetWidth - ui.container.offsetLeft,
        y = position.y - ui.container.offsetTop;

    if (x < -1) {
        x = -1;
    } else if (x + ui.info_panel.offsetWidth > ui.container.offsetWidth - 1) {
        x = ui.container.offsetWidth - ui.info_panel.offsetWidth - 1;
    }

    if (y < -1) {
        y = -1;
    } else if (y + ui.info_panel.offsetHeight > ui.container.offsetHeight - 1) {
        y = ui.container.offsetHeight - ui.info_panel.offsetHeight - 1;
    }

    ui.info_panel.style.left = x + 'px';
    ui.info_panel.style.top = y + 'px';
}

function updateUserInterface() {
    if (extension.video) {
        var duration = extension.video.duration,
            currentTime = extension.video.currentTime,
            frame = 1 / 60;

        ui.time.innerText = currentTime.toFixed(2);
        ui.duration.innerText = duration.toFixed(2);
        ui.frame.innerText = Math.floor(currentTime / frame) + '/' + Math.floor(duration / frame);
    }
}

function updateSleepingMode() {
    if (sleeping_mode) {
        ui.container.classList.remove('frame-by-frame--sleeping-mode');

        clearTimeout(sleeping_mode);
    }

    if (ui.container) {
        sleeping_mode = setTimeout(function () {
            ui.container.classList.add('frame-by-frame--sleeping-mode');

            sleeping_mode = false;
        }, 3000);
    }
}


/*--------------------------------------------------------------
# OBSERVER
--------------------------------------------------------------*/

extension.observer = function () {
    this.observer = new MutationObserver(function (mutationList) {
        for (var i = 0, l = mutationList.length; i < l; i++) {
            var mutation = mutationList[i];

            if (mutation.type === 'childList') {
                for (var j = 0, k = mutation.addedNodes.length; j < k; j++) {
                    extension.handlers.child('added', mutation.addedNodes[j]);
                }

                for (var j = 0, k = mutation.removedNodes.length; j < k; j++) {
                    extension.handlers.child('removed', mutation.removedNodes[j]);
                }
            }
        }
    })

    this.observer.observe(document, {
        childList: true,
        subtree: true
    });
};


/*--------------------------------------------------------------
# HANDLERS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# CHILD
--------------------------------------------------------------*/

extension.handlers.child = function (type, element) {
    var children = element.children;

    extension.handlers.video(type, element);

    if (children) {
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i];

            extension.handlers.child(type, child);
        }
    }
};


/*--------------------------------------------------------------
# VIDEO
--------------------------------------------------------------*/

extension.handlers.video = function (type, element) {
    if (element.nodeName === 'VIDEO') {
        var index = extension.videos.indexOf(element);

        if (type === 'added') {
            if (index === -1) {
                extension.videos.push(element);
                extension.rects.push(element.getBoundingClientRect());

                element.addEventListener('timeupdate', updateUserInterface);

                element.addEventListener('resize', function () {
                    extension.rects[extension.videos.indexOf(this)] = element.getBoundingClientRect();
                });
            }
        } else if (type === 'removed') {
            if (index !== -1) {
                extension.videos.splice(index, 1);
                extension.rects.splice(index, 1);
            }
        }
    }
};


/*------------------------------------------------------------------------------
# KEYBOARD
------------------------------------------------------------------------------*/

function keyboard() {
    var data = {
            alt: false,
            ctrl: false,
            shift: false,
            keys: {},
            wheel: 0
        },
        hover = false,
        features = {
            next_shortcut: function () {
                console.log(0);
                if (extension.video) {
                    var video = extension.video,
                        frame = 1 / 60;

                    if (event.shiftKey) {
                        frame *= 10;
                    }

                    if (video.paused === false) {
                        video.pause();

                        is_autoplay = true;
                    }

                    video.currentTime = Math.min(video.duration, video.currentTime + frame);

                    updateSleepingMode();
                }
            },
            prev_shortcut: function () {
                if (extension.video) {
                    var video = extension.video,
                        frame = 1 / 60;

                    if (event.shiftKey) {
                        frame *= 10;
                    }

                    if (video.paused === false) {
                        video.pause();

                        is_autoplay = true;
                    }

                    video.currentTime = Math.min(video.duration, video.currentTime - frame);

                    updateSleepingMode();
                }
            },
            hide_shortcut: function () {
                if (extension.video) {
                    chrome.storage.local.set({
                        hidden: ui.info_panel.classList.contains('frame-by-frame__info-panel--collapsed')
                    });

                    updateSleepingMode();
                }
            }
        };

    function handler() {
        var prevent = false;

        for (var key in features) {
            var shortcut = storage[key];

            if (shortcut) {
                var same_keys = true;

                if (
                    (data.alt === shortcut.alt || shortcut.hasOwnProperty('alt') === false) &&
                    (data.ctrl === shortcut.ctrl || shortcut.hasOwnProperty('ctrl') === false) &&
                    (data.shift === shortcut.shift || shortcut.hasOwnProperty('shift') === false) &&
                    (data.wheel === shortcut.wheel || shortcut.hasOwnProperty('wheel') === false)
                ) {
                    for (var code in data.keys) {
                        if (!shortcut.keys[code]) {
                            same_keys = false;
                        }
                    }
                    for (var code in shortcut.keys) {
                        if (!data.keys[code]) {
                            same_keys = false;
                        }
                    }

                    if (data.wheel === 0 || data.player === true) {
                        if (same_keys === true) {
                            features[key]();

                            prevent = true;
                        }
                    }
                }
            }
        }

        return prevent;
    }

    window.addEventListener('keydown', function (event) {
        if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].indexOf(document.activeElement.tagName) !== -1 || event.target.isContentEditable) {
            return false;
        }

        if (event.code === 'AltLeft' || event.code === 'AltRight') {
            data.alt = true;
        } else if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
            data.ctrl = true;
        } else if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            data.shift = true;
        } else {
            data.keys[event.keyCode] = true;
        }

        data.wheel = 0;

        if (handler() === true) {
            event.preventDefault();
        }
    }, true);

    window.addEventListener('keyup', function (event) {
        if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].indexOf(document.activeElement.tagName) !== -1 || event.target.isContentEditable) {
            return false;
        }

        if (event.code === 'AltLeft' || event.code === 'AltRight') {
            data.alt = false;
        } else if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
            data.ctrl = false;
        } else if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            data.shift = false;
        } else {
            delete data.keys[event.keyCode];
        }

        data.wheel = 0;
    }, true);

    window.addEventListener('wheel', function (event) {
        if (event.deltaY > 0) {
            data.wheel = 1;
        } else {
            data.wheel = -1;
        }

        if (handler() === true) {
            event.preventDefault();
        }
    }, {
        passive: false,
        capture: true
    });
}


/*--------------------------------------------------------------
# CONTROLS
--------------------------------------------------------------*/

extension.cursor = function () {
    var x = extension.mouse.x,
        y = extension.mouse.y;

    extension.collised = false;
    extension.video = false;

    for (var i = 0, l = extension.rects.length; i < l; i++) {
        var rect = extension.rects[i];

        if (x > rect.left && y > rect.top) {
            if (x < rect.left + rect.width && y < rect.top + rect.height) {
                extension.collised = rect;

                extension.video = extension.videos[i];
            }
        }
    }

    if (ui.container) {
        if (extension.collised) {
            ui.container.style.display = 'block';
            ui.container.style.left = extension.collised.left + 'px';
            ui.container.style.top = extension.collised.top + 'px';
            ui.container.style.width = extension.collised.width + 'px';
            ui.container.style.height = extension.collised.height + 'px';
            moveUserInterface();
        } else {
            ui.container.style.display = '';
        }
    }
};

extension.update = function () {
    for (var i = 0, l = extension.rects.length; i < l; i++) {
        extension.rects[i] = extension.videos[i].getBoundingClientRect();
    }
};

window.addEventListener('mousemove', function (event) {
    extension.mouse.x = event.clientX;
    extension.mouse.y = event.clientY;

    extension.cursor();
    updateSleepingMode();
});

window.addEventListener('scroll', function (event) {
    extension.update();
    extension.cursor();
});


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

extension.observer();

function init() {
    createUserInterface();

    chrome.storage.local.get(function (items) {
        storage = items;

        if (items.hidden === true) {
            ui.info_panel.classList.add('frame-by-frame__info-panel--collapsed')
        }

        if (typeof items.position === 'object') {
            position = items.position;

            moveUserInterface();
        }

        if (items[location.hostname] === false) {
            ui.container.style.display = 'none';
        }

        if (items.background_color) {
            ui.info_panel.style.backgroundColor = 'rgb(' + items.background_color.join(',') + ')';
        } else {
            ui.info_panel.style.backgroundColor = '#000';
        }

        if (items.text_color) {
            ui.info_panel.style.color = 'rgb(' + items.text_color.join(',') + ')';
        } else {
            ui.info_panel.style.color = '#fff';
        }

        if (items.hasOwnProperty('opacity')) {
            ui.info_panel.style.opacity = items.opacity;
        } else {
            ui.info_panel.style.opacity = .85;
        }

        if (items.hasOwnProperty('blur')) {
            ui.info_panel.style.backdropFilter = 'blur(' + items.blur + 'px)';
        } else {
            ui.info_panel.style.backdropFilter = 'blur(4px)';
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

        keyboard();
    });

    extension.interval = setInterval(function () {
        extension.update();
        extension.cursor();
    }, 100);
}

chrome.storage.onChanged.addListener(function (changes) {
    for (var key in changes) {
        var value = changes[key].newValue;

        storage[key] = value;

        if (key === 'hidden') {
            if (value === true) {
                ui.info_panel.classList.add('frame-by-frame__info-panel--collapsed')
            } else {
                ui.info_panel.classList.remove('frame-by-frame__info-panel--collapsed')
            }
        } else if (key === 'position') {
            position = value;

            moveUserInterface();
        } else if (key === 'opacity') {
            ui.info_panel.style.opacity = value;
        } else if (key === 'blur') {
            ui.info_panel.style.backdropFilter = 'blur(' + value + 'px)';
        } else if (key === 'background_color') {
            if (value) {
                ui.info_panel.style.backgroundColor = 'rgb(' + value.join(',') + ')';
            } else {
                ui.info_panel.style.backgroundColor = '#000';
            }
        } else if (key === 'text_color') {
            if (value) {
                ui.info_panel.style.backgroundColor = 'rgb(' + value.join(',') + ')';
            } else {
                ui.info_panel.style.backgroundColor = '#fff';
            }
        }

        if (key === location.hostname) {
            if (value === false) {
                ui.container.style.display = 'none';
            } else {
                ui.container.style.display = '';
            }
        }
    }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'init') {
        if (window === window.top) {
            sendResponse(tab_url);
        }
    }
});

chrome.runtime.sendMessage({
    action: 'get-tab-url'
}, function (response) {
    tab_url = response.url;

    if (document.body) {
        init();
    } else {
        window.addEventListener('DOMContentLoaded', init);
    }
});

document.addEventListener('fullscreenchange', function () {
    if (document.fullscreenElement && storage.hide_in_fullscreen === true) {
        ui.info_panel.style.display = 'none';
    } else {
        ui.info_panel.style.display = '';
    }
});