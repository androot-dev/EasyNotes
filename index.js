class colors{
	constructor(note, font){
		this.note = note;
		this.font = font;
		this.setListPreferedColor();
		this.getSelectedColor();

	}
	setColorNote(keySelect, auto = false){
		let prefered = document.querySelectorAll('.prefered')

		prefered.forEach( function(element, index) {
			element.style.transform = 'scale(1)';
		});

		document.getElementById('colorNote-'+keySelect).style.transform = 'scale(1.4)';
		document.getElementById('miniNote').style.background = this.note[keySelect];
		if(auto!=true){
			chrome.storage.sync.set({key: keySelect}, function() {
          		console.log('se guardo el indice'+keySelect );
        	});
		}
	}
	getSelectedColor(){
		chrome.storage.sync.get(['key'], (result) => {
			console.log(result)
			if(result.key){
				this.setColorNote(result.key, true);
			}
        });
	}
	setListPreferedColor(){
		function prefered(val){
			return document.getElementById('colorNote-'+val);
		}

		for(let i=0; i <= 5; i++){
			prefered(i).style.background = this.note[i];
			prefered(i).addEventListener('click',()=>{
				this.setColorNote(i);
			}, false);
		}
	}
}

new colors(['#2f3640', '#fd9644', '#f1c40f', '#26de81', '#2bcbba', '#9c88ff'],'');


function SendBackgroundMessage(msj){
	
	chrome.runtime.sendMessage({msg: 'createNote'});
}
