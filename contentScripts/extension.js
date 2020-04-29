class extension extends note{
	constructor(){
		super();
	}
}
let noteasy = new extension();

noteasy.cathMessage((request)=>{
	let idNote = noteasy[request.action](request);

	noteasy.onDrag();
});