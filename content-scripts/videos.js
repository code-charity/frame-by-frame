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

		node.addEventListener('timeupdate', function (event) {
			extension.ui.update();

			document.dispatchEvent(new CustomEvent('video-timeupdate', {
				detail: {
					currentTime: event.target.currentTime,
					duration: event.target.duration
				}
			}));
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