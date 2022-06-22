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
};

extension.cursor.style.set = function (type) {
	document.documentElement.classList.add(extension.prefix + '--' + type);
};

extension.cursor.style.remove = function (type) {
	document.documentElement.classList.remove(extension.prefix + '--' + type);
};

extension.cursor.style.reset = function () {
	document.documentElement.classList.remove(extension.prefix + '--pointer');
	document.documentElement.classList.remove(extension.prefix + '--grab');
	document.documentElement.classList.remove(extension.prefix + '--grabbing');
	document.documentElement.classList.remove(extension.prefix + '--resize');
};