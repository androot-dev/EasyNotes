class extension extends note{
	constructor(){
		super();
	}
}
let noteasy = new extension();

noteasy.cathMessage((request)=>{

	noteasy[request.action](request);
	noteasy.onDrag();

	
});