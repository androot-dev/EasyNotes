'use strict';
class comunicationBackground{
	/* Esta clase comunica el background con el popup y el contentScript */
	constructor(){}
	sendContentScript(tabId, request){	
		chrome.tabs.sendMessage (tabId, request);
	}
	receivingOn(){
		chrome.runtime.onMessage.addListener((request, sender, sendResponde)=>{
			if(request.destination == 'contentScript'){
				chrome.tabs.query({'active': true, lastFocusedWindow: true},(tab)=>{
    			var url = new URL (tab[0].url);
    			request.url = url;
    			this.sendContentScript(tab[0].id, request);
    		});
			}
			return true;
		});
	}
	loadNotes(){
		
		chrome.tabs.onUpdated.addListener( (tabId , info)=> {
		  if (info.status === 'complete') {

		  	chrome.tabs.get(tabId,(tab)=>{
    			var url = new URL (tab.url);
    	
    			this.sendContentScript(tabId, {
	    			action:'cleanNotesPageDynamic', 
	    			url: url
	    		}); // para borrar las notas en la pantalla 
	    			// donde no se recarga la pagina al cambiar de url.
	    			//ejemplo (instagram)
	    		this.sendContentScript(tabId, {
	    			action:'loadNotes',
	    			url: url
	    		});

	    		
    		});
		  }
    	});
	}
}
let comunication = new comunicationBackground();
comunication.receivingOn();
comunication.loadNotes();
