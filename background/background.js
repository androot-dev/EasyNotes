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
				chrome.tabs.query({'active': true, lastFocusedWindow: true},(tab)=>{
    			var url = new URL (tab[0].url);
    			request.url = url;
    			this.sendContentScript(request);
    		});
			}
			return true;
		});
	}
	loadNotes(){
		chrome.tabs.onUpdated.addListener( (tabId , info)=> {
		  if (info.status === 'complete') {
		  	chrome.tabs.query({'active': true, lastFocusedWindow: true},(tab)=>{
   
    			
    			var url = new URL (tab[0].url);
    			let loadRequest={
    				action:'loadNotes',
    				url: url
    			}
    			this.sendContentScript(loadRequest);
    			 
    			
    		});
		  }
    	});
	}
}
let comunication = new comunicationBackground();
comunication.receivingOn();
comunication.loadNotes();
