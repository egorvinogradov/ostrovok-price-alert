var Config = {
    booking: {
        url: /booking\.com/,
        js: 'services/booking.js',
        css: 'services/booking.css'
    },
    expedia: {
        url: /expedia\.com|expedia\.co\.uk/,
        js: 'services/expedia.js',
        css: 'services/expedia.css'
    },
    oktogo: {
        url: /oktogo\.ru/,
        js: 'services/oktogo.js',
        css: 'services/oktogo.css'
    }
};


var PriceAlert = {

    init: function(){

        var onTabChanged = function(){
            this.getCurrentUrl(function(url){
                var OTA = this.getCurrentOTA(url);
                if ( OTA ) {
                    this.insertJS(OTA.js);
                    this.insertCSS(OTA.css);
                }
            });
        };

        this.tabChanged(onTabChanged);

    },
    tabChanged: function(callback){
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tabInfo){
            if ( changeInfo.status === 'complete' ) {
                callback(tabInfo.url, tabId);
            }
        });
    },
    getCurrentUrl: function(callback){
        chrome.windows.getCurrent(function(w){
            chrome.tabs.query({ windowId: w.id, active: true }, function(arrayOfOneTab){
                callback(arrayOfOneTab[0].url);
            });
        });
    },
    getCurrentOTA: function(url){
        for ( var service in Config ) {
            if ( Config[service].url.test(url) ) {
                return Config[service];
            }
        }
        return false;
    },
    insertJS: function(path){

        var tabId = 1; // TODO: get TabId

        chrome.tabs.executeScript(tabId, { file: path }, function(data){
            console.log('--- JS executed', data);
        });
    },
    insertCSS: function(path){

        var tabId = 1; // TODO: get TabId

        chrome.tabs.insertCSS(tabId, { file: path }, function(data){
            console.log('--- CSS inserted', data);
        });
    }
};
