/*---------------------------------------------------------------
>>> Frame By Frame
-----------------------------------------------------------------
1.0 Global variables
2.0 Observer
3.0 Outline
  3.1 Info
4.0 Mouse
5.0 Keyboard
6.0 Shortcuts
  6.1 Init
  6.2 Keyboard
  6.3 Mouse
7.0 Init
---------------------------------------------------------------*/

/*---------------------------------------------------------------
1.0 GLOBAL VARIABLES
---------------------------------------------------------------*/

var boundingRects = [],
    mouse = [],
    outline,
    outlineInfo,
    activeElement,
    is_autoplay = false,
    fbf_storage = {};

function isset(variable) {
    if (typeof variable === 'undefined' || variable === null) {
        return false;
    }

    return true;
}

/*HTMLMediaElement.prototype.play = (function(original) {
    return function() {
        if (activeElement === this) {
            setTimeout(function(){
                this.pause();
            });
        }
        
        return original.apply(this, arguments);
    };
})(HTMLMediaElement.prototype.play);*/


/*---------------------------------------------------------------
2.0 OBSERVER
---------------------------------------------------------------*/

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

    outline__updateInfo();
}

function mediaEventListenersCallback() {
    updateBoundingRect(this);

    outline__updateInfo();
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

    updateOutline();
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
        updateOutline();

        outline.classList.remove('hidden');
    } else if (activeElement) {
        if (is_autoplay) {
            activeElement.play();
        }

        activeElement = undefined;

        outline.classList.add('hidden');
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

            outline.classList.remove('hidden');
        } else if (activeElement) {
            if (is_autoplay) {
                activeElement.play();
            }

            activeElement = undefined;

            outline.classList.add('hidden');
        }
    }
}


/*---------------------------------------------------------------
3.0 OUTLINE
---------------------------------------------------------------*/

function createOutline() {
    outline = document.createElement('div');
    outlineInfo = document.createElement('div');

    outline.className = 'frame-by-frame--outline hidden';
    outlineInfo.className = 'frame-by-frame--outline-info';

    outline.appendChild(outlineInfo);
    document.body.appendChild(outline);
}

function updateOutline() {
    if (isset(activeElement)) {
        var bounding_rect = boundingRects[activeElement.dataset.frameByFrameIndex];

        if (outline.offsetLeft !== bounding_rect[0]) {
            outline.style.left = bounding_rect[0] + 'px';
        }

        if (outline.offsetTop !== bounding_rect[1]) {
            outline.style.top = bounding_rect[1] + 'px';
        }

        if (outline.offsetWidth !== bounding_rect[2]) {
            outline.style.width = bounding_rect[2] + 'px';
        }

        if (outline.offsetHeight !== bounding_rect[3]) {
            outline.style.height = bounding_rect[3] + 'px';
        }
    }
}


/*---------------------------------------------------------------
3.1 INFO
---------------------------------------------------------------*/

// TODO: polish formatTime()

function formatTime(currentTime, duration) {
    currentTime *= 1000;

    var ms = currentTime % 1000;

    currentTime = (currentTime - ms) / 1000;

    ms = Math.floor(ms);

    if (ms < 10) {
        ms = '00' + ms;
    } else if (ms < 100) {
        ms = '0' + ms;
    }

    var ss = currentTime % 60;

    currentTime = (currentTime - ss) / 60;

    if (ss < 10) {
        ss = '0' + ss;
    }

    var mm = currentTime % 60;

    var hh = (currentTime - mm) / 60;

    if (mm < 10) {
        mm = '0' + mm;
    }

    if (hh < 10) {
        hh = '0' + hh;
    }

    if (duration < 60) {
        return ss + '.' + ms;
    } else if (duration < 3600) {
        return mm + ':' + ss + '.' + ms;
    } else {
        return hh + ':' + mm + ':' + ss + '.' + ms;
    }
}

function outline__updateInfo() {
    if (isset(activeElement)) {
        var duration = activeElement.duration,
            currentTime = activeElement.currentTime;

        outlineInfo.innerText = 'time: ' + formatTime(currentTime, duration) +
            '\n duration: ' + formatTime(duration, duration) +
            '\n frame: ' + Math.floor(currentTime / (1 / 30)) + ' / ' + Math.floor(duration / (1 / 30));
    }
}


/*---------------------------------------------------------------
4.0 MOUSE
---------------------------------------------------------------*/

window.addEventListener('mousemove', function(event) {
    mouse[0] = event.clientX;
    mouse[1] = event.clientY;

    videosDetection();
});


