'use strict';
class comunicationBackground{
	/* Esta clase comunica el background con el popup y el contentScript */
	constructor(){
	
		this.load = true;
		this.cathMessage('deleteAll', function(res){
			res.then((result)=>{
				chrome.runtime.sendMessage(result);
			})
		});
		this.onLoadUpdate();
		this.cathMessage(['hiddenNotes', 'showNotes']);
	}
	hiddenNotes(){
		this.load = false;
		this.deleteAll(false);
	}
	showNotes(){
		this.load = true;
		this.showAll();
	}
	cathMessage(name, fn, res = null){
		let action = (response, name) =>{
			if(response.action == name){
			 	if(fn){
			 	    fn(this[name]());
			 	}else{
			 	    this[name]();
			 	}
	 	 	}
		}
		chrome.runtime.onMessage.addListener(async (response, _, sendResponse) =>  {
	 	 	if(typeof(name) == 'object'){
	 	 		for(let key in name){
	 	 			action(response, name[key]);
	 	 		}
	 	 	}else{
	 	 		action(response, name);
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
	showAll(){
		chrome.tabs.query({}, (tab)=>{
			for(let i =0; i<tab.length; i++){
				if(tab[i].url.substring(0, 6) == 'chrome'){
					let end = i == 0 ? 1 : i;
					tab.splice(i, end);
				}
			}
			for(let i =0; i<tab.length; i++){
				
				this.loadNotes(tab[i].id, tab[i].status);
			}
		})
	}
	async deleteAll(remove = true){
		return await new Promise(async(resolve, reject) => {
			chrome.tabs.query({'active': true, lastFocusedWindow: true},async (tab)=> {
					await chrome.storage.sync.get(null,async function(items){
						let count = 0;
						if(remove == true){
							for (let key in items){
								if (key.substring(0, 4) == 'http' || 
									key.substring(0, 4) == 'file' ||
									key.substring(0, 5) == 'https' ){
									chrome.storage.sync.remove([key]);
									count++;
								}
							}
						}
						chrome.tabs.query({}, function(tab){		
							for(let i =0; i<tab.length; i++){
								if(tab[i].url.substring(0, 6) == 'chrome'){
									let end = i == 0 ? 1 : i;
									tab.splice(i, end);
								}
							}
							for(let i =0; i<tab.length; i++){
								let alejandro = chrome.runtime.lastError
								chrome.tabs.executeScript(tab[i].id,{
									code:'noteasy.deleteAllHere(false);'
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
	loadNotes(tabId, status){
		if (status == 'complete' && this.load == true) {
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
	}
	onLoadUpdate(){
		if(this.load == true){
			chrome.tabs.onUpdated.addListener( (tabId , info)=> {
			  this.loadNotes(tabId, info.status);
	    	});
		}	
	}
}
new comunicationBackground();