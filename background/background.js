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
		this.filterTab= [
			'chrome',
			'https://chrome.google.com/webstore/'
		]
		this.filter = (tabs, msgBox = false)=>{
			let borrar = [];

			for(let i in tabs){
				for (let a in this.filterTab){
					let cutString = tabs[i].url.substring(0, this.filterTab[a].length);
					if(cutString == this.filterTab[a]){
						borrar.push(i);
						if(msgBox == true){
							return false;
						}
					}
				}
			}
			let newTabs = [];
			for(let i in tabs){
				let add = true;
				for(let a in borrar){
					if(borrar[a] == i){
						add = false;
					}
				}
				if (add == true ) {
					newTabs.push(tabs[i]);
				}
			}	
			return newTabs;
		}
	}
	async addScript(tabId, script){
		return new Promise((resolve, reject)=>{
			chrome.tabs.executeScript(tabId,script , function(res){
				resolve(res);
			});
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
					if(tab){
						let tabs = this.filter([tab]);
						if(tabs == false){
							resolve(false);
						}
							if(tabs && tabs.length > 0){
							 	resolve( tabs );
							}else{
								resolve('empty');
							}
					}
				});
				
			}else{
				chrome.tabs.query(request, (tab)=>{
					let tabs = this.filter(tab);
					if(tabs == false){
						resolve(false);
					}
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
			let tab = await this.getTab('active')
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
		let tab = await this.getTab('active', true);
		if(tab == false){
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
				this.loadNotes({tabId:tab[i].id, status:tab[i].status});
			}
		}
	}
	async deleteAll(action = "deleteAll"){
		return await new Promise(async(resolve, reject) => {
			let count = 0;
			let tab = await this.getTab();	
			if(tab!='empty'){
				for(let i =0; i<tab.length; i++){
					let id = tab[i].id;
					await this.addScript(id, {
						code:'noteasy.removeNotesHere({action:"'+action+'",'+
						'url:"'+tab[i].url+'", tabId:"'+id+'"})'
					})
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

			if(tab != "empty" && tab !=false && optionHidden.hiddenNotes == "show"){
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