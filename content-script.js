/*--------------------------------------------------------------
>>> FRAME BY FRAME
----------------------------------------------------------------
# Global variable
# Message
    # Listener
    # Sent
# Storage
    # Get
    # Set
    # Import
    # On changed
# Localization
    # Get
    # Import
# Events
    # Create
    # Remove
    # Check active element
    # Features
    # Handler
    # Keyboard
    # Mouse
# Cursor
# Mutation observer
# Videos
    # Add
    # Remove
    # Check
# User interface
    # Create
    # Append
# Initialization
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/

var extension = {
    hostname: location.hostname,
    action: 0,
    framerate: 60
};








/*--------------------------------------------------------------
# MESSAGE
--------------------------------------------------------------*/

extension.message = {};


/*--------------------------------------------------------------
# LISTENER
--------------------------------------------------------------*/

extension.message.listener = function (callback) {
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        if (message === 'init') {
            if (window === window.top) {
                sendResponse(extension.hostname);
            }
        }
    });
};


/*--------------------------------------------------------------
# SENT
--------------------------------------------------------------*/

extension.message.sent = function (message, callback) {
    chrome.runtime.sendMessage(message, callback);
};








/*--------------------------------------------------------------
# STORAGE
--------------------------------------------------------------*/

extension.storage = {
    items: {}
};


/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

extension.storage.get = function (key) {
    return this.items[key];
};


/*--------------------------------------------------------------
# SET
--------------------------------------------------------------*/

extension.storage.set = function (key, value) {
    var object = {};

    object[key] = value;

    this.items[key] = value;

    chrome.storage.local.set(object);
};


/*--------------------------------------------------------------
# IMPORT
--------------------------------------------------------------*/

extension.storage.import = function (callback) {
    chrome.storage.local.get(function (items) {
        extension.storage.items = items;

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

        callback(items);
    });
};


/*--------------------------------------------------------------
# ON CHANGED
--------------------------------------------------------------*/

extension.storage.onchanged = function (callback) {
    chrome.storage.onChanged.addListener(function (changes) {
        for (var key in changes) {
            var value = changes[key].newValue;

            extension.storage.items[key] = value;

            if (key === 'framerate') {
                extension.framerate = value;
            }

            callback(key, value);
        }
    });
};








/*--------------------------------------------------------------
# LOCALIZATION
--------------------------------------------------------------*/

extension.locale = {
    message: {}
};


/*--------------------------------------------------------------
# GET
--------------------------------------------------------------*/

extension.locale.get = function (message) {
    return this.message[message] || message;
};


/*--------------------------------------------------------------
# IMPORT
--------------------------------------------------------------*/

extension.locale.import = function () {
    extension.message.sent('get-locale', function (response) {
        extension.locale.message = response;
    });
};








/*--------------------------------------------------------------
# EVENTS
--------------------------------------------------------------*/

extension.events = {
    data: {
        alt: false,
        ctrl: false,
        shift: false,
        keys: {}
    },
    keyboard: {},
    mouse: {},
    clickDrag: {
        x: 0,
        y: 0
    },
    clickResize: {
        x: 0,
        y: 0
    }
};


/*--------------------------------------------------------------
# CREATE
--------------------------------------------------------------*/

extension.events.create = function (target) {
    for (var type in this[target]) {
        document.addEventListener(type, this[target][type], true);
    }
};


/*--------------------------------------------------------------
# REMOVE
--------------------------------------------------------------*/

extension.events.remove = function (target) {
    for (var type in this[target]) {
        document.removeEventListener(type, this[target][type]);
    }
};


/*--------------------------------------------------------------
# CHECK ACTIVE ELEMENT
--------------------------------------------------------------*/

extension.events.checkActiveElement = function () {
    if (
        event.target.isContentEditable ||
        [
            'EMBED',
            'INPUT',
            'OBJECT',
            'TEXTAREA',
            'IFRAME'
        ].includes((document.activeElement || {}).tagName)
    ) {
        return true;
    }
};


