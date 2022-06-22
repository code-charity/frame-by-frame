/*--------------------------------------------------------------
# USER INTERFACE
----------------------------------------------------------------
# Property
--------------------------------------------------------------*/

/*--------------------------------------------------------------
# PROPERTY
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
	extension.ui.surface.classList.toggle(extension.prefix + '__surface--collapsed');

	chrome.storage.local.set({
		hidden: extension.ui.surface.classList.contains(extension.prefix + '__surface--collapsed')
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
	this.surface = document.createElement('div');
	this.toggle = document.createElement('div');
	this.drag = document.createElement('div');
	this.resize = document.createElement('div');

	this.className = extension.prefix;
	this.surface.className = extension.prefix + '__surface';
	this.toggle.className = extension.prefix + '__button ' + extension.prefix + '__toggle';
	this.drag.className = extension.prefix + '__button ' + extension.prefix + '__drag-and-drop';
	this.resize.className = extension.prefix + '__button ' + extension.prefix + '__resize';

	this.DOMRect = {
		left: 0,
		top: 0,
		width: 0,
		height: 0
	};

	this.surface.update = function () {
		if (extension.storage.items.hidden === true) {
			this.classList.add(extension.prefix + '__surface--collapsed');
		} else {
			this.classList.remove(extension.prefix + '__surface--collapsed');
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

	this.appendChild(this.surface);
	this.surface.appendChild(this.toggle);
	this.surface.appendChild(this.drag);
	this.surface.appendChild(this.resize);

	document.dispatchEvent(new CustomEvent('ui-create'));
};


/*--------------------------------------------------------------
# UPDATE
--------------------------------------------------------------*/

extension.ui.update = function () {
	var video = extension.videos.active;

	if (video) {
		if (this.classList.contains(extension.prefix + '--busy') === false) {
			if (extension.ui.hover(this.surface.getBoundingClientRect())) {
				this.surface.classList.add(extension.prefix + '__surface--hover');

				if (extension.ui.hover(this.toggle.getBoundingClientRect())) {
					this.toggle.classList.add(extension.prefix + '__button--hover');

					extension.cursor.style.set('pointer');
				} else {
					this.toggle.classList.remove(extension.prefix + '__button--hover');

					extension.cursor.style.remove('pointer');
				}

				if (extension.storage.items.hidden !== true && extension.ui.hover(this.drag.getBoundingClientRect())) {
					this.drag.classList.add(extension.prefix + '__button--hover');

					extension.cursor.style.set('grab');
				} else {
					this.drag.classList.remove(extension.prefix + '__button--hover');

					extension.cursor.style.remove('grab');
				}

				if (extension.storage.items.hidden !== true && extension.ui.hover(this.resize.getBoundingClientRect())) {
					this.resize.classList.add(extension.prefix + '__button--hover');

					extension.cursor.style.set('resize');
				} else {
					this.resize.classList.remove(extension.prefix + '__button--hover');

					extension.cursor.style.remove('resize');
				}
			} else {
				this.surface.classList.remove(extension.prefix + '__surface--hover');
				this.toggle.classList.remove(extension.prefix + '__button--hover');
				this.drag.classList.remove(extension.prefix + '__button--hover');
				this.resize.classList.remove(extension.prefix + '__button--hover');

				extension.cursor.style.reset();
			}
		}

		document.dispatchEvent(new CustomEvent('ui-update'));
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
		extension.ui.classList.remove(extension.prefix + '--sleeping-mode');

		clearTimeout(extension.ui.sleepTimeout);
	}

	if (extension.ui) {
		extension.ui.sleepTimeout = setTimeout(function () {
			extension.ui.classList.add(extension.prefix + '--sleeping-mode');

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
	document.dispatchEvent(new CustomEvent('ui-styles'));
};


/*--------------------------------------------------------------
# HIDE
--------------------------------------------------------------*/

extension.ui.hide = function () {
	this.classList.remove(extension.prefix + '--visible');
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

	this.classList.add(extension.prefix + '--visible');
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