/*---------------------------------------------------------------
>>> BACKGROUND
-----------------------------------------------------------------
# Message listener
---------------------------------------------------------------*/

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