/*--------------------------------------------------------------
# FEATURES
--------------------------------------------------------------*/

extension.events.features = {
    increase_framerate: function () {
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
    },
    decrease_framerate: function () {
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
    },
    next_shortcut: function () {
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
    },
    prev_shortcut: function () {
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
    },
    hide_shortcut: function () {
        if (extension.videos.active) {
            extension.ui.actions.toggle();

            extension.ui.sleep();
        }
    }
};


/*--------------------------------------------------------------
# HANDLER
--------------------------------------------------------------*/

extension.events.handler = function () {
    var prevent = false;

    if (extension.ui.classList.contains('frame-by-frame--visible')) {
        for (var key in extension.events.features) {
            var shortcut = extension.storage.items[key];

            if (shortcut) {
                var same_keys = true;

                if (
                    (extension.events.data.alt === shortcut.alt || shortcut.hasOwnProperty('alt') === false) &&
                    (extension.events.data.ctrl === shortcut.ctrl || shortcut.hasOwnProperty('ctrl') === false) &&
                    (extension.events.data.shift === shortcut.shift || shortcut.hasOwnProperty('shift') === false) &&
                    (extension.events.data.wheel === shortcut.wheel || shortcut.hasOwnProperty('wheel') === false)
                ) {
                    for (var code in extension.events.data.keys) {
                        if (!shortcut.keys[code]) {
                            same_keys = false;
                        }
                    }

                    for (var code in shortcut.keys) {
                        if (!extension.events.data.keys[code]) {
                            same_keys = false;
                        }
                    }

                    if (extension.events.data.wheel === 0) {
                        if (same_keys === true) {
                            extension.events.features[key]();

                            prevent = true;
                        }
                    }
                }
            }
        }
    }

    return prevent;
};


/*--------------------------------------------------------------
# KEYBOARD
--------------------------------------------------------------*/

extension.events.keyboard.keydown = function (event) {
    if (extension.events.checkActiveElement()) {
        return false;
    }

    if (event.code === 'AltLeft' || event.code === 'AltRight') {
        extension.events.data.alt = true;
    } else if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
        extension.events.data.ctrl = true;
    } else if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        extension.events.data.shift = true;
    } else {
        extension.events.data.keys[event.keyCode] = true;
    }

    extension.events.data.wheel = 0;

    if (extension.events.handler()) {
        event.preventDefault();
        event.stopPropagation();

        return false;
    }
};

extension.events.keyboard.keyup = function (event) {
    if (extension.events.checkActiveElement()) {
        return false;
    }

    if (event.code === 'AltLeft' || event.code === 'AltRight') {
        extension.events.data.alt = false;
    } else if (event.code === 'ControlLeft' || event.code === 'ControlRight') {
        extension.events.data.ctrl = false;
    } else if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
        extension.events.data.shift = false;
    } else {
        delete extension.events.data.keys[event.keyCode];
    }

    extension.events.data.wheel = 0;
};


/*--------------------------------------------------------------
# MOUSE
--------------------------------------------------------------*/

extension.events.mouse.mouseenter = function (event) {
    extension.cursor.x = event.clientX;
    extension.cursor.y = event.clientY;

    extension.videos.update();
};

extension.events.mouse.mouseleave = function (event) {
    extension.ui.hide();
};

extension.events.mouse.mousemove = function (event) {
    extension.cursor.x = event.clientX;
    extension.cursor.y = event.clientY;

    extension.videos.update();
    extension.ui.update();
    extension.ui.sleep();
};

extension.events.mouse.mousedown = function (event) {
    if (extension.ui.hover(extension.ui.toggle.getBoundingClientRect())) {
        event.preventDefault();
        event.stopPropagation();

        return false;
    }

