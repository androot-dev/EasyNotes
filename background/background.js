'use strict';
class comunicationBackground{
	/* Esta clase comunica el background con el popup y el contentScript */
	constructor(){}
	sendContentScript(request){
		chrome.tabs.query({active: true, lastFocusedWindow: true}, function (tab) {
			let tabId = tab[0].id;
			
			chrome.tabs.sendMessage (tabId, request);
  		});
	}
	receivingOn(){
		chrome.runtime.onMessage.addListener((request, sender, sendResponde)=>{
			if(request.destination == 'contentScript'){
				this.sendContentScript(request);
			}
			return true;
		});
	}
}
let comunication = new comunicationBackground();
comunication.receivingOn();