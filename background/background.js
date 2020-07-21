'use strict';
let Chrome = new APIchrome();
class notesController {
	constructor() {
		this.load = true;
		Chrome.onUpdated({
			loadNotes: (res) => {
				this.loadNotes(res)
			}
		});
		Chrome.onMessages({
			sendUrlContentScript: async()=>{
				let tab =  await Chrome.getTab('active');
				Chrome.send({
					action:'urlContentScript',
					url:tab[0].url
				}, tab[0].id)
			},
			hiddenNotes: () => {
				this.hiddenNotes()
			},
			showNotes: () => {
				this.showNotes()
			},
			deleteAll: async (res) => {
				let prom = await this.deleteAll();
				Chrome.send(prom);
			},
			verifyURL: (res) => {
				this.verifyURL(res)

			},
			sendUrlActive:async()=>{
				let tab = await Chrome.getTab('active')
	
				Chrome.send({
					action: 'recivedUrlActive',
					url : tab[0].url
				})
			}
		})
		Chrome.onCommand({
			createNote: async () => {
	
				let pallete = {
					colorDefault:{
						note:'#f1c40f',
						tack: '#E50909',
						font:'black'
					},
					default: await Chrome.getStorage('pallete-default'),
					user: await Chrome.getStorage('pallete-user')
				}
				let id = await Chrome.getStorage('colorNoteSelect');
				let anchor = await Chrome.getStorage('anchorDomainCheck');
				anchor = anchor == 'empty' ? false : anchor;
				let getKey = (id)=>{
					let get =  {
						key: (id)=>{
							id = id.replace('#color-default', '');
							id = id.replace('#color-user', '');
							return id
						},
						pallete: (id)=>{
							id = id.replace('#color-', '');
							id = id[0] == 'u' ? 'user' : 'default';
							return id;
						}
					}
					return {
						key: get.key(id),
						pallete: get.pallete(id)
					}
				}
				let note = id == 'empty' ? getKey('#color-default2') : getKey(id);
				if(pallete[note.pallete] && pallete[note.pallete] != 'empty'){
					note = pallete[note.pallete][note.key];
				}else{
					note = pallete.colorDefault;
				}
				this.verifyURL({
					verifyURL: 'createNote',
					noteColor: note.note,
					fontColor: note.font,
					tackColor: note.tack,
					anchorDomain: anchor,
					urlAnchor: 'verifyURL'
				});
			},
			showHidden: async () => {
				let hidden = await Chrome.getStorage('hiddenNotes');
				if (hidden == 'show') {
					this.hiddenNotes();
					Chrome.setStorage('hiddenNotes', 'hidden')
				}
				else if (hidden == 'hidden') {
					this.showNotes();
					Chrome.setStorage('hiddenNotes', 'show')
				}
			}
		});
	}
	async verifyURL(response) {
		let tab = await Chrome.getTab('active');
		if(response.urlAnchor == 'verifyURL'){
			response.urlAnchor = tab[0].url;
		}
		if (tab == 'empty' || Chrome.filter(tab[0]) == false) {
			delete(response.verifyURL)
			Chrome.send({
				action: 'accessUrlBloked'
			});
		}
		else {
			response.action = response.verifyURL;
			delete(response.verifyURL)
			response.url = tab[0].url;
			Chrome.send(response, tab[0].id);
		}
	}
	hiddenNotes() {
		this.load = false;
		this.deleteAll('hiddenNotes');
	}
	showNotes() {
		this.load = true;
		this.showAllNotes();
	}
	async showAllNotes() {
		let tab = await Chrome.getTab();
		if (tab != 'empty') {
			for (let i = 0; i < tab.length; i++) {
				if (Chrome.filter(tab[i])) {
					this.loadNotes({
						tabId: tab[i].id,
						status: tab[i].status
					});
				}
			}
		}
	}
	async deleteAll(action = "deleteAll") {
		return await new Promise(async (resolve, reject) => {
			let count = 0;
			let tab = await Chrome.getTab();
			if (tab != 'empty') {
				for (let i = 0; i < tab.length; i++) {
					if (Chrome.filter(tab[i])) {
						if (tab[i].status == "complete") {
							let id = tab[i].id;
							try {
								await Chrome.exeScript(id, {
									code: 'EasyNotes.removeNotesHere({action:"' + action + '",' + 'url:"' + tab[i].url + '", tabId:"' + id + '"})'
								});
							}
							catch (e) {
								console.log('ERROR: es posible que deba cargar nuevamente la pestaña' + id + ' para usar EasyNotes.(' + tab[i].url + ') ');
							}
						}
					}
				}
			}
			let valueStorage = await Chrome.getStorage();
			if (action == "deleteAll" && valueStorage != 'empty') {
				for (let key in valueStorage) {
					if (key.substring(0, 4) == 'http' || key.substring(0, 4) == 'file' || key.substring(0, 5) == 'https') {
						await Chrome.removeStorage([key]);
						count++;
					}
				}
			}
			count = count > 0 ? count : '0';
			resolve({
				action: 'notesDelete',
				notesDelete: count
			});
		});
	}
	async loadNotes(param) {
		if (this.load == true) {
			let tab = await Chrome.getTab(param.tabId);
			let optionHidden = await Chrome.getStorage('hiddenNotes');
			if (tab != "empty" && optionHidden == "show" && Chrome.filter(tab)) {
				let url = tab.url;
				Chrome.send({
					action: 'cleanNotesPageDynamic',
					url: url
				}, param.tabId);
				Chrome.send({
					action: 'loadNotes',
					url: url
				}, param.tabId);
			}
		}
	}
}
new notesController();