    if (extension.storage.items.hidden !== true) {
        if (extension.ui.hover(extension.ui.drag.getBoundingClientRect())) {
            event.preventDefault();
            event.stopPropagation();

            extension.action = 2;

            extension.events.clickDrag.x = event.clientX - extension.ui.offsetLeft - extension.ui.surface.offsetLeft - extension.ui.surface.offsetWidth;
            extension.events.clickDrag.y = event.clientY - extension.ui.offsetTop - extension.ui.surface.offsetTop;

            extension.ui.classList.add('frame-by-frame--busy');

            extension.cursor.style.set('grabbing');

            window.addEventListener('mousemove', extension.ui.actions.dragAndDrop);

            return false;
        }

        if (extension.ui.hover(extension.ui.resize.getBoundingClientRect())) {
            event.preventDefault();
            event.stopPropagation();

            extension.action = 3;

            extension.events.clickResize.x = event.clientX - extension.ui.offsetLeft - extension.ui.surface.offsetLeft - extension.ui.surface.offsetWidth;
            extension.events.clickResize.y = event.clientY - extension.ui.offsetTop - extension.ui.surface.offsetTop - extension.ui.surface.offsetHeight;

            extension.ui.classList.add('frame-by-frame--busy');

            window.addEventListener('mousemove', extension.ui.actions.resize);

            return false;
        }
    }
};

extension.events.mouse.mouseup = function (event) {
    if (extension.action === 2) {
        chrome.storage.local.set({
            position: {
                x: extension.ui.surface.offsetLeft,
                y: extension.ui.surface.offsetTop
            }
        });
    } else if (extension.action === 3) {
        chrome.storage.local.set({
            size: {
                width: extension.ui.surface.offsetWidth,
                height: extension.ui.surface.offsetHeight
            }
        });
    }

    extension.action = 0;

    extension.ui.classList.remove('frame-by-frame--busy');

    window.removeEventListener('mousemove', extension.ui.actions.dragAndDrop);
    window.removeEventListener('mousemove', extension.ui.actions.resize);

    extension.cursor.style.reset();

    if (
        extension.ui.hover(extension.ui.toggle.getBoundingClientRect()) ||
        (
            extension.storage.items.hidden !== true &&
            (
                extension.ui.hover(extension.ui.drag.getBoundingClientRect()) ||
                extension.ui.hover(extension.ui.resize.getBoundingClientRect())
            )
        )
    ) {
        event.preventDefault();
        event.stopPropagation();

        return false;
    }
};

extension.events.mouse.click = function (event) {
    if (extension.ui.hover(extension.ui.toggle.getBoundingClientRect())) {
        extension.ui.actions.toggle();
    }

    if (
        extension.ui.hover(extension.ui.toggle.getBoundingClientRect()) ||
        (
            extension.storage.items.hidden !== true &&
            (
                extension.ui.hover(extension.ui.drag.getBoundingClientRect()) ||
                extension.ui.hover(extension.ui.resize.getBoundingClientRect())
            )
        )
    ) {
        event.preventDefault();
        event.stopPropagation();

        return false;
    }
};

extension.events.mouse.scroll = function (event) {
    extension.videos.update();
};

extension.events.mouse.wheel = function (event) {
    if (event.deltaY > 0) {
        extension.events.data.wheel = 1;
    } else {
        extension.events.data.wheel = -1;
    }

    if (extension.events.handler()) {
        event.preventDefault();
    }
};








/*--------------------------------------------------------------
# CURSOR
--------------------------------------------------------------*/

extension.cursor = {
    style: {},
    x: 0,
    y: 0
};

extension.cursor.check = function (video) {
    var DOMRect = video.getBoundingClientRect();

    if (
        this.x > DOMRect.left &&
        this.y > DOMRect.top &&
        this.x < DOMRect.left + DOMRect.width &&
        this.y < DOMRect.top + DOMRect.height
    ) {
        extension.videos.active = video;

        extension.ui.show(DOMRect);

        return true;
    }

    extension.ui.hide();
};

extension.cursor.style.set = function (type) {
    document.documentElement.classList.add('frame-by-frame--' + type);
};

