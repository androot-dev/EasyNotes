class extension extends noteText {
	constructor() {
		super();
	}
	async removeNotesHere(rq) {
		let countNote = 0;
		let notesInDOM = document.querySelectorAll('.removeEx0A');
		notesInDOM = notesInDOM.length > 0 ? notesInDOM : notesInDOM[0];
		let storage = await this.getStorage();
		let notesHere = async function(fn) {
			let notes = await new Promise(async (resolve, reject) => {
				let countDeleteHere = 0;
				for (let i in storage) {
					await new Promise(async (resolve, reject) => {
						if (storage[i].url && storage[i].url == rq.url) {
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
					await this.removeStorage(storage.url + storage.id);
				}
				let elDOM = document.querySelector('#removeEx' + storage.id);
				if (elDOM) {
					elDOM.delete()
				}
				return 1;
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