/*---------------------------------------------------------------
5.0 KEYBOARD
---------------------------------------------------------------*/

function preventKeyboardListeners(event) {
    if (activeElement !== undefined) {
        if (event.keyCode === 37 || event.keyCode === 39) {
            event.preventDefault();
            event.stopPropagation();

            return false;
        }
    }
}

window.addEventListener('keydown', function(event) {
    if (isset(activeElement)) {
        var frame = 1 / 30;

        if (event.shiftKey) {
            frame *= 5;
        }

        if (event.keyCode === 37 && isset(fbf_storage.shortcut_previous_frame) === false) {
            if (activeElement.paused === false) {
                activeElement.pause();

                is_autoplay = true;
            }

            activeElement.currentTime = Math.max(0, activeElement.currentTime - frame);
        } else if (event.keyCode === 39 && isset(fbf_storage.shortcut_next_frame) === false) {
            if (activeElement.paused === false) {
                activeElement.pause();

                is_autoplay = true;
            }

            activeElement.currentTime = Math.min(activeElement.duration, activeElement.currentTime + frame);
        }
    }
}, true);


/*---------------------------------------------------------------
6.0 SHORTCUTS
---------------------------------------------------------------*/

function frameByframeShortcuts() {
    var self = this,
        keys = {},
        wheel = 0,
        hover = false;


    /*-----------------------------------------------------------
    6.1 INIT
    -----------------------------------------------------------*/

    function start(type = 'keys') {
        if (document.activeElement && ['EMBED', 'INPUT', 'OBJECT', 'TEXTAREA', 'IFRAME'].indexOf(document.activeElement.tagName) !== -1 || event.target.isContentEditable) {
            return false;
        }

        var features = {
            shortcut_previous_frame: function() {
                if (isset(activeElement)) {
                    var frame = 1 / 30;

                    if (activeElement.paused === false) {
                        activeElement.pause();

                        is_autoplay = true;
                    }

                    activeElement.currentTime = Math.max(0, activeElement.currentTime - frame);
                }
            },
            shortcut_next_frame: function() {
                if (isset(activeElement)) {
                    var frame = 1 / 30;

                    if (activeElement.paused === false) {
                        activeElement.pause();

                        is_autoplay = true;
                    }

                    activeElement.currentTime = Math.min(activeElement.duration, activeElement.currentTime + frame);
                }
            }
        };

        for (var i in features) {
            if (fbf_storage[i]) {
                var data = JSON.parse(fbf_storage[i]) || {};

                if (
                    (data.key === keys.key || !self.isset(data.key)) &&
                    (data.shiftKey === keys.shiftKey || !self.isset(data.shiftKey)) &&
                    (data.ctrlKey === keys.ctrlKey || !self.isset(data.ctrlKey)) &&
                    (data.altKey === keys.altKey || !self.isset(data.altKey)) &&
                    ((data.wheel > 0) === (wheel > 0) || !self.isset(data.wheel))
                ) {
                    if (type === 'wheel' && self.isset(data.wheel) || type === 'keys') {
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    console.log(data, keys);

                    features[i]();

                    if (type === 'wheel' && self.isset(data.wheel) || type === 'keys') {
                        return false;
                    }
                }
            }
        }
    }


    /*-----------------------------------------------------------
    6.2 KEYBOARD
    -----------------------------------------------------------*/

    window.addEventListener('keydown', function(event) {
        keys = {
            key: event.key,
            keyCode: event.keyCode,
            shiftKey: event.shiftKey,
            ctrlKey: event.ctrlKey,
            altKey: event.altKey
        };

        start();
    }, true);

    window.addEventListener('keyup', function(event) {
        keys = {};
    }, true);


    /*-----------------------------------------------------------
    6.3 MOUSE
    -----------------------------------------------------------*/

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


/*---------------------------------------------------------------
7.0 INIT
---------------------------------------------------------------*/

window.addEventListener('resize', updateBoundingRectAll);
window.addEventListener('scroll', updateBoundingRectAll);
window.addEventListener('mousewheel', updateBoundingRectAll);

window.addEventListener('keydown', preventKeyboardListeners, true);
window.addEventListener('keyup', preventKeyboardListeners, true);
window.addEventListener('keypress', preventKeyboardListeners, true);

window.addEventListener('DOMContentLoaded', function() {
    frameByframeShortcuts();
    createOutline();

    setInterval(observer, 250);
});

chrome.storage.local.get(function(items) {
    fbf_storage = items;

    for (var key in items) {
        document.documentElement.setAttribute('fbf-' + key.replace(/_/g, '-'), items[key]);
    }
});