extension.cursor.style.remove = function (type) {
    document.documentElement.classList.remove('frame-by-frame--' + type);
};

extension.cursor.style.reset = function () {
    document.documentElement.classList.remove('frame-by-frame--pointer');
    document.documentElement.classList.remove('frame-by-frame--grab');
    document.documentElement.classList.remove('frame-by-frame--grabbing');
    document.documentElement.classList.remove('frame-by-frame--resize');
};








/*--------------------------------------------------------------
# MUTATION OBSERVER
--------------------------------------------------------------*/

extension.observer = new MutationObserver(function (mutationList) {
    for (var i = 0, l = mutationList.length; i < l; i++) {
        var mutation = mutationList[i];

        if (mutation.type === 'childList') {
            for (var j = 0, k = mutation.addedNodes.length; j < k; j++) {
                extension.observer.parseChildren(mutation.addedNodes[j], function (node) {
                    if (node.nodeName === 'VIDEO') {
                        extension.videos.add(node);
                    }
                });
            }

            for (var j = 0, k = mutation.removedNodes.length; j < k; j++) {
                extension.observer.parseChildren(mutation.removedNodes[j], function (node) {
                    if (node.nodeName === 'VIDEO') {
                        extension.videos.remove(node);
                    }
                });
            }
        }
    }
});

extension.observer.parseChildren = function (node, callback) {
    var children = node.children;

    callback(node);

    if (children) {
        for (var i = 0, l = children.length; i < l; i++) {
            var child = children[i];

            extension.observer.parseChildren(child, callback);
        }
    }
};

extension.observer.query = function () {
    var videos = document.querySelectorAll('video');

    for (var i = 0, l = videos.length; i < l; i++) {
        extension.videos.add(videos[i]);
    }
};

extension.observer.create = function () {
    this.observe(document, {
        childList: true,
        subtree: true
    });
};

extension.observer.remove = function () {
    this.disconnect();
};








/*--------------------------------------------------------------
# VIDEOS
--------------------------------------------------------------*/

extension.videos = [];


/*--------------------------------------------------------------
# ADD
--------------------------------------------------------------*/

extension.videos.add = function (node) {
    if (extension.videos.indexOf(node) === -1) {
        var parent = node.parentNode;

        while (parent && parent !== document.body) {
            parent = parent.parentNode;

            parent.removeEventListener('scroll', extension.videos.update, true);
            parent.addEventListener('scroll', extension.videos.update, true);
        }

        extension.videos.push(node);

        node.addEventListener('resize', function () {
            extension.videos.update(this);
        }, true);

        node.addEventListener('timeupdate', function () {
            extension.ui.update();
        }, true);
    }
};


/*--------------------------------------------------------------
# REMOVE
--------------------------------------------------------------*/

extension.videos.remove = function (node) {
    var index = extension.videos.indexOf(node);

    if (index !== -1) {
        extension.videos.splice(index, 1);
    }
};


/*--------------------------------------------------------------
# UPDATE
--------------------------------------------------------------*/

extension.videos.update = function () {
    for (var i = 0, l = extension.videos.length; i < l; i++) {
        if (extension.cursor.check(extension.videos[i]) === true) {
            return true;
        }
    }

    extension.ui.hide();
};








/*--------------------------------------------------------------
# USER INTERFACE
--------------------------------------------------------------*/

extension.ui = document.createElement('div');


/*--------------------------------------------------------------
# ACTIONS
--------------------------------------------------------------*/

extension.ui.actions = {};


/*--------------------------------------------------------------
# TOGGLE
--------------------------------------------------------------*/

extension.ui.actions.toggle = function () {
    extension.ui.surface.classList.toggle('frame-by-frame__surface--collapsed');

    chrome.storage.local.set({
        hidden: extension.ui.surface.classList.contains('frame-by-frame__surface--collapsed')
    });
};


/*--------------------------------------------------------------
# DRAG
--------------------------------------------------------------*/

