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
							console.log('a toggle se envio, resolve: '+val.hiddenNotes)
						}else{
							console.log('a toggle se envio, reject: '+val.hiddenNotes)
							reject('show');
						}
					}else{
						console.log('a toggle se envio, reject: '+val.hiddenNotes)
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

 }
 save(name, data){
	 chrome.storage.sync.set({[name]:data});    
 }
 load(name, fn){
	chrome.storage.sync.get([name], (res)=>{
		fn(res);
		return res;
	});
 }
 showBubbleMessage(msg, time=2500){
 	let bubble = $('#bubbleInfo');
 	if(this.toggles.bubble){
 		clearTimeout(this.toggles.bubbles);
 	} 
 	bubble.style.height = 'auto';
 	bubble.textContent = msg;
 	bubble.style.padding = '4px 2px';
 	this.toggles.bubble = setTimeout(function(){
 		bubble.style.height = '0';
 		bubble.textContent = "";
 		bubble.style.padding = '0';
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

		prefered.forEach( function(element, index) {
			element.style.transform = 'scale(1)';
		});
		this.setDarkNote(keySelect);
		$('#colorNote-'+keySelect).style.transform = 'scale(1.4)';
		$('#miniNote').style.background = this.prefereds[keySelect];
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
		$("#hiddenButton").on('click', () =>{
			this.menuHidden('toggle');
		});
		
	}
	menuHidden(action){
		let hidden_ = $("#hiddenButton");
		let actions = {
			toggle: (varCondition)=>{ 
				let newValue = varCondition == 'hidden' ? 'show': 'hidden';
				if(varCondition == 'hidden'){

					hidden_.style.background="transparent";
					chrome.storage.sync.set({['hiddenNotes']: newValue});
				}else if(varCondition == 'show'){	

					hidden_.style.background="#6C6C6C";
					chrome.storage.sync.set({['hiddenNotes']: newValue});				
				}
			},
			show: (varCondition)=>{
				if(varCondition == 'hidden'){
					hidden_.style.background="#6C6C6C";
				}else{
					hidden_.style.background="transparent";
				}
			}
		}
		this.toggles.menuHidden().then(
			(res)=> actions[action](res),
			(res)=> actions[action](res)
		);
	}
	menuDelete(){

		let menu = $('#deleteMenu');
		let radioButtonsDelete = {
			allHere: function(){
				let el = $('#allHere');
				el.bind = 'deleteAllHere';
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
		if(this.toggles.menuDelete == false){
			$('#deleteButton').style.background = "#6C6C6C";
			menu.style.height = '80%';
			menu.style.display = 'flex';

			$("#hiddenButton").style.color = 'red';
			$("#configButton").style.visible = 'hidden';
			this.toggles.menuDelete = true;
		}else{
			$('#deleteButton').style.background = "transparent";
			menu.style.display = 'none';
			this.toggles.menuDelete =false;
		}
		
	
	}
	insertNote(){
		this.sendContentScript({
			noteColor:this.selection.note, 
			fontColor:this.selection.font,
			action:'createNote'
		});
	}
}
new popup(
	['#2f3640', '#fd9644', '#f1c40f', '#26de81', '#2bcbba', '#9c88ff']
);