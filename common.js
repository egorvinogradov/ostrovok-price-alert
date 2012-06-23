var PriceAlert = {

    init: function(config){
        
        var onTabChanged = function(url, tabId, options){
            var OTA = this.getCurrentOTA(url, config);
            if ( OTA ) {
                if ( options.newTab ) {
                    //this.insertJS(tabId, OTA.js);
                    this.insertCSS(tabId, OTA.css);
                }
                this.setIcon({ active: true });
            }
            else {
                this.setIcon({ active: false });
            }
        };

        this.tabChanged(onTabChanged);
        this.tabUpdated(onTabChanged);
    },
    tabUpdated: function(callback){
        var _this = this;
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
            if ( changeInfo.status === 'complete' ) {
                console.log('updated:', tab.url, tabId, changeInfo, tab);
                callback.call(_this, tab.url, tabId, { newTab: true });
            }
        });
    },
    tabChanged: function(callback){
        var _this = this;
        chrome.tabs.onSelectionChanged.addListener(function(tabId){
            console.log('changed:', tabId);
            chrome.windows.getCurrent(function(data){
                chrome.tabs.query({ windowId: data.id, active: true }, function(tabs){
                    console.log('-- current:', tabs[0].url, tabs[0].id, tabs);
                    callback.call(_this, tabs[0].url, tabs[0].id, { newTab: false });
                });
            });
        });
    },
    getCurrentOTA: function(url, config){
        for ( var service in config ) {
            if ( config[service].url.test(url) ) {
                return config[service];
            }
        }
        return false;
    },
    setIcon: function(options){
        var path = options.active
            ? 'img/active.png'
            : 'img/inactive.png';
        chrome.browserAction.setIcon({ path: path });
    },
    insertJS: function(tabId, code){
        chrome.tabs.executeScript(tabId, { code: code }, function(){
            console.log('INSERT JS', tabId);
        });
    },
    insertCSS: function(tabId, code){
        chrome.tabs.insertCSS(tabId, { code: code }, function(){
            console.log('INSERT CSS', tabId);
        });
    }
};
