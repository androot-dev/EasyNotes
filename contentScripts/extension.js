class extension extends note{
	constructor(){
		super();
	}
	
	async removeNotesHere(rq){
		let countNote = 0;
		let notesInDOM = document.querySelectorAll('.removeEx0A');
		notesInDOM = notesInDOM.length > 0 ? notesInDOM : notesInDOM[0];

		let storage = await this.getStorage();
		let notesHere = async function(fn){
			let notes = await new Promise(async(resolve, reject)=>{
				let countDeleteHere = 0;
				for(let i in storage){
					await new Promise(async(resolve, reject)=>{
						if(storage[i].url && storage[i].url == rq.url){
							resolve(fn(storage[i]));
						}else{
							resolve(0)
						}
					}).then((res)=>{
						countDeleteHere+=res;
					});	
				}
				resolve(countDeleteHere);
			});
			return notes;
		}	
		if(rq.action == 'removeNotesHere' || rq.action == 'deleteAll' 
			|| rq.action =='hiddenNotes'){

			
			let deleteNotes = await notesHere( async (storage) =>{
				if(rq.action == 'removeNotesHere'){
				
					await this.deleteStorage(storage.url+storage.id);
				}
				let elDOM = document.querySelector('#removeEx'+storage.id);
				if(elDOM){ elDOM.delete() } 


				return 1;
			});
			return {notesDelete: deleteNotes}
		}
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