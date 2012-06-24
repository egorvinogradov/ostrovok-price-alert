var PriceAlert = {

    init: function(config){

        console.log('config', config);
        
        var onTabChanged = function(url, tabId, options){
            var OTA = this.getCurrentOTA(url, config);
            if ( OTA ) {
                if ( options.newTab ) {
                    this.insertJS(tabId, OTA.js);
                    this.insertCSS(tabId, OTA.css);
                }
                this.setIcon({ active: true }, config);
            }
            else {
                this.setIcon({ active: false }, config);
            }
        };

        this.tabChanged(onTabChanged);
        this.tabUpdated(onTabChanged);
    },
    tabUpdated: function(callback){
        var _this = this;
        chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
            if ( changeInfo.status === 'complete' ) {
                console.log('Tab updated:', tab.url, tabId, changeInfo, tab);
                callback.call(_this, tab.url, tabId, { newTab: true });
            }
        });
    },
    tabChanged: function(callback){
        var _this = this;
        chrome.tabs.onSelectionChanged.addListener(function(tabId){
            chrome.windows.getCurrent(function(data){
                chrome.tabs.query({ windowId: data.id, active: true }, function(tabs){
                    console.log('Tab changed:', tabs[0].url, tabs[0].id, tabs);
                    callback.call(_this, tabs[0].url, tabs[0].id, { newTab: false });
                });
            });
        });
    },
    getCurrentOTA: function(url, config){
        for ( var service in config.OTA ) {
            if ( config.OTA[service].url.test(url) ) {
                return config.OTA[service];
            }
        }
        return false;
    },
    setIcon: function(options, config){
        var path = options.active
            ? config.icon.active
            : config.icon.inactive;
        chrome.browserAction.setIcon({ path: path });
    },
    insertJS: function(tabId, path){
        var code = '(' + this.runOstrovokScript.toString() + '(\'' + path + '\'))';
        chrome.tabs.executeScript(tabId, { code: code }, function(){
            console.log('Insert JS', tabId, path, code);
        });
    },
    insertCSS: function(tabId, path){
        chrome.tabs.insertCSS(tabId, { file: path }, function(){
            console.log('Insert CSS', tabId, path);
        });
    },
    runOstrovokScript: function(path){
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'chrome-extension://pjekielkfnenlllmghhbebnpccdhphfc/' + path;
        document.body.appendChild(script);
        console.log('Ostrovok.ru Price Alert', script);
    }
};
