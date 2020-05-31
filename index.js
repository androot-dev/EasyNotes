var $ = (sel)=>{
	let el = document.querySelectorAll(sel).length > 1 ?
	document.querySelectorAll(sel) : document.querySelectorAll(sel)[0];
	if(el){
		if(el.tagName){
			el.on = function(evt, fn){
				el.addEventListener(evt, fn, false);
			}
		}else{
			el.forEach( function(el, index){
				el.on = function(evt, fn){
					el.addEventListener(evt, fn, false);
				}
			});
		}
		return el;
	}else{
		console.log('no se encontro el selector: '+ sel);
		return undefined;
	}
}

class popupComunication{
 /*
 Esta clase se encarga de comnicar el popup con los script de contenido
  y el background.js 
 */
 constructor(){ 
 	this.toggles = {
		menuDelete:false,
		menuHidden:async function(){
			return await new Promise(async (resolve, reject) =>{
				return await chrome.storage.sync.get(['hiddenNotes'], (val)=>{
					if(val){
						if(val.hiddenNotes){
							resolve(val.hiddenNotes);
						}else{
							reject('show');
						}
					}else{
						reject('show');
					}
				});
			});
		}
	}
 	this.catchMessage('notesDelete', (msg)=>{
 		let plural = msg>1 || msg==0 ? "s": "";
 		this.showBubbleMessage(+msg+' nota'+plural+' eliminada'+plural);
 	});
 	this.catchMessage('respond', (msg)=>{
 		
 	});
 
 }

