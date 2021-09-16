/*--------------------------------------------------------------
>>> TABLE OF CONTENTS:
----------------------------------------------------------------
# Global variable
# User interface
# Keyboard
# Mouse
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLES
--------------------------------------------------------------*/

var storage = {},
    active = false,
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
    sleeping_mode = false,
    hide_in_fullscreen = false;

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

    show_hide_button.addEventListener('click', function() {
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

        chrome.storage.local.set({
            position: position
        }, function() {
            changing = false;
        });
    }

    drag_and_drop_button.addEventListener('mousedown', function(event) {
        event.preventDefault();

        changing = true;

        window.addEventListener('mousemove', mousemove);
        window.addEventListener('mouseup', mouseup);
    });

    ui.container = container;
    ui.info_panel = info_panel;

    createUserInterfaceItem('time', info_panel);
    createUserInterfaceItem('duration', info_panel);
    createUserInterfaceItem('frame', info_panel);
    createUserInterfaceItem('nextFrame', info_panel);
    createUserInterfaceItem('previousFrame', info_panel);
    createUserInterfaceItem('hide', info_panel);

    ui.nextFrame.innerText = '>';
    ui.previousFrame.innerText = '<';
    ui.hide.innerText = 'i';

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

function resizeUserInterface() {
    var container = ui.container;

    container.style.left = active.left - scroll.x + 'px';
    container.style.top = active.top - scroll.y + 'px';
    container.style.width = active.width + 'px';
    container.style.height = active.height + 'px';
}

function updateUserInterface() {
    if (active) {
        var duration = active.element.duration,
            currentTime = active.element.currentTime,
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
        sleeping_mode = setTimeout(function() {
            ui.container.classList.add('frame-by-frame--sleeping-mode');

            sleeping_mode = false;
        }, 3000);
    }
}


/*--------------------------------------------------------------
# SEARCH VIDEOS
--------------------------------------------------------------*/

function searchVideos() {
    var elements = document.querySelectorAll('video');

    for (var i = 0, l = elements.length; i < l; i++) {
        var founded = false;

        for (var j = 0, k = media.length; j < k; j++) {
            if (elements[i] === media[j].element) {
                founded = true;
            }
        }

        if (founded === false) {
            var data = elements[i].getBoundingClientRect();

            elements[i].addEventListener('timeupdate', updateUserInterface);

            media.push({
                element: elements[i],
                left: data.left,
                top: data.top,
                width: data.width,
                height: data.height
            });
        }
    }
}


/*--------------------------------------------------------------
# CALC POSITIONS
--------------------------------------------------------------*/

function calcPositions() {
    for (var i = 0, l = media.length; i < l; i++) {
        var object = media[i],
            data = object.element.getBoundingClientRect();

        if (data.width !== 0 && data.height !== 0) {
            object.left = data.left + scroll.x;
            object.top = data.top + scroll.y;
            object.width = data.width;
            object.height = data.height;
        }
    }
}


/*--------------------------------------------------------------
# MOUSE
--------------------------------------------------------------*/

function checkMouse() {
    //active = false;

    for (var i = 0, l = media.length; i < l; i++) {
        var rect = media[i];

        if (
            mouse.x + scroll.x > rect.left &&
            mouse.y + scroll.y > rect.top &&
            mouse.x + scroll.x < rect.left + rect.width &&
            mouse.y + scroll.y < rect.top + rect.height
        ) {
            active = rect;
        }
    }

    if (ui.container && changing === false) {
        if (active) {
            resizeUserInterface();
            moveUserInterface();

            setTimeout(function() {
                ui.container.classList.add('frame-by-frame--visible');
            });
        } else {
            ui.container.classList.remove('frame-by-frame--visible');
        }
    }
}

window.addEventListener('mousemove', function(event) {
    mouse.x = event.clientX;
    mouse.y = event.clientY;

    updateSleepingMode();

    checkMouse();
});

window.addEventListener('scroll', function() {
    scroll.x = this.scrollX;
    scroll.y = this.scrollY;

    calcPositions();
    updateSleepingMode();
    checkMouse();
});


/*------------------------------------------------------------------------------
# KEYBOARD
------------------------------------------------------------------------------*/

function keyboard() {
    var keys = {},
        wheel = 0,
        hover = false,
        status_timer,
        features = {
            next_shortcut: function() {
                if (active) {
                    var video = active.element,
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
            prev_shortcut: function() {
                if (active) {
                    var video = active.element,
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
            hide_shortcut: function() {
                if (active) {
                    chrome.storage.local.set({
                        hidden: ui.info_panel.classList.contains('frame-by-frame__info-panel--collapsed')
                    });

                    updateSleepingMode();
                }
            }
        };

    function start(type = 'keys') {
        console.log(features);
        if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].indexOf(document.activeElement.tagName) !== -1 || event.target.isContentEditable) {
            return false;
        }


        for (var i in features) {
            if (isset(storage[i])) {
                var data = JSON.parse(storage[i]);

                if (!data) {
                    if (i === 'next_shortcut') {
                        data = {
                            key: 'ArrowRight'
                        };
                    } else if (i === 'prev_shortcut') {
                        data = {
                            key: 'ArrowLeft'
                        };
                    } else if (i === 'hide_shortcut') {
                        data = {
                            key: 'i'
                        };
                    }
                }

                if (
                    (data.key === keys.key || !isset(data.key)) &&
                    (data.shiftKey === keys.shiftKey || !isset(data.shiftKey)) &&
                    (data.ctrlKey === keys.ctrlKey || !isset(data.ctrlKey)) &&
                    (data.altKey === keys.altKey || !isset(data.altKey)) &&
                    ((data.wheel > 0) === (wheel > 0) || !isset(data.wheel)) &&
                    ((hover === true && (data.wheel > 0) === (wheel > 0) && Object.keys(keys).length === 0 && keys.constructor === Object) || (isset(data.key) || isset(data.altKey) || isset(data.ctrlKey)))
                ) {
                    console.log(data, keys);
                    if (type === 'wheel' && isset(data.wheel) || type === 'keys') {
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    features[i]();

                    if (type === 'wheel' && isset(data.wheel) || type === 'keys') {
                        return false;
                    }
                }
            }
        }

        return true;
    }


    /*-------------------------------------------------------------------------
    1.0 Keyboard
    -------------------------------------------------------------------------*/

    window.addEventListener('keydown', function(event) {
        keys = {
            key: event.key,
            keyCode: event.keyCode,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey
        };

        start();

        if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].indexOf(document.activeElement.tagName) !== -1 || event.target.isContentEditable) {
            return;
        }

        for (var i in features) {
            if (isset(storage[i])) {
                var data = JSON.parse(storage[i]);

                if (!data) {
                    if (i === 'next_shortcut') {
                        data = {
                            key: 'ArrowRight'
                        };
                    } else if (i === 'prev_shortcut') {
                        data = {
                            key: 'ArrowLeft'
                        };
                    } else if (i === 'hide_shortcut') {
                        data = {
                            key: 'i'
                        };
                    }
                }

                if (
                    (data.key === keys.key || !isset(data.key)) &&
                    (data.shiftKey === keys.shiftKey || !isset(data.shiftKey)) &&
                    (data.ctrlKey === keys.ctrlKey || !isset(data.ctrlKey)) &&
                    (data.altKey === keys.altKey || !isset(data.altKey)) &&
                    ((data.wheel > 0) === (wheel > 0) || !isset(data.wheel)) &&
                    ((hover === true && (data.wheel > 0) === (wheel > 0) && Object.keys(keys).length === 0 && keys.constructor === Object) || (isset(data.key) || isset(data.altKey) || isset(data.ctrlKey)))
                ) {
                    if (type === 'wheel' && isset(data.wheel) || type === 'keys') {
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    features[i]();

                    if (type === 'wheel' && isset(data.wheel) || type === 'keys') {
                        return false;
                    }
                }
            }
        }
    }, {
        passive: false,
        capture: true
    });

    window.addEventListener('keyup', function(event) {
        if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].indexOf(document.activeElement.tagName) !== -1 || event.target.isContentEditable) {
            keys = {};

            return true;
        }

        for (var i in features) {
            if (isset(storage[i])) {
                var data = JSON.parse(storage[i]);

                if (!data) {
                    if (i === 'next_shortcut') {
                        data = {
                            key: 'ArrowRight'
                        };
                    } else if (i === 'prev_shortcut') {
                        data = {
                            key: 'ArrowLeft'
                        };
                    } else if (i === 'hide_shortcut') {
                        data = {
                            key: 'i'
                        };
                    }
                }

                if (
                    (data.key === keys.key || !isset(data.key)) &&
                    (data.shiftKey === keys.shiftKey || !isset(data.shiftKey)) &&
                    (data.ctrlKey === keys.ctrlKey || !isset(data.ctrlKey)) &&
                    (data.altKey === keys.altKey || !isset(data.altKey)) &&
                    ((data.wheel > 0) === (wheel > 0) || !isset(data.wheel)) &&
                    ((hover === true && (data.wheel > 0) === (wheel > 0) && Object.keys(keys).length === 0 && keys.constructor === Object) || (isset(data.key) || isset(data.altKey) || isset(data.ctrlKey)))
                ) {
                    if (type === 'wheel' && isset(data.wheel) || type === 'keys') {
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    features[i]();

                    if (type === 'wheel' && isset(data.wheel) || type === 'keys') {
                        keys = {};

                        return false;
                    }
                }
            }
        }

        keys = {};
    }, {
        passive: false,
        capture: true
    });

    window.addEventListener('keypress', function(event) {
        if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].indexOf(document.activeElement.tagName) !== -1 || event.target.isContentEditable) {
            return true;
        }

        for (var i in features) {
            if (isset(storage[i])) {
                var data = JSON.parse(storage[i]);

                if (!data) {
                    if (i === 'next_shortcut') {
                        data = {
                            key: 'ArrowRight'
                        };
                    } else if (i === 'prev_shortcut') {
                        data = {
                            key: 'ArrowLeft'
                        };
                    } else if (i === 'hide_shortcut') {
                        data = {
                            key: 'i'
                        };
                    }
                }

                if (
                    (data.key === keys.key || !isset(data.key)) &&
                    (data.shiftKey === keys.shiftKey || !isset(data.shiftKey)) &&
                    (data.ctrlKey === keys.ctrlKey || !isset(data.ctrlKey)) &&
                    (data.altKey === keys.altKey || !isset(data.altKey)) &&
                    ((data.wheel > 0) === (wheel > 0) || !isset(data.wheel)) &&
                    ((hover === true && (data.wheel > 0) === (wheel > 0) && Object.keys(keys).length === 0 && keys.constructor === Object) || (isset(data.key) || isset(data.altKey) || isset(data.ctrlKey)))
                ) {
                    if (type === 'wheel' && isset(data.wheel) || type === 'keys') {
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    features[i]();

                    if (type === 'wheel' && isset(data.wheel) || type === 'keys') {
                        keys = {};

                        return false;
                    }
                }
            }
        }
    }, {
        passive: false,
        capture: true
    });


    /*-------------------------------------------------------------------------
    2.0 Mouse
    -------------------------------------------------------------------------*/

    window.addEventListener('mousemove', function(event) {
        hover = false;

        for (var i = 0, l = event.path.length; i < l; i++) {
            if (event.path[i].classList && event.path[i].classList.contains('html5-video-player')) {
                hover = true;
            }
        }
    }, {
        passive: false,
        capture: true
    });

    window.addEventListener('wheel', function(event) {
        wheel = event.deltaY;

        start('wheel');
    }, {
        passive: false,
        capture: true
    });
}


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

window.addEventListener('resize', function() {
    setTimeout(function() {
        calcPositions();
        checkMouse();
    }, 250);
});

window.addEventListener('DOMContentLoaded', function() {
    createUserInterface();

    chrome.storage.local.get(function(items) {
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

        if (items.hasOwnProperty('hide_in_fullscreen')) {
            hide_in_fullscreen = items.hide_in_fullscreen;
        }

        if (items.background_color) {
            ui.info_panel.style.backgroundColor = 'rgb(' + items.background_color.rgb.join(',') + ')';
        } else {
            ui.info_panel.style.backgroundColor = '#000';
        }

        if (items.text_color) {
            ui.info_panel.style.color = 'rgb(' + items.text_color.rgb.join(',') + ')';
        } else {
            ui.info_panel.style.color = '#fff';
        }

        if (items.hasOwnProperty('opacity')) {
            ui.info_panel.style.opacity = items.opacity;
        } else {
            ui.info_panel.style.opacity = .85;
        }

        setInterval(searchVideos, 2500);
        setInterval(calcPositions, 1000);
        setInterval(checkMouse, 100);

        keyboard();
    });
});

chrome.storage.onChanged.addListener(function(changes) {
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
        } else if (key === 'hide_in_fullscreen') {
            hide_in_fullscreen = value;
        } else if (key === 'opacity') {
            ui.info_panel.style.opacity = value;
        } else if (key === 'background_color') {
            if (value) {
                ui.info_panel.style.backgroundColor = 'rgb(' + value.rgb.join(',') + ')';
            } else {
                ui.info_panel.style.backgroundColor = '#000';
            }
        } else if (key === 'text_color') {
            if (value) {
                ui.info_panel.style.backgroundColor = 'rgb(' + value.rgb.join(',') + ')';
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

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    sendResponse(location.hostname);
});