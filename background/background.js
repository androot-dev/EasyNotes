'use strict';
class comunicationBackground {
	/* Esta clase comunica el background con el popup y el contentScript */
	constructor(){
		
	}
	async requestIndex(req){
		return await new Promise(async(resolve, reject)=>{
			let response = await chrome.runtime.sendMessage({respond:req});
			if(response){
				resolve(response);
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
	
}
class APIchrome extends comunicationBackground{
	constructor(){super()}

	async getTab(request = {}){
		let filterTab = (tab, filter)=>{

			for(let i =0; i<tab.length; i++){
				if(tab[i].url.substring(0, filter.length) == filter){
					let end = i == 0 ? 1 : i;
					tab.splice(i, end);
				}
			}
			return tab;
		}
		return await new Promise (async(resolve, reject)=>{
			if(typeof(request)=='number'){
				chrome.tabs.get(request, (tab)=>{
					let tabs = filterTab([tab], 'chrome');
					if(tabs && tabs.length > 0){
					 	resolve( tabs );
					}else{
						resolve('empty');
					}
				});
			}else{
				chrome.tabs.query(request, (tab)=>{
					let tabs = filterTab(tab, 'chrome');
					if(tabs && tabs.length > 0){
					 	resolve( tabs );
					}else{
						resolve('empty');
					}
				});
			}
		});
	}
	async getStorage(request = null){
		return await new Promise (async(resolve, reject)=>{
			chrome.storage.sync.get(request, (items)=>{
				if(items){
					resolve( items );
				}else{
					resolve( 'empty' );
				}
			});
		});
	}
	onUpdated(actions){
		let action = (name, param, fn) =>{
			if(fn!=null){
				fn(this[name](param))
			}else{
				this[name](param);
			}
		}
		chrome.tabs.onUpdated.addListener( (tabId , info)=> {
			  for(let key in actions){
			  	action(key, {tabId:tabId, info:info}, actions[key]);
			  }
			  
	    });
	}
	onMessages(messages){
		//No se utilizan respuestas en este oyente
		if(messages){
			let action = (value, name, fn) =>{
				if(value.action == name){
					if(fn!=null){
						fn(this[name]())
					}else{
						this[name]();
					}
		 	 	}
			}
			chrome.runtime.onMessage.addListener(async (response, 
				sender, sendResponse) =>  {
			 	 	for(let key in messages){
			 	 		action(response, key, messages[key]);
			 	 	}
			});
		}
	}
	async onCommand(){
		chrome.commands.onCommand.addListener(async(cmd)=> {
			let tab = await this.getTab(
				{'active': true, 
				lastFocusedWindow: true}
			)
			if(cmd=="createNote"){
				let selection = await this.requestIndex('selection');
				alert(selection)
				this.sendContentScript({

				})
			}
		})
	}
}

class notesController extends APIchrome{
	constructor(){
		super();
		this.onMessages({
			hiddenNotes:null,
			showNotes:  null,
			deleteAll: function(()=>{
				
			})
		})
	}
	hiddenNotes(){
		this.load = false;
		this.deleteAll(false);
	}
	showNotes(){
		this.load = true;
		this.showAllNotes();
	}
	async showAllNotes(){
		let tab = await this.getTab();
		if(tab!='empty'){
			for(let i =0; i<tab.length; i++){
				this.loadNotes(tab[i].id, tab[i].status);
			}
		}
	}
	async deleteAll(remove = true){
		return await new Promise(async(resolve, reject) => {
			let valueStorage = await this.getStorage();
			let count = 0;
			if(remove == true && valueStorage!='empty'){
				for (let key in valueStorage){
					if (key.substring(0, 4) == 'http' || 
						key.substring(0, 4) == 'file' ||
						key.substring(0, 5) == 'https' ){
							chrome.storage.sync.remove([key]);
							count++;
					}
				}
			}
			let tab = await this.getTab();	
			if(tab!='empty'){
				for(let i =0; i<tab.length; i++){
	
					chrome.tabs.executeScript(tab[i].id,{
						code:'noteasy.deleteAllHere({}, false);'
					})
				}
				count = count>0 ? count : '0';
				resolve({notesDelete:count});
			}	
		});
	}
	async loadNotes(param){

		if( this.load == true ) {

			let tab = await this.getTab(param.tabId);
			
			if(tab != "empty"){
				
				let url = tab[0].url;
			    this.sendContentScript(param.tabId, {
				    action:'cleanNotesPageDynamic', 
				    url: url
				});  
				this.sendContentScript(param.tabId, {
					action:'loadNotes',
				   	url: url
				});	

			}	  	
		}
	}
}
new notesController();