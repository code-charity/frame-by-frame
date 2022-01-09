/*--------------------------------------------------------------
>>> EXTENSION FEATURES
----------------------------------------------------------------
# Global variable
# Storage
	# Import
	# Change
# Events
	# Data
	# Features
# User interface
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/

extension.prefix = 'frame-by-frame';

extension.framerate = 60;








/*--------------------------------------------------------------
# STORAGE
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# IMPORT
--------------------------------------------------------------*/

document.addEventListener('storage-import', function () {
	var items = extension.storage.items;

	if (items.hasOwnProperty('increase_framerate') === false) {
        items.increase_framerate = {
            keys: {
                38: {
                    key: 'ArrowUp'
                }
            }
        };
    }

    if (items.hasOwnProperty('decrease_framerate') === false) {
        items.decrease_framerate = {
            keys: {
                40: {
                    key: 'ArrowDown'
                }
            }
        };
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

    if (items.hasOwnProperty('framerate')) {
        extension.framerate = items.framerate;
    }
});


/*--------------------------------------------------------------
# CHANGE
--------------------------------------------------------------*/

document.addEventListener('storage-change', function (event) {
	if (event.detail.key === 'framerate') {
        extension.framerate = event.detail.value;
    }
});








/*--------------------------------------------------------------
# EVENTS
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# DATA
--------------------------------------------------------------*/

extension.events.clickDrag = {
    x: 0,
    y: 0
};

extension.events.clickResize = {
    x: 0,
    y: 0
};


/*--------------------------------------------------------------
# FEATURES
--------------------------------------------------------------*/

extension.events.features.increase_framerate = function () {
    if (extension.videos.active) {
        if (event.shiftKey) {
            extension.framerate += 10;
        } else {
            extension.framerate += 1;
        }

        chrome.storage.local.set({
            framerate: extension.framerate
        });

        extension.ui.update();
        extension.ui.sleep();
    }
};

extension.events.features.decrease_framerate = function () {
    if (extension.videos.active) {
        if (event.shiftKey) {
            extension.framerate -= 10;
        } else {
            extension.framerate -= 1;
        }

        chrome.storage.local.set({
            framerate: extension.framerate
        });

        extension.ui.update();
        extension.ui.sleep();
    }
};

extension.events.features.next_shortcut = function () {
    if (extension.videos.active) {
        var video = extension.videos.active,
            frame = 1 / extension.framerate;

        if (event.shiftKey) {
            frame *= 10;
        }

        if (video.paused === false) {
            video.pause();

            is_autoplay = true;
        }

        video.currentTime = Math.min(video.duration, video.currentTime + frame);

        extension.ui.sleep();
    }
};

extension.events.features.prev_shortcut = function () {
    if (extension.videos.active) {
        var video = extension.videos.active,
            frame = 1 / extension.framerate;

        if (event.shiftKey) {
            frame *= 10;
        }

        if (video.paused === false) {
            video.pause();

            is_autoplay = true;
        }

        video.currentTime = Math.min(video.duration, video.currentTime - frame);

        extension.ui.sleep();
    }
};

extension.events.features.hide_shortcut = function () {
    if (extension.videos.active) {
        extension.ui.actions.toggle();

        extension.ui.sleep();
    }
};








/*--------------------------------------------------------------
# USER INTERFACE
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# CREATE
--------------------------------------------------------------*/

document.addEventListener('ui-create', function (event) {
	var time_container = document.createElement('div'),
        duration_container = document.createElement('div'),
        frame_container = document.createElement('div'),
        framerate_container = document.createElement('div');

    extension.ui.time = document.createElement('div');
    extension.ui.duration = document.createElement('div');
    extension.ui.frame = document.createElement('div');
    extension.ui.framerate = document.createElement('div');

    time_container.className = extension.prefix + '__container';
    duration_container.className = extension.prefix + '__container';
    frame_container.className = extension.prefix + '__container';
    framerate_container.className = extension.prefix + '__container';

    extension.ui.time.className = extension.prefix + '__value';
    extension.ui.duration.className = extension.prefix + '__value';
    extension.ui.frame.className = extension.prefix + '__value';
    extension.ui.framerate.className = extension.prefix + '__value';

    time_container.appendChild(document.createTextNode(extension.locale.get('time')));
    duration_container.appendChild(document.createTextNode(extension.locale.get('duration')));
    frame_container.appendChild(document.createTextNode(extension.locale.get('frame')));
    framerate_container.appendChild(document.createTextNode(extension.locale.get('framerate')));
    time_container.appendChild(extension.ui.time);
    duration_container.appendChild(extension.ui.duration);
    frame_container.appendChild(extension.ui.frame);
    framerate_container.appendChild(extension.ui.framerate);

    extension.ui.surface.appendChild(time_container);
    extension.ui.surface.appendChild(duration_container);
    extension.ui.surface.appendChild(frame_container);
    extension.ui.surface.appendChild(framerate_container);
});


/*--------------------------------------------------------------
# UPDATE
--------------------------------------------------------------*/

document.addEventListener('ui-update', function () {
	var framerate = 60;

    if (extension.storage.items.hasOwnProperty('framerate') === true) {
        framerate = extension.storage.get('framerate');
    }

    extension.ui.time.textContent = extension.videos.active.currentTime.toFixed(2);
    extension.ui.duration.textContent = extension.videos.active.duration.toFixed(2);
    extension.ui.frame.textContent = Math.floor(extension.videos.active.currentTime * framerate);
    extension.ui.framerate.textContent = framerate;
});


/*--------------------------------------------------------------
# STYLES
--------------------------------------------------------------*/

document.addEventListener('ui-styles', function () {
	var storage = extension.storage.items;

    if (storage.background_color) {
        if (storage.hasOwnProperty('opacity')) {
            extension.ui.surface.style.setProperty('background-color', 'rgba(' + storage.background_color.join(',') + ',' + storage.opacity + ')', 'important');
        } else {
            extension.ui.surface.style.setProperty('background-color', 'rgba(' + storage.background_color.join(',') + ',0.8)', 'important');
        }
    }

    if (storage.text_color) {
        extension.ui.surface.style.setProperty('color', 'rgb(' + storage.text_color.join(',') + ')', 'important');
    }

    if (storage.blur) {
        extension.ui.surface.style.setProperty('backdrop-filter', 'blur(' + storage.blur + 'px)', 'important');
    }
});