extension.ui.actions.dragAndDrop = function (event) {
    var x = event.clientX - extension.ui.offsetLeft - extension.ui.surface.offsetWidth - extension.events.clickDrag.x,
        y = event.clientY - extension.ui.offsetTop - extension.events.clickDrag.y;

    x = Math.max(x, 8);
    y = Math.max(y, 8);

    x = Math.min(x, extension.ui.offsetWidth - extension.ui.surface.offsetWidth - 8);
    y = Math.min(y, extension.ui.offsetHeight - extension.ui.surface.offsetHeight - 8);

    extension.ui.surface.style.setProperty('left', x + 'px', 'important');
    extension.ui.surface.style.setProperty('top', y + 'px', 'important');
};


/*--------------------------------------------------------------
# RESIZE
--------------------------------------------------------------*/

extension.ui.actions.resize = function (event) {
    var width = event.clientX - extension.ui.offsetLeft - extension.ui.surface.offsetLeft - extension.events.clickResize.x,
        height = event.clientY - extension.ui.offsetTop - extension.ui.surface.offsetTop - extension.events.clickResize.y;

    width = Math.max(width, 64);
    height = Math.max(height, 64);

    width = Math.min(width, extension.ui.offsetWidth - extension.ui.surface.offsetLeft - 8);
    height = Math.min(height, extension.ui.offsetHeight - extension.ui.surface.offsetTop - 8);

    extension.ui.surface.style.setProperty('width', width + 'px', 'important');
    extension.ui.surface.style.setProperty('height', height + 'px', 'important');
};


/*--------------------------------------------------------------
# CREATE
--------------------------------------------------------------*/

extension.ui.create = function () {
    var time_container = document.createElement('div'),
        duration_container = document.createElement('div'),
        frame_container = document.createElement('div'),
        framerate_container = document.createElement('div');

    this.surface = document.createElement('div');
    this.toggle = document.createElement('div');
    this.drag = document.createElement('div');
    this.resize = document.createElement('div');
    this.time = document.createElement('div');
    this.duration = document.createElement('div');
    this.frame = document.createElement('div');
    this.framerate = document.createElement('div');

    time_container.className = 'frame-by-frame__container';
    duration_container.className = 'frame-by-frame__container';
    frame_container.className = 'frame-by-frame__container';
    framerate_container.className = 'frame-by-frame__container';

    this.className = 'frame-by-frame';
    this.surface.className = 'frame-by-frame__surface';
    this.toggle.className = 'frame-by-frame__button frame-by-frame__toggle';
    this.drag.className = 'frame-by-frame__button frame-by-frame__drag-and-drop';
    this.resize.className = 'frame-by-frame__button frame-by-frame__resize';
    this.time.className = 'frame-by-frame__value';
    this.duration.className = 'frame-by-frame__value';
    this.frame.className = 'frame-by-frame__value';
    this.framerate.className = 'frame-by-frame__value';

    this.DOMRect = {
        left: 0,
        top: 0,
        width: 0,
        height: 0
    };

    this.surface.update = function () {
        if (extension.storage.items.hidden === true) {
            this.classList.add('frame-by-frame__surface--collapsed');
        } else {
            this.classList.remove('frame-by-frame__surface--collapsed');
        }

        if (extension.storage.items.position) {
            var x = extension.storage.items.position.x,
                y = extension.storage.items.position.y;

            x = Math.max(x, 8);
            y = Math.max(y, 8);

            x = Math.min(x, extension.ui.offsetWidth - this.offsetWidth - 8);
            y = Math.min(y, extension.ui.offsetHeight - this.offsetHeight - 8);

            this.style.setProperty('left', x + 'px', 'important');
            this.style.setProperty('top', y + 'px', 'important');
        }

        if (extension.storage.items.size) {
            var width = extension.storage.items.size.width,
                height = extension.storage.items.size.height;

            width = Math.max(width, 64);
            height = Math.max(height, 64);

            width = Math.min(width, extension.ui.offsetWidth - Math.max(8, this.offsetLeft) - 8);
            height = Math.min(height, extension.ui.offsetHeight - Math.max(8, this.offsetTop) - 8);

            this.style.setProperty('width', width + 'px', 'important');
            this.style.setProperty('height', height + 'px', 'important');
        }
    };

