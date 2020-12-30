/*------------------------------------------------------------------------------
>>> Frame By Frame
--------------------------------------------------------------------------------
1.0 Global variables
2.0 Observer
3.0 ui
  3.1 Info
4.0 Mouse
5.0 Keyboard
6.0 Init
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
1.0 GLOBAL VARIABLES
------------------------------------------------------------------------------*/

var elements = {},
    ui = false,
    values = {};

var boundingRects = [],
    mouse = [],
    ui,
    uiInfo,
    activeElement,
    is_autoplay = false;

function isset(variable) {
    if (typeof variable === 'undefined' || variable === null) {
        return false;
    }

    return true;
}


/*------------------------------------------------------------------------------
2.0 OBSERVER
------------------------------------------------------------------------------*/

function observer() {
    if (document.querySelector('video:not(.frame-by-frame)')) {
        var videos = document.querySelectorAll('video:not(.frame-by-frame)');

        for (var i = 0, l = videos.length; i < l; i++) {
            var video = videos[i];

            video.classList.add('frame-by-frame');
            video.dataset.frameByFrameIndex = boundingRects.length;

            boundingRects.push([0, 0, 0, 0]);

            updateMediaEventListeners(video);
        }
    }
}

function mediaPlayEventListenersCallback() {
    updateBoundingRect(this);

    videoDetection(this);

    updateUI();
}

function mediaEventListenersCallback() {
    updateBoundingRect(this);

    updateUI();
}

function updateMediaEventListeners(target) {
    target.removeEventListener('play', mediaPlayEventListenersCallback);
    target.removeEventListener('playing', mediaPlayEventListenersCallback);
    target.removeEventListener('timeupdate', mediaEventListenersCallback);

    target.addEventListener('play', mediaPlayEventListenersCallback);
    target.addEventListener('playing', mediaPlayEventListenersCallback);
    target.addEventListener('timeupdate', mediaEventListenersCallback);
}

function updateBoundingRect(target) {
    var bounding_rect = target.getBoundingClientRect();

    boundingRects[target.dataset.frameByFrameIndex] = [
        bounding_rect.left,
        bounding_rect.top,
        bounding_rect.width,
        bounding_rect.height
    ];

    resizeUI();
}

function updateBoundingRectAll() {
    if (document.querySelector('.frame-by-frame')) {
        var videos = document.querySelectorAll('.frame-by-frame');

        for (var i = 0, l = videos.length; i < l; i++) {
            updateBoundingRect(videos[i]);
        }
    }

    videosDetection();
}

function videoDetection(target) {
    var found = false,
        x = mouse[0],
        y = mouse[1],
        bounding_rect = boundingRects[target.dataset.frameByFrameIndex];

    if (
        x >= bounding_rect[0] &&
        y >= bounding_rect[1] &&
        x < bounding_rect[0] + bounding_rect[2] &&
        y < bounding_rect[1] + bounding_rect[3]
    ) {
        found = target;
    }

    if (found) {
        activeElement = found;

        updateBoundingRect(target);
        resizeUI();

        ui.classList.remove('frame-by-frame--hidden');
    } else if (activeElement) {
        if (is_autoplay) {
            activeElement.play();
        }

        activeElement = undefined;

        ui.classList.add('frame-by-frame--hidden');
    }
}

function videosDetection() {
    if (document.querySelector('.frame-by-frame')) {
        var videos = document.querySelectorAll('.frame-by-frame'),
            found = false,
            x = mouse[0],
            y = mouse[1];

        for (var i = 0, l = videos.length; i < l; i++) {
            var bounding_rect = boundingRects[videos[i].dataset.frameByFrameIndex];

            if (
                x >= bounding_rect[0] &&
                y >= bounding_rect[1] &&
                x < bounding_rect[0] + bounding_rect[2] &&
                y < bounding_rect[1] + bounding_rect[3]
            ) {
                found = videos[i];
            }
        }

        if (found) {
            activeElement = found;

            ui.classList.remove('frame-by-frame--hidden');
        } else if (activeElement) {
            if (is_autoplay) {
                activeElement.play();
            }

            activeElement = undefined;

            ui.classList.add('frame-by-frame--hidden');
        }
    }
}


/*------------------------------------------------------------------------------
3.0 UI
------------------------------------------------------------------------------*/

