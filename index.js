class colors{
	constructor(note, font){
		this.note = note;
		this.font = font;
		this.setNotePreferedColor();

	}
	setNotePreferedColor(){
		function elPrefered(val){
			return document.getElementById('colorNote-'+val);
		}

		for(let i=0; i <= 5; i++){
			elPrefered(i).style.background = this.note[i];
			elPrefered(i).addEventListener('click',()=>{
				document.getElementById('miniNote').style.background = this.note[i];
			}, false);
		}
	}
	

}

new colors(['#2f3640', '#fd9644', '#f1c40f', '#26de81', '#2bcbba', '#9c88ff'],'');


function SendBackgroundMessage(msj){
	
	chrome.runtime.sendMessage({msg: 'createNote'});
}
