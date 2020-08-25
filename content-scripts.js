/*------------------------------------------------------------------------------
>>> Frame By Frame
--------------------------------------------------------------------------------
1.0 Global variables
2.0 Observer
3.0 Outline
  3.1 Info
4.0 Mouse
5.0 Keyboard
6.0 Init
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
1.0 GLOBAL VARIABLES
------------------------------------------------------------------------------*/

var boundingRects = [],
    mouse = [],
    outline,
    outlineInfo,
    activeElement;
    
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
            activeElement = undefined;
            
            outline.classList.add('hidden');
        }
    }
}


/*------------------------------------------------------------------------------
3.0 OUTLINE
------------------------------------------------------------------------------*/

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

/*------------------------------------------------------------------------------
3.1 INFO
------------------------------------------------------------------------------*/

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
        if (activeElement.paused === false) {
            activeElement.pause();
        }
        
        var frame = 1 / 30;
        
        if (event.shiftKey) {
            frame *= 5;
        }
        
        if (event.keyCode === 37) {
            activeElement.currentTime = Math.max(0, activeElement.currentTime - frame);
        } else if (event.keyCode === 39) {
            activeElement.currentTime = Math.min(activeElement.duration, activeElement.currentTime + frame);
        }
    }
}, true);


/*------------------------------------------------------------------------------
6.0 INIT
------------------------------------------------------------------------------*/

window.addEventListener('resize', updateBoundingRectAll);
window.addEventListener('scroll', updateBoundingRectAll);
window.addEventListener('mousewheel', updateBoundingRectAll);

window.addEventListener('keydown', preventKeyboardListeners, true);
window.addEventListener('keyup', preventKeyboardListeners, true);
window.addEventListener('keypress', preventKeyboardListeners, true);

window.addEventListener('DOMContentLoaded', function() {
    createOutline();
    
    setInterval(observer, 250);
});
