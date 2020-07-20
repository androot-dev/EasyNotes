class extension extends noteText {
	constructor() {
		super();
	}
	async removeNotesHere(rq) {
		let countNote = 0;
		let anchorUrl = this.getAnchorUrl(rq.url);

		let notesInDOM = document.querySelectorAll('.removeEx0A');
		notesInDOM = notesInDOM.length > 0 ? notesInDOM : notesInDOM[0];
		let storage = await this.getStorage();
		let notesHere = async function(fn) {
			let notes = await new Promise(async (resolve, reject) => {
				let countDeleteHere = 0;
				for (let i in storage) {
					await new Promise(async (resolve, reject) => {
						if ((storage[i].url && storage[i].url == rq.url && storage[i].anchorDomain == false) || 
							(storage[i].anchorDomain == true && storage[i].urlAnchor && storage[i].urlAnchor != "" && storage[i].urlAnchor == anchorUrl)) {
							resolve(fn(storage[i]));
						}
						else {
							resolve(0)
						}

					}).then((res) => {
						countDeleteHere += res;
					});
				}
				resolve(countDeleteHere);
			});
			return notes;
		}
		if (rq.action == 'removeNotesHere' || rq.action == 'deleteAll' || rq.action == 'hiddenNotes') {
			let deleteNotes = await notesHere(async (storage) => {
				if (rq.action == 'removeNotesHere') {
					if(storage.anchorDomain == false){
						await this.removeStorage(storage.url + storage.id);
					}else if(storage.anchorDomain == true){
						await this.removeStorage(storage.urlAnchor + storage.id);
					}
					
				}
				let el = document.querySelector('#removeEx' + storage.id);
				let elanchor = document.querySelector('#anchor-removeEx' + storage.id);
				let count = 0;
				if (el) {
					count += 1;
					el.delete();
				}
				if(elanchor){
					count += 1;
					elanchor.delete();
				}
				return count;
			});
			return {
				action: 'notesDelete',
				notesDelete: deleteNotes
			}
		}
	}
}


let EasyNotes = new extension();
EasyNotes.onMessages({
	default: async (request) => {
		if (typeof EasyNotes[request.action] == 'function') {
			let val = await EasyNotes[request.action](request);
			if (val && val.notesDelete) {
				EasyNotes.send(val);
			}
		}
	}

})