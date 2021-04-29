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

var active = false,
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
    createUserInterfaceItem('next', info_panel);
    createUserInterfaceItem('prev', info_panel);
    createUserInterfaceItem('hide', info_panel);

    ui.next.innerText = '>';
    ui.prev.innerText = '<';
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

    console.log(scroll);

    calcPositions();
    updateSleepingMode();
    checkMouse();
});


/*------------------------------------------------------------------------------
# KEYBOARD
------------------------------------------------------------------------------*/

window.addEventListener('keydown', function(event) {
    if (active) {
        var video = active.element,
            frame = 1 / 60;

        if (event.shiftKey) {
            frame *= 10;
        }

        if (event.keyCode === 37) {
            if (video.paused === false) {
                video.pause();

                is_autoplay = true;
            }

            video.currentTime = Math.max(0, video.currentTime - frame);
        } else if (event.keyCode === 39) {
            if (video.paused === false) {
                video.pause();

                is_autoplay = true;
            }

            video.currentTime = Math.min(video.duration, video.currentTime + frame);
        } else if (event.keyCode === 73) {
            ui.info_panel.classList.toggle('frame-by-frame__info-panel--collapsed');

            chrome.storage.local.set({
                hidden: ui.info_panel.classList.contains('frame-by-frame__info-panel--collapsed')
            });
        }

        updateSleepingMode();
    }
}, true);


/*------------------------------------------------------------------------------
# PREVENT KEYBOARD EVENTS
------------------------------------------------------------------------------*/

function preventKeyboardListeners(event) {
    if (active) {
        if (event.keyCode === 37 || event.keyCode === 39 || event.keyCode === 73) {
            event.preventDefault();
            event.stopPropagation();

            return false;
        }
    }
}

window.addEventListener('keydown', preventKeyboardListeners, true);
window.addEventListener('keyup', preventKeyboardListeners, true);
window.addEventListener('keypress', preventKeyboardListeners, true);


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
        if (items.hidden === true) {
            ui.info_panel.classList.add('frame-by-frame__info-panel--collapsed')
        }

        if (typeof items.position === 'object') {
            position = items.position;

            moveUserInterface();
        }

        setInterval(searchVideos, 2500);
        setInterval(calcPositions, 1000);
        setInterval(checkMouse, 100);
    });
});

chrome.storage.onChanged.addListener(function(changes) {
    for (var key in changes) {
        var value = changes[key].newValue;

        if (key === 'hidden') {
            if (value === true) {
                ui.info_panel.classList.add('frame-by-frame__info-panel--collapsed')
            } else {
                ui.info_panel.classList.remove('frame-by-frame__info-panel--collapsed')
            }
        } else if (key === 'position') {
            position = value;

            console.log(value);

            moveUserInterface();
        }
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    sendResponse(location.hostname);
});