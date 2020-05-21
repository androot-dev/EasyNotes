class extension extends note{
	constructor(){
		super();
	}
	
	async deleteAllHere(rq, remove = true, deleteAll =false){
		let count = 0;
		let el = document.querySelectorAll('.removeEx0A');

		let notes = el.length > 0 ? el : el[0];
		let nrNotes = notes ? notes.length: false;
		let storage = await this.getStorage();
		if(remove == true){
			for(let i in storage){
				let nr=0;
				await new Promise(async(resolve, reject)=>{
					if(storage[i].url && storage[i].url == rq.url){
						await chrome.storage.sync.remove([rq.url+storage[i].id], ()=>{
			            	resolve(1);
		          		});
					}else{
						resolve(0);
					}

				}).then((res)=>{
					count+=res;
				});	
			}
		}
		if(nrNotes == false && count==0){
			return {notesDelete: '0'}
		}
		if(!notes){
			return {notesDelete: count}
		}
		await new Promise( async(resolve, reject) => {
			notes.forEach( async (element, index) => {
				await new Promise( async(resolve, reject) => {
					if(remove == true){
				     	await chrome.storage.sync.remove([element.idExtension], ()=>{	
			            	resolve();	
		          		});
		          	}else{
		          		let text = document.querySelector('#paperEx'+element.id.replace('removeEx', ""))
		          		if( text.textContent!="" && deleteAll==false){
		          			element.delete();
		          		}
		          		if( deleteAll==true ){
		          			element.delete();
		          		}
		          	}
		    	}).then((res)=>{
		    		element.delete();
			        count++;
		    		resolve();
		    	});
			});
		});
		return {notesDelete:count};
	}
}
let noteasy = new extension();

noteasy.cathMessage( async(request)=>{

	if(typeof noteasy[request.action] == 'function'){
		let val = await noteasy[request.action](request);
		noteasy.onDrag();
		return val;
	}
});