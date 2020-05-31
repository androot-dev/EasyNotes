'use strict';


class comunicationBackground {
	/* Esta clase comunica el background con el popup y el contentScript */
	constructor(){}

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
	constructor(){
		super();
		let filterRules= {
			protocol:'chrome:',
			hostname:'chrome.google.com'
		}
		this.filter = (tab)=>{
			let url = new URL(tab.url);
			
			if(tab.title == url.hostname){
				//sin conexion
				return false;
			}
			for (let a in filterRules){
				if(url[a] == filterRules[a]){
					return false;
				}
			}
			return true;
		}
	}
	async exeScript(tabId, script, cancelTime = 100){
		return new Promise((resolve, reject)=>{
			let timeout;
			chrome.tabs.executeScript(tabId,script , function(res){
				timeout = null;
				resolve(res);
			});

			timeout = setTimeout(function(){
				resolve('timeout');
			}, cancelTime);
		})
	}
	async getTab(request = {}){
		if(request == 'active'){
			request = {
				'active': true, 
				lastFocusedWindow: true
			}
		}
		return await new Promise ((resolve, reject)=>{
			if(typeof(request)=='number'){
				chrome.tabs.get(request, (tab)=>{
					if(tab && tab.url){
						resolve( tab );
					}else{
						resolve('empty');
					}
				});
			}else{
				chrome.tabs.query(request, (tab)=>{
					if(tab && tab.length > 0){
					 	resolve( tab );
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
	async setStorage(key, value){
		let exist = await this.getStorage(key);
		return new Promise ((resolve, reject)=>{
			chrome.storage.sync.set({[key]:value}, function(){
				if(exist == {}){
					resolve('setted')
				}else{
					resolve('modified')
				}
			}); 
		});
		
	}
	async onUpdated(actions){

		let action = (name, param, fn) =>{
			if(fn!=null){
				fn(this[name](param))
			}else{
				this[name](param);
			}
		}
		chrome.tabs.onUpdated.addListener( (tabId , info)=> {
			if(info.status == "complete"){
				for(let key in actions){
			  		action(key, {tabId:tabId, info:info}, actions[key]);
				}
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
			 	 		if(messages[key] == 'indexResponseAsync'){
			 	 			messages[key] = function(res){
			 	 				res.then((result)=>{
									chrome.runtime.sendMessage(result);
								});
			 	 			}
			 	 		}
			 	 		action(response, key, messages[key]);
			 	 	}
			});
		}
	}
	async onCommand(){
		chrome.commands.onCommand.addListener(async(cmd)=> {
			//let tab = await this.getTab('active');

			if(cmd=="createNote"){
				let selection = await this.requestIndex('selection');
				this.sendContentScript({

				})
			}
		})
	}
}

class notesController extends APIchrome{
	constructor(){
		super();
		this.load = true;

		this.onUpdated({
			loadNotes:null
		});
		
		this.onMessages({
			hiddenNotes:null,
			showNotes:  null,
			deleteAll: 'indexResponseAsync',
			verifyURL: 'indexResponseAsync'
		})
		this.onCommand();
	}
	async verifyURL(){
		let tab = await this.getTab('active');
		if(this.filter(tab[0]) == false){
			return {negate: 'stop'}
		}else{
			return {negate: 'start'}
		}
	}
	hiddenNotes(){
		this.load = false;
		this.deleteAll('hiddenNotes');
	}
	showNotes(){
		this.load = true;
		this.showAllNotes();
	}
	async showAllNotes(){
		let tab = await this.getTab();
		if(tab!='empty'){
			for(let i =0; i<tab.length; i++){
				if( this.filter(tab[i]) ){
					this.loadNotes({tabId:tab[i].id, status:tab[i].status});
				}
			}
		}
	}
	async deleteAll(action = "deleteAll"){
		return await new Promise(async(resolve, reject) => {
			let count = 0;
			let tab = await this.getTab();	

			if(tab!='empty'){
				for(let i =0; i<tab.length; i++){

					if( this.filter(tab[i]) ){
						if(tab[i].status == "complete"){
							let id = tab[i].id;
							try {
								await this.exeScript(id, {
									code:'noteasy.removeNotesHere({action:"'+action+'",'+
									'url:"'+tab[i].url+'", tabId:"'+id+'"})'
								});
							} catch(e) {
								console.log('ERROR: es posible que deba cargar nuevamente la pestaña'+ 
									id+' para usar noteEasy.('+tab[i].url+') ');
							}
						}
					}
				}
			}
			let valueStorage = await this.getStorage();
			if(action == "deleteAll" && valueStorage!='empty'){
				for (let key in valueStorage){
					if (key.substring(0, 4) == 'http' || 
						key.substring(0, 4) == 'file' ||
						key.substring(0, 5) == 'https' ){
							await chrome.storage.sync.remove([key]);
							count++;
					}
				}
			}
			count = count>0 ? count : '0';
			resolve({notesDelete:count});
			
		});
	}
	async loadNotes(param){
		if( this.load == true ) {
			let tab = await this.getTab(param.tabId);
			let optionHidden = await this.getStorage('hiddenNotes');

			if(tab != "empty" && optionHidden.hiddenNotes == "show"
				&& this.filter(tab) ){

				let url = tab.url;
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