    time_container.appendChild(document.createTextNode(extension.locale.get('time')));
    duration_container.appendChild(document.createTextNode(extension.locale.get('duration')));
    frame_container.appendChild(document.createTextNode(extension.locale.get('frame')));
    framerate_container.appendChild(document.createTextNode(extension.locale.get('framerate')));
    time_container.appendChild(this.time);
    duration_container.appendChild(this.duration);
    frame_container.appendChild(this.frame);
    framerate_container.appendChild(this.framerate);

    this.appendChild(this.surface);
    this.surface.appendChild(this.toggle);
    this.surface.appendChild(this.drag);
    this.surface.appendChild(this.resize);
    this.surface.appendChild(time_container);
    this.surface.appendChild(duration_container);
    this.surface.appendChild(frame_container);
    this.surface.appendChild(framerate_container);
};


/*--------------------------------------------------------------
# UPDATE
--------------------------------------------------------------*/

extension.ui.update = function () {
    var video = extension.videos.active;

    if (video) {
        if (this.classList.contains('frame-by-frame--busy') === false) {
            if (extension.ui.hover(this.surface.getBoundingClientRect())) {
                this.surface.classList.add('frame-by-frame__surface--hover');

                if (extension.ui.hover(this.toggle.getBoundingClientRect())) {
                    this.toggle.classList.add('frame-by-frame__button--hover');

                    extension.cursor.style.set('pointer');
                } else {
                    this.toggle.classList.remove('frame-by-frame__button--hover');
                    
                    extension.cursor.style.remove('pointer');
                }

                if (extension.storage.items.hidden !== true && extension.ui.hover(this.drag.getBoundingClientRect())) {
                    this.drag.classList.add('frame-by-frame__button--hover');

                    extension.cursor.style.set('grab');
                } else {
                    this.drag.classList.remove('frame-by-frame__button--hover');
                    
                    extension.cursor.style.remove('grab');
                }

                if (extension.storage.items.hidden !== true && extension.ui.hover(this.resize.getBoundingClientRect())) {
                    this.resize.classList.add('frame-by-frame__button--hover');

                    extension.cursor.style.set('resize');
                } else {
                    this.resize.classList.remove('frame-by-frame__button--hover');
                    
                    extension.cursor.style.remove('resize');
                }
            } else {
                this.surface.classList.remove('frame-by-frame__surface--hover');
                this.toggle.classList.remove('frame-by-frame__button--hover');
                this.drag.classList.remove('frame-by-frame__button--hover');
                this.resize.classList.remove('frame-by-frame__button--hover');

                extension.cursor.style.reset();
            }
        }

        var framerate = 60;

        if (extension.storage.items.hasOwnProperty('framerate') === true) {
            framerate = extension.storage.get('framerate');
        }

        extension.ui.time.textContent = video.currentTime.toFixed(2);
        extension.ui.duration.textContent = video.duration.toFixed(2);
        extension.ui.frame.textContent = Math.floor(video.currentTime * framerate);
        extension.ui.framerate.textContent = framerate;
    }
};


/*--------------------------------------------------------------
# HOVER
--------------------------------------------------------------*/

extension.ui.hover = function (DOMRect) {
    if (
        extension.cursor.x > DOMRect.left &&
        extension.cursor.y > DOMRect.top &&
        extension.cursor.x < DOMRect.left + DOMRect.width &&
        extension.cursor.y < DOMRect.top + DOMRect.height
    ) {
        return true;
    } else {
        return false
    }
};


/*--------------------------------------------------------------
# SLEEP
--------------------------------------------------------------*/

