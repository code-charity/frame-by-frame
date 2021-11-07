/*---------------------------------------------------------------
>>> BACKGROUND
-----------------------------------------------------------------
# Storage
# Message listener
---------------------------------------------------------------*/

/*---------------------------------------------------------------
# STORAGE
---------------------------------------------------------------*/

chrome.storage.local.get(function (items) {
    if (items.background_color && items.background_color.rgb) {
        items.background_color = items.background_color.rgb;
    }

    if (items.text_color && items.text_color.rgb) {
        items.text_color = items.text_color.rgb;
    }

    chrome.storage.local.set(items);
});


/*---------------------------------------------------------------
# MESSAGE LISTENER
---------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    if (typeof message !== 'object') {
        return false;
    }

    if (message.action === 'get-tab-url') {
        sendResponse({
            url: new URL(sender.tab.url).hostname,
            id: sender.tab.id
        });
    }
});