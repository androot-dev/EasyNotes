'use strict';


function msgContentScript (msg) {

  chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tab) {
    let tabId = tab[0].id;
    chrome.tabs.sendMessage (tabId, msg);
  });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponde){
	msgContentScript(request.msg);

	return true;
});