function createUIItem(name, container) {
    var element = document.createElement('div'),
        element_name = document.createElement('div'),
        element_value = document.createElement('div');

    element.className = 'frame-by-frame__' + name;

    element_name.innerText = name;

    values[name] = element_value;

    element.appendChild(element_name);
    element.appendChild(element_value);

    container.appendChild(element);
}

function createUI() {
    ui = document.createElement('div');

    var container = document.createElement('div');

    ui.className = 'frame-by-frame--ui frame-by-frame--hidden';
    container.className = 'frame-by-frame--container';

    createUIItem('time', container);
    createUIItem('duration', container);
    createUIItem('frame', container);
    createUIItem('next', container);
    createUIItem('prev', container);
    createUIItem('hide', container);

    values.next.innerText = '>';
    values.prev.innerText = '<';
    values.hide.innerText = 'i';

    ui.appendChild(container);
    document.body.appendChild(ui);
}

function resizeUI() {
    if (isset(activeElement)) {
        var bounding_rect = boundingRects[activeElement.dataset.frameByFrameIndex];

        if (!ui || !(ui || {}).parentNode) {
            createUI();
        }

        if (ui.offsetLeft !== bounding_rect[0]) {
            ui.style.left = bounding_rect[0] + 'px';
        }

        if (ui.offsetTop !== bounding_rect[1]) {
            ui.style.top = bounding_rect[1] + 'px';
        }

        if (ui.offsetWidth !== bounding_rect[2]) {
            ui.style.width = bounding_rect[2] + 'px';
        }

        if (ui.offsetHeight !== bounding_rect[3]) {
            ui.style.height = bounding_rect[3] + 'px';
        }
    }
}

function updateUI() {
    if (isset(activeElement)) {
        var duration = activeElement.duration,
            currentTime = activeElement.currentTime,
            frame = 1 / 60;

        if (!ui || !(ui || {}).parentNode) {
            createUI();
        }

        values.time.innerText = currentTime.toFixed(2);
        values.duration.innerText = duration.toFixed(2);
        values.frame.innerText = Math.floor(currentTime / frame) + '/' + Math.floor(duration / frame);
    }
}


/*------------------------------------------------------------------------------
4.0 MOUSE
------------------------------------------------------------------------------*/

window.addEventListener('mousemove', function(event) {
    mouse[0] = event.clientX;
    mouse[1] = event.clientY;

    videosDetection();
});


/*------------------------------------------------------------------------------
5.0 KEYBOARD
------------------------------------------------------------------------------*/

window.addEventListener('keydown', function(event) {
    if (isset(activeElement)) {
        var frame = 1 / 60;

        if (event.shiftKey) {
            frame *= 10;
        }

        if (event.keyCode === 37) {
            if (activeElement.paused === false) {
                activeElement.pause();

                is_autoplay = true;
            }

            activeElement.currentTime = Math.max(0, activeElement.currentTime - frame);
        } else if (event.keyCode === 39) {
            if (activeElement.paused === false) {
                activeElement.pause();

                is_autoplay = true;
            }

            activeElement.currentTime = Math.min(activeElement.duration, activeElement.currentTime + frame);
        } else if (event.keyCode === 73) {
            ui.classList.toggle('frame-by-frame--perm');

            chrome.storage.local.set({
                hidden: ui.classList.contains('frame-by-frame--perm')
            });
        }
    }
}, true);


/*------------------------------------------------------------------------------
5.0 PREVENT KEYBOARD EVENTS
------------------------------------------------------------------------------*/

function preventKeyboardListeners(event) {
    if (activeElement !== undefined) {
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


/*------------------------------------------------------------------------------
6.0 INIT
------------------------------------------------------------------------------*/

window.addEventListener('resize', function() {
    setTimeout(function() {
        updateBoundingRectAll();
    }, 100);
});

window.addEventListener('scroll', updateBoundingRectAll);
window.addEventListener('mousewheel', updateBoundingRectAll);

window.addEventListener('DOMContentLoaded', function() {
    createUI();

    observer();

    setInterval(observer, 1000)
});

chrome.storage.local.get(function(items) {
    if (items.hidden === true) {
        ui.classList.add('frame-by-frame--perm');
    }
});

chrome.storage.onChanged.addListener(function(changes) {
    for (var key in changes) {
        var value = changes[key].newValue;

        if (key === 'hidden') {
            if (value === true) {
                ui.classList.add('frame-by-frame--perm');
            } else {
                ui.classList.remove('frame-by-frame--perm');
            }
        }
    }
});