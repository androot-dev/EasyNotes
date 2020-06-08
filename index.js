import $ from './src/js/methods.js';
import { APIchrome } from './src/js/chromeAPI.js';

class popupComunication extends APIchrome{

 constructor(){ 
 	super();
 	this.toggles = {
		menuDelete:false,
		menuHidden:async ()=>{
			return await new Promise(async (resolve, reject) =>{
				let value = await this.getStorage('hiddenNotes');

				return value!='empty' ? resolve(value) 
				: reject('show');

			});
		}
	}
	this.onMessages({
		notesDelete:(msg)=>{
			msg = msg.notesDelete; 
			let plural = msg>1 || msg==0 ? "s": "";
 			this.showBubbleMessage(+msg+' nota'+plural+' eliminada'+plural);
		},
		accessUrlBloked: ()=>{
			this.showBubbleMessage('Página no accesible');
		}
	});
 }

showBubbleMessage(msg, time=2500, color = {background:'auto' , font:'auto'}){
 	let bubble = $('#bubbleInfo');

 	bubble.textContent = msg;
 	if(color.background && color.background != 'auto'){
 		bubble.style.background = color.background;
 	}
 	if(color.font && color.font != 'auto'){
 		bubble.style.color = color.font;
 	}
 	bubble.animate({opacity:'1'},{opacity:'0'}, 2000);
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
			this.send({verifyURL: 'createFeedback'});
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
		
				this.send({
					action:checked,
					url:tab[0].url

				}, tab[0].id);

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

		this.send({
			verifyURL: 'createNote',
			noteColor: this.selection.note,
			fontColor: this.selection.font
		});
	}
}
new popup(
	['#2f3640', '#fd9644', '#f1c40f', '#26de81', '#2bcbba', '#9c88ff']
);