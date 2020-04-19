class popupColors{
	constructor(notesColors, fontColor='#000'){
		this.prefereds = notesColors;
		this.fontColor = fontColor;
		this.selection = {

		}
		this.setListPreferedColor();
		this.getSelectedColor(2);

	}
	ifdarkNote(key){
		if(key == 0 /* black */){
			document.querySelectorAll('.falseLetter').forEach( 
				(element, index) => {
				element.style.background = '#EEEEEE';
				this.selection.font = 'white';
			});
		}else{
			document.querySelectorAll('.falseLetter').forEach( 
				(element, index) => {
				element.style.background = 'black';
				this.selection.font = "black";
			});
		}
	}
	setColorNote(keySelect, auto = false){
		let prefered = document.querySelectorAll('.prefered')

		prefered.forEach( function(element, index) {
			element.style.transform = 'scale(1)';
		});
		this.ifdarkNote(keySelect);
		document.getElementById('colorNote-'+keySelect).style.transform = 'scale(1.4)';
		document.getElementById('miniNote').style.background = this.prefereds[keySelect];
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
		function prefered(val){
			return document.getElementById('colorNote-'+val);
		}

		for(let i=0; i <= 5; i++){
			prefered(i).style.background = this.prefereds[i];
			prefered(i).addEventListener('click',()=>{
				this.setColorNote(i);
			}, false);
		}
	}
}
class popupComunication{
 /*
 Esta clase se encarga de comnicar el popup con los script de contenido
  y el background.js 
 */
 constructor(){ }
 send(msg, destination, action){
 	msg.action = action;
 	msg.destination = destination;
	chrome.runtime.sendMessage(msg);
 }
 message_createNote(noteColor, fontColor){
 	this.send({noteColor:noteColor, fontColor:fontColor}, 'contentScript', 'createNote');
 }

}
let colors = new popupColors(
	['#2f3640', '#fd9644', '#f1c40f', '#26de81', '#2bcbba', '#9c88ff']);


let send = new popupComunication();

document.getElementById('miniNote').addEventListener('click', function(){
	send.message_createNote(colors.selection.note, colors.selection.font);
},false);

