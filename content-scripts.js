/*------------------------------------------------------------------------------
>>> Frame By Frame
--------------------------------------------------------------------------------
1.0 Global variables
2.0 Observer
3.0 Outline
4.0 Mouse
5.0 Keyboard
6.0 Init
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
1.0 GLOBAL VARIABLES
------------------------------------------------------------------------------*/

var boundingRects = [],
    outline,
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

function mediaEventListenersCallback() {
    updateBoundingRect(this);
}

function updateMediaEventListeners(target) {
    target.addEventListener('play', mediaEventListenersCallback);
    target.addEventListener('playing', mediaEventListenersCallback);
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
}


/*------------------------------------------------------------------------------
3.0 OUTLINE
------------------------------------------------------------------------------*/

function createOutline() {
    outline = document.createElement('div');
    
    outline.className = 'frame-by-frame--outline hidden';
    
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
4.0 MOUSE
------------------------------------------------------------------------------*/

window.addEventListener('mousemove', function(event) {
    var x = event.clientX,
        y = event.clientY;
        
    if (document.querySelector('.frame-by-frame')) {
        var videos = document.querySelectorAll('.frame-by-frame'),
            found = false;
        
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
        
        var frame = 1 / 25;
        
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