 showBubbleMessage(msg, time=2500, color = {background:'auto' , font:'auto'}){
 	let bubble = $('#bubbleInfo');
 	if(this.toggles.bubble){
 		clearTimeout(this.toggles.bubbles);
 	}
 	bubble.style.opacity = '1';
 	bubble.style.height = 'auto';
 	bubble.textContent = msg;
 	bubble.style.padding = '5px 2px';
 	if(color.background && color.background != 'auto'){
 		bubble.style.background = color.background;
 	}
 	if(color.font && color.font != 'auto'){
 		bubble.style.color = color.font;
 	}
 	this.toggles.bubble = setTimeout(function(){
 		bubble.style.height = '0';
 		bubble.textContent = "";
 		bubble.style.padding = '0';
 		bubble.style.opacity = '0';
 	}, time);
 	
 }
 sendContentScript(msg ,fn){
 	chrome.tabs.query({'active': true, lastFocusedWindow: true},(tab)=>{
 		 if(tab[0]){
	 		var url = new URL (tab[0].url);
	    	msg.url = url;
	 		if(fn == null){
				chrome.tabs.sendMessage (tab[0].id, msg);
			}else{
				chrome.tabs.sendMessage (tab[0].id, msg, function(res){
					fn(res)
				});
			}
		}
 	});
 }
 catchMessage(name, fn){
 	 chrome.runtime.onMessage.addListener(async (response, _, sendResponse) =>  {
 	 	if(response[name]){
 	 		fn(response[name])
 	 	}
 	 	if(response.respond){
 	 		sendResponse(this[response.response]);
 	 	}
 	 });
 }
 send(msg, destination, action){
 	msg.action = action;
 	msg.destination = destination;
	return chrome.runtime.sendMessage(msg);
 }

}
class colors extends popupComunication{
	constructor(){
		super();
	}
	setDarkNote(key){

		if(key == 0 /* black */){
			let bubble = $('#bubbleInfo');
			bubble.style.background = "#EEEEEE";
			$('.falseLetter').forEach( 
				(element, index) => {
				element.style.background = '#EEEEEE';
				this.selection.font = 'white';
			});
		}else{
	
			$('.falseLetter').forEach( 
				(element, index) => {
				element.style.background = 'black';
				this.selection.font = "black";
			});
		}
	}
	setColorNote(keySelect, auto = false){
		let prefered = $('.prefered')
		let bubble = $('#bubbleInfo');
		prefered.forEach( function(element, index) {
			element.style.transform = 'scale(1)';
		});
		
		$('#colorNote-'+keySelect).style.transform = 'scale(1.4)';
		$('#miniNote').style.background = this.prefereds[keySelect];
		bubble.style.background = this.prefereds[keySelect];
		this.setDarkNote(keySelect);
		this.selection.note = this.prefereds[keySelect];
		if(auto!=true){
			chrome.storage.sync.set({key: keySelect});
		}
	}
	getSelectedColor(defaultKey){
		chrome.storage.sync.get(['key'], (result) => {
			
			if(result.key === 0 || result.key){
				this.setColorNote(result.key, true);
				return this.prefereds[result.key];
			}else{
				this.setColorNote(defaultKey, true);
				return this.prefereds[defaultKey];
			}	
        });
	}
	setListPreferedColor(){
		for(let i=0; i <= 5; i++){
			let el = $('#colorNote-'+i);
			el.style.background = this.prefereds[i];
			el.addEventListener('click',()=>{
				this.setColorNote(i);
			}, false);
		}
	}
}
class popup extends colors{
	constructor(notesColors, fontColor='#000'){
		super();
		this.prefereds = notesColors;
		this.fontColor = fontColor;
		this.selection = {};
		this.setListPreferedColor();
		this.getSelectedColor(2);
		this.menuHidden('show');
		
		$('#miniNote').on('click', ()=> {
			this.insertNote();
		} );
		$('#deleteButton').on('click', ()=> {
			this.menuDelete();
		} );
		$('#deleteConfirm').on('click', ()=>{
			this.deleteNotes();
			this.menuDelete();
		});
		$("#hiddenButton").on('click', () =>{
			this.menuHidden('toggle');
		});
		$("#feedbackButton").on('click', ()=>{
			this.createFeedback();
		});
		
	}
	createFeedback(){
		chrome.runtime.sendMessage({action: 'verifyURL'});
		this.catchMessage('negate', (val)=>{

	 		if(val == 'stop'){
	 			this.showBubbleMessage('Pagina no accesible');
	 		}else if(val == 'start'){
	 			this.sendContentScript({
					action:'createFeedback'
				})
	 		}
 		});
	}
	menuHidden(action){
		let hidden_ = $("#hiddenButton");
		let actions = {
			toggle: (varCondition)=>{ 
				let newValue = varCondition == 'hidden' ? 'show': 'hidden';
				if(varCondition == 'hidden'){
					chrome.runtime.sendMessage({action:'showNotes'})
					hidden_.style.backgroundColor="transparent";
					chrome.storage.sync.set({['hiddenNotes']: newValue});
				}else if(varCondition == 'show'){	
					chrome.runtime.sendMessage({action:'hiddenNotes'})
					hidden_.style.backgroundColor="#636e72";
					chrome.storage.sync.set({['hiddenNotes']: newValue});				
				}
			},
			show: (varCondition)=>{
				if(varCondition == 'hidden'){
					hidden_.style.backgroundColor="#636e72";
				}else{
					hidden_.style.backgroundColor="transparent";
				}
			}
		}
		this.toggles.menuHidden().then(
			(res)=> actions[action](res),
			(res)=> actions[action](res)
		);
	}
	async deleteNotes(){
		let radioButtonsDelete = {
			allHere: function(){
				let el = $('#allHere');
				el.bind = 'removeNotesHere';
				return el;
			},
			allPages: function(){
				let el = $('#allPages');
				el.bind = 'deleteAll';
				return el;
			},
			checked: function(){
				return this.allHere().checked ? this.allHere() : this.allPages();
			}
		}
		let checked = radioButtonsDelete.checked().bind;
		switch (checked) {

			case 'deleteAll':
				chrome.runtime.sendMessage({
					action:checked
				});
				break;

			case 'removeNotesHere':
				let tab = await new Promise((resolve, reject)=>{
					chrome.tabs.query({'active': true, lastFocusedWindow: true}, (tab)=>{
						resolve(tab);
					});
				});
		
				this.sendContentScript({
					action:checked,
					url:tab[0].url,
					idTab:tab[0].id
				});
				break;
		}
	}
	menuDelete(){
		let menu = $('#deleteMenu');
		
		if(this.toggles.menuDelete == false){
			$('#deleteButton').style.backgroundColor = "#636e72";
			menu.style.visibility = 'visible';
			menu.style.height = '80%';

			this.toggles.menuDelete = true;
		}else{
			$('#deleteButton').style.backgroundColor = "transparent";
			menu.style.height = '0';
			menu.style.visibility = 'hidden';
			this.toggles.menuDelete =false;
		}
		
	
	}
	insertNote(){

		chrome.runtime.sendMessage({action: 'verifyURL'});
		this.catchMessage('negate', (val)=>{

	 		if(val == 'stop'){
	 			this.showBubbleMessage('Pagina no accesible');
	 		}else if(val == 'start'){

	 			this.sendContentScript({
					noteColor:this.selection.note, 
					fontColor:this.selection.font,
					action:'createNote'
				});
	 		}
 		});

	}
}
new popup(
	['#2f3640', '#fd9644', '#f1c40f', '#26de81', '#2bcbba', '#9c88ff']
);