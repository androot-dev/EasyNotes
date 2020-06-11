'use strict';
let Chrome = new APIchrome();

class notesController{
	constructor(){
		this.load = true;

		Chrome.onUpdated({
			loadNotes:(res)=>{
				this.loadNotes(res)
			}
		});
		
		Chrome.onMessages({
			hiddenNotes: ()=>{ this.hiddenNotes() },
			showNotes:   ()=>{ this.showNotes()   },
			deleteAll: async (res)=>{ 
				let prom = await this.deleteAll();
				Chrome.send( prom );
			},
			verifyURL: (res)=>{ this.verifyURL(res)}
		})
		Chrome.onCommand();
	}
	
	async verifyURL(response){
		let tab = await Chrome.getTab('active');
		if(Chrome.filter(tab[0]) == false){
			delete(response.verifyURL)
			Chrome.send( {action:'accessUrlBloked'} );
		}else{
			response.action = response.verifyURL;
			delete(response.verifyURL)
			response.url = tab[0].url;
			Chrome.send(response,  tab[0].id);
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
		let tab = await Chrome.getTab();
		if(tab!='empty'){
			for(let i =0; i<tab.length; i++){
				if( Chrome.filter(tab[i]) ){
					this.loadNotes({tabId:tab[i].id, status:tab[i].status});
				}
			}
		}
	}
	async deleteAll(action = "deleteAll"){
		return await new Promise(async(resolve, reject) => {
			let count = 0;
			let tab = await Chrome.getTab();	

			if(tab!='empty'){
				for(let i =0; i<tab.length; i++){
					if( Chrome.filter(tab[i]) ){
						if(tab[i].status == "complete"){
							let id = tab[i].id;
							try {
								await Chrome.exeScript(id, {
									code:'EasyNotes.removeNotesHere({action:"'+action+'",'+
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
			let valueStorage = await Chrome.getStorage();
			if(action == "deleteAll" && valueStorage!='empty'){
				for (let key in valueStorage){
					if (key.substring(0, 4) == 'http' || 
						key.substring(0, 4) == 'file' ||
						key.substring(0, 5) == 'https' ){
							await Chrome.removeStorage([key]);
							count++;
					}
				}
			}
			count = count>0 ? count : '0';
			resolve({action: 'notesDelete', notesDelete:count});
			
		});
	}
	async loadNotes(param){
		if( this.load == true ) {
			let tab = await Chrome.getTab(param.tabId);
			let optionHidden = await Chrome.getStorage('hiddenNotes');
			if(tab != "empty" && optionHidden == "show"
				&& Chrome.filter(tab) ){

				let url = tab.url;
			    Chrome.send({
				    action:'cleanNotesPageDynamic', 
				    url: url
				}, param.tabId);  

				Chrome.send({
					action:'loadNotes',
				   	url: url
				}, param.tabId);	

			}	  	
		}
	}
}

new notesController();