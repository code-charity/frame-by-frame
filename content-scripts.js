/*------------------------------------------------------------------------------
>>> Frame By Frame
--------------------------------------------------------------------------------
1.0 Variables
2.0 Observer
3.0 Resize
4.0 Mouse & keyboard
5.0 Init
------------------------------------------------------------------------------*/

/*------------------------------------------------------------------------------
1.0 VARIABLES
------------------------------------------------------------------------------*/

var boundingRects = {},
    activeVideo = false,
    index = 0;


/*------------------------------------------------------------------------------
2.0 OBSERVER
------------------------------------------------------------------------------*/

function observer() {
    if (document.querySelector('video:not(.frame-by-frame)')) {
        var videos = document.querySelectorAll('video:not(.frame-by-frame)');
        
        for (var i = 0, l = videos.length; i < l; i++) {
            videos[i].dataset.frameByFrameIndex = index;
            videos[i].classList.add('frame-by-frame');
            
            resize(videos[i]);
            
            videos[i].addEventListener('play', function() {
                resize(this);
            });
            
            videos[i].addEventListener('playing', function() {
                resize(this);
            });
            
            videos[i].addEventListener('timeupdate', function() {
                resize(this);
            });
            
            //console.log(videos[i]);
            
            index++;
        }
    }
}


/*------------------------------------------------------------------------------
3.0 RESIZE
------------------------------------------------------------------------------*/

function resize(target) {
    var bounding_rect = target.getBoundingClientRect(),
        outline = document.querySelector('.frame-by-frame--outline');
    
    boundingRects[target.dataset.frameByFrameIndex] = {
        left: bounding_rect.left,
        top: bounding_rect.top,
        width: bounding_rect.width,
        height: bounding_rect.height
    };
    
    if (outline.offsetLeft !== bounding_rect.left) {
        outline.style.left = bounding_rect.left + 'px';
    }
    
    if (outline.offsetTop !== bounding_rect.top) {
        outline.style.top = bounding_rect.top + 'px';
    }
    
    if (outline.offsetWidth !== bounding_rect.width) {
        outline.style.width = bounding_rect.width + 'px';
    }
    
    if (outline.offsetHeight !== bounding_rect.height) {
        outline.style.height = bounding_rect.height + 'px';
    }
}

window.addEventListener('resize', function () {
    if (document.querySelector('.frame-by-frame')) {
        var videos = document.querySelectorAll('.frame-by-frame');
        
        for (var i = 0, l = videos.length; i < l; i++) {
            resize(videos[i]);
        }
    }
});

window.addEventListener('scroll', function () {
    if (document.querySelector('.frame-by-frame')) {
        var videos = document.querySelectorAll('.frame-by-frame');
        
        for (var i = 0, l = videos.length; i < l; i++) {
            resize(videos[i]);
        }
    }
});


/*------------------------------------------------------------------------------
4.0 MOUSE & KEYBOARD
------------------------------------------------------------------------------*/

/*HTMLMediaElement.prototype.play = (function(original) {
    return function() {
        if (activeVideo === this) {
            setTimeout(function(){
                this.pause();
            });
        }
        
        return original.apply(this, arguments);
    };
})(HTMLMediaElement.prototype.play);*/

window.addEventListener('mousemove', function(event) {
    var x = event.clientX,
        y = event.clientY;
        
    if (document.querySelector('.frame-by-frame')) {
        var videos = document.querySelectorAll('.frame-by-frame'),
            found = false,
            outline = document.querySelector('.frame-by-frame--outline');
        
        for (var i = 0, l = videos.length; i < l; i++) {
            var bounding_rect = boundingRects[videos[i].dataset.frameByFrameIndex];
            
            if (
                x >= bounding_rect.left &&
                y >= bounding_rect.top &&
                x < bounding_rect.left + bounding_rect.width &&
                y < bounding_rect.top + bounding_rect.height
            ) {
                found = videos[i];
            }
        }
        
        if (found) {
            activeVideo = found;
            
            outline.classList.remove('hidden');
        } else if (activeVideo) {
            activeVideo = false;
            
            outline.classList.add('hidden');
        }
    }
});

window.addEventListener('keydown', function(event) {
    if (activeVideo && activeVideo !== undefined) {
        if (activeVideo.paused === false) {
            activeVideo.pause();
        }
        
        if (event.keyCode === 37) {
            activeVideo.currentTime = Math.max(0, activeVideo.currentTime - 1 / 25);
        } else if (event.keyCode === 39) {
            activeVideo.currentTime = Math.min(activeVideo.duration, activeVideo.currentTime + 1 / 25);
        }
    }
}, true);

function prevent(event) {
    if (
        activeVideo && activeVideo !== undefined &&
        (event.keyCode === 37 || event.keyCode === 39)
    ) {
        event.preventDefault();
        event.stopPropagation();
            
        return false;
    }
}

window.addEventListener('keydown', prevent, true);
window.addEventListener('keyup', prevent, true);
window.addEventListener('keypress', prevent, true);


/*------------------------------------------------------------------------------
5.0 INIT
------------------------------------------------------------------------------*/

window.addEventListener('DOMContentLoaded', function() {
    var outline = document.createElement('div');
    
    outline.className = 'frame-by-frame--outline hidden';
    
    document.body.appendChild(outline);
    
    setInterval(observer, 250);
});
