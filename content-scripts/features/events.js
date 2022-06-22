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