extension.ui.sleep = function () {
    if (extension.ui.sleepTimeout) {
        extension.ui.classList.remove('frame-by-frame--sleeping-mode');

        clearTimeout(extension.ui.sleepTimeout);
    }

    if (extension.ui) {
        extension.ui.sleepTimeout = setTimeout(function () {
            extension.ui.classList.add('frame-by-frame--sleeping-mode');

            extension.ui.sleepTimeout = false;
        }, 3000);
    }
};


/*--------------------------------------------------------------
# APPEND
--------------------------------------------------------------*/

extension.ui.append = function () {
    if (document.body) {
        document.body.appendChild(this);
    } else {
        new MutationObserver(function (mutationList) {
            for (var i = 0, l = mutationList.length; i < l; i++) {
                var mutation = mutationList[i];

                if (mutation.type === 'childList') {
                    for (var j = 0, k = mutation.addedNodes.length; j < k; j++) {
                        var node = mutation.addedNodes[j];

                        if (node.nodeName === 'BODY') {
                            this.disconnect();

                            node.appendChild(extension.ui);
                        }
                    }
                }
            }
        }).observe(document, {
            childList: true,
            subtree: true
        });
    }
};


/*--------------------------------------------------------------
# STYLES
--------------------------------------------------------------*/

extension.ui.styles = function () {
    var storage = extension.storage.items;

    if (storage.background_color) {
        if (storage.hasOwnProperty('opacity')) {
            this.surface.style.setProperty('background-color', 'rgba(' + storage.background_color.join(',') + ',' + storage.opacity + ')', 'important');
        } else {
            this.surface.style.setProperty('background-color', 'rgba(' + storage.background_color.join(',') + ',0.8)', 'important');
        }
    }

    if (storage.text_color) {
        this.surface.style.setProperty('color', 'rgb(' + storage.text_color.join(',') + ')', 'important');
    }

    if (storage.blur) {
        this.surface.style.setProperty('backdrop-filter', 'blur(' + storage.blur + 'px)', 'important');
    }
};


/*--------------------------------------------------------------
# HIDE
--------------------------------------------------------------*/

extension.ui.hide = function () {
    this.classList.remove('frame-by-frame--visible');
};


/*--------------------------------------------------------------
# SHOW
--------------------------------------------------------------*/

extension.ui.show = function (DOMRect) {
    if (
        DOMRect.left !== this.DOMRect.left ||
        DOMRect.top !== this.DOMRect.top ||
        DOMRect.width !== this.DOMRect.width ||
        DOMRect.height !== this.DOMRect.height
    ) {
        this.style.left = DOMRect.left + 'px';
        this.style.top = DOMRect.top + 'px';
        this.style.width = DOMRect.width + 'px';
        this.style.height = DOMRect.height + 'px';

        this.DOMRect = DOMRect;

        this.surface.update();
    }
    
    this.classList.add('frame-by-frame--visible');
};


/*--------------------------------------------------------------
# DISABLE
--------------------------------------------------------------*/

extension.disable = function () {
    extension.events.remove('mouse');
    extension.events.remove('keyboard');
    extension.observer.remove();
    extension.ui.remove();
};


/*--------------------------------------------------------------
# ENABLE
--------------------------------------------------------------*/

extension.enable = function () {
    extension.events.create('mouse');
    extension.events.create('keyboard');
    extension.observer.create();
    extension.ui.styles();
    extension.ui.append();
};








/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

extension.message.listener();
extension.ui.create();

extension.message.sent('get-tab-url', function (response) {
    extension.hostname = response.url;

    extension.storage.import(function (items) {
        if (!items.domains || items.domains[extension.hostname] !== false) {
            extension.enable();
        }
    });

    extension.locale.import();
});

extension.storage.onchanged(function (key, value) {
    if (key === 'domains') {
        if (value[extension.hostname] !== false) {
            extension.enable();
            extension.observer.query();
        } else {
            extension.disable();
        }
    }

    extension.ui.styles();
});