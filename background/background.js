'use strict';
class comunicationBackground{
	/* Esta clase comunica el background con el popup y el contentScript */
	constructor(){
		this.loadNotes();
		this.cathMessage('deleteAll', function(res){
			res.then((result)=>{
				chrome.runtime.sendMessage(result);
			})
		});
	}
	cathMessage(name, fn){
		chrome.runtime.onMessage.addListener(async (response, _, sendResponse) =>  {
	 	 	if(response.action == name){
	 	 		if(fn){
	 	 			fn(this[name]());
	 	 		}else{
	 	 			this[name]();
	 	 		}
	 	 	}
 	 	});
	}
	sendContentScript(tabId, request, fn = null){
		if(fn == null){
			chrome.tabs.sendMessage(tabId, request);
		}else{
			chrome.tabs.sendMessage(tabId, request, fn);
		}
	}
	async deleteAll(){
		return await new Promise(async(resolve, reject) => {
			chrome.tabs.query({'active': true, lastFocusedWindow: true},async (tab)=> {
					await chrome.storage.sync.get(null,async function(items){
						let count = 0;
						for (let key in items){
							if (key.substring(0, 4) == 'http' || 
								key.substring(0, 4) == 'file' ||
								key.substring(0, 5) == 'https' ){
								chrome.storage.sync.remove([key]);
								count++;
							}
						}
						chrome.tabs.query({}, function(tab){		
							for(let i =0; i<tab.length; i++){
								if(tab[i].url.substring(0, 6) == 'chrome'){
									tab.splice(i, i);
								}
							}
							for(let i =0; i<tab.length; i++){
								chrome.tabs.executeScript(tab[i].id,{
									code:'noteasy.deleteAllHere();'
								})
							}
						})
						if(count){
							resolve({notesDelete:count});
						}else{
							resolve({notesDelete:'0'});
						}	
					});	
			});	
		});
	}
	loadNotes(){
		chrome.tabs.onUpdated.addListener( (tabId , info)=> {
		  if (info.status === 'complete') {
		  	chrome.tabs.get(tabId,(tab)=>{
		  		try {
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
		  		} catch(e) {
		  			
		  			console.log(e);
		  		}
    			
    		});
		  }
    	});
	}
}
new comunicationBackground();