import $ from './src/js/methods.js';
import APIchrome from './src/js/chromeAPI.js';
import defaultPallete from './src/js/palletes.js';

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
	 			this.showBubbleMessage(msg+' nota'+plural+' eliminada'+plural);
			},
			accessUrlBloked: ()=>{
				this.showBubbleMessage('Página no accesible');
			}
		});
 	}
	showBubbleMessage(msg ,time=2500){
	 	let bubble = $('#bubbleInfo');
	 	bubble.textContent = msg;
	 	bubble.animate({opacity:'1'},{opacity:'0'}, 2000);
	}
}
class colors extends popupComunication{
	constructor(){
		super();
	}
	async onSelectionColor(defaultColor){
		let toolbar = $('#toolbar');
		let arrayPalletes = this.palletes;
		let storageConfig = await this.getStorage('defaultConfigNote');
		 
		for(let key in arrayPalletes){
			let styleNote = arrayPalletes[key].generatePallete();
			toolbar.appendChild( styleNote );

			$('#'+styleNote.id+' li').on('click', (evt)=>{
				let keyColor = evt.target.id.replace('colorNote-', "");
				this.selectColor(key, keyColor, styleNote.id);
			})
		}
		if(storageConfig != 'empty'){
			this.selectColor(storageConfig.pallete, storageConfig.color);
		}else{
			this.selectColor(defaultColor.pallete, defaultColor.color);
		}
	}
	selectColor(key, keyColor){
		let el = this.palletes[key].colors[keyColor];
		$('.prefered').forEach( function(element, index) {
			element.style.transform = 'scale(1)';
		});
		$('#styleNote'+key+' > #colorNote-'+keyColor).style.transform = 'scale(1.4)';
		$('#miniNote').style.background = el.color;
		$('#bubbleInfo').style.background = el.color;
		$('#bubbleInfo').style.color = el.font;
		$('.falseLetter').forEach( function(element, index) {
			element.style.background = el.font;
		});
		this.setStorage('defaultConfigNote', {pallete:key, color:keyColor});
	}
}
class popup extends colors{
	constructor(arrayPalletes){
		super();
		this.palletes = arrayPalletes;
		this.onSelectionColor({pallete:0, color:2});
		
		this.menuHidden('show');

		$('#miniNote').on('click', async ()=> {
			let config = await this.getStorage('defaultConfigNote');
			let note=this.palletes[config.pallete].colors[config.color];
			this.send({
				verifyURL: 'createNote',
				noteColor: note.color,
				fontColor: note.font
			});
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
					this.send({action:'showNotes'})
					hidden_.style.backgroundColor="transparent";
					this.setStorage('hiddenNotes', newValue);

				}else if(varCondition == 'show'){	
					this.send({action:'hiddenNotes'})
					hidden_.style.backgroundColor="#636e72";
					this.setStorage('hiddenNotes', newValue);				
				}

			},
			show: (varCondition)=>{
				if(varCondition == 'hidden'){
					this.setStorage('hiddenNotes', 'hidden');
					hidden_.style.backgroundColor="#636e72";
				}else{		
					this.setStorage('hiddenNotes', 'show');
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
				this.send({action:checked});
				break;

			case 'removeNotesHere':
				let tab = await this.getTab('active');

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
}
new popup([defaultPallete]);