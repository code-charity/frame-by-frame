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