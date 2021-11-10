/*---------------------------------------------------------------
>>> BACKGROUND
-----------------------------------------------------------------
# Global variable
# Localization
# Listeners
    # Install
    # Storage change
    # Message
---------------------------------------------------------------*/

/*--------------------------------------------------------------
# GLOBAL VARIABLE
--------------------------------------------------------------*/

var extension = {
    locale: {},
    storage: {}
};


/*--------------------------------------------------------------
# LOCALIZATION
--------------------------------------------------------------*/

function getLocalization(code) {
    var language = code || window.navigator.language,
        xhr = new XMLHttpRequest();

    if (language.indexOf('en') === 0) {
        language = 'en';
    }

    xhr.onload = function () {
        try {
            var response = JSON.parse(this.response),
                result = {};

            for (var key in response) {
                result[key] = response[key].message;
            }

            extension.locale = result;
        } catch (error) {
            console.error(error);
        }
    };

    xhr.onerror = function () {
        xhr.open('GET', '_locales/en/messages.json', true);
        xhr.send();
    };

    xhr.open('GET', '_locales/' + language + '/messages.json', true);
    xhr.send();
}


/*---------------------------------------------------------------
# LISTENERS
---------------------------------------------------------------*/

/*---------------------------------------------------------------
# INSTALL
---------------------------------------------------------------*/

chrome.runtime.onInstalled.addListener(function (details) {
    if (extension.storage.background_color && extension.storage.background_color.rgb) {
        items.background_color = extension.storage.background_color.rgb;
    }

    if (extension.storage.text_color && extension.storage.text_color.rgb) {
        extension.storage.text_color = extension.storage.text_color.rgb;
    }

    chrome.storage.local.set(extension.storage);
});


/*--------------------------------------------------------------
# STORAGE CHANGE
--------------------------------------------------------------*/

chrome.storage.onChanged.addListener(function (changes) {
    for (var key in changes) {
        extension.storage[key] = changes[key].newValue;
    }

    getLocalization(extension.storage.language);
});


/*---------------------------------------------------------------
# MESSAGE
---------------------------------------------------------------*/

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'get-localization') {
        var response = extension.locale;

        sendResponse(response);

        return response;
    } else if (message.action === 'get-tab-url') {
        var response = {
            url: new URL(sender.url || sender.tab.url).hostname,
            id: sender.tab.id
        };

        sendResponse(response);

        return response;
    }
});


/*--------------------------------------------------------------
# INITIALIZATION
--------------------------------------------------------------*/

chrome.storage.local.get(function (items) {
    extension.storage = items;

    getLocalization(items.language);
});