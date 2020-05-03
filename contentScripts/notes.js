class note extends storage {
  constructor(){
    super();
    this.class ="Ex0A";
    this.id = this.getID();
    this.temp;
  }
  getID(){
    let notes = document.querySelectorAll('.noteEx0A');
    if(notes.length > 0){
    	 let id = notes[notes.length-1].idnote;
    	 id++;
    	 return id;
    }else{
		return 1;	
    }
  }
  createNote(request, control_id ='auto' ,position="center"){
      let id;
      if(control_id == 'auto'){
        id=this.getID();
      }else{
        id = control_id;
      }
      
      this.id = id;
      function requestApply(noteModel, request){
        noteModel.note.style.background = request.noteColor;
        noteModel.text.style.color = request.fontColor;
      }
      let appendNote = (note) =>{
        note.style.height = document.body.clientHeight+'px';
        let referenceNode = () =>{
          if(this.getID() == 1){
          	return document.body.children[0];
          }else{
          	return document.body.children[this.getID()];
          }
        }
        document.body.insertBefore(note, referenceNode());
      }
      let centerNote = (model)=>{
        model.note.style.position = 'absolute';
        model.note.style.top = (window.scrollY+(model.clientHeight/2))+"px";
        model.note.style.left = model.offsetLeft+"px"; 
        model.area.style.visibility = 'hidden';
        model.note.style.visibility = 'visible';
      }
      let setPosition = (x, y) =>{
      	model.note.style.position = 'absolute';
      	model.note.style.top = y;
        model.note.style.left = x; 
        model.area.style.visibility = 'hidden';
        model.note.style.visibility = 'visible';
      }
      let create=(tag, name)=>{
        let el = document.createElement(tag);
        el.classList+= name+this.class;
        el.id = name+"Ex"+id;  
        return el;
      }
       let model  = {
          area: create('div', 'area'),
          note: create('div', 'note'),
          span: create('span', 'remove'),
          tack: create('div', 'tack'),
          info: create('span', 'message'),
          text: create('div', 'paper'),

          fusion: function(){
            this.tack.appendChild(this.span);
            this.note.appendChild(this.info)
            this.note.appendChild(this.tack);
            this.note.appendChild(this.text);
            this.area.appendChild(this.note);
            return this.area;
          }
      }
    let addProps = (model) =>{
        for(let key in model){
          if(model[key]!='fusion'){
            model[key].idnote = model.note.id.replace('noteEx', "");
          }
        }
      model.span.delete = () =>{
        document.body.removeChild(
              document.getElementById('areaEx'+id)
        );
      }
      model.info.show = function(message, time=2000){
            this.textContent = message;
            this.style.background = '#EA2027';
            return setTimeout(()=>{
              this.textContent = "";
              this.style.background = 'transparent';
            },time)
      }
      model.area.saveAuto = (time) =>{
        model.text.addEventListener('keyup', (e) =>save(e, 2000));
        model.note.addEventListener('dragend', (e) =>save(e, 0));
          let save = (e, time)=>{
            if( model.text.textContent != "" ){
              clearTimeout(this.temp);
              
              this.temp = setTimeout(()=>{
                let id = model.note.idnote;
                  this.save(request.url+id, {
                    fontColor:request.fontColor,
                    noteColor:request.noteColor,
                    text: model.text.textContent,
                    id: id,
                    url:request.url,
                    x: model.note.style.left,
                    y: model.note.style.top
                });
                  model.info.show('Guardado');
              }, time);
            }
          }
        }
      }
      let activeProps = function(model){
        model.text.textContent = request.text;
        model.area.saveAuto(2000);
        model.span.addEventListener('click',function(){
          this.delete();
          chrome.storage.sync.remove([request.url+this.idnote]);
        }, false);
        model.text.contentEditable= "true";
      }
    	if(!request.text){request.text = ""}
        requestApply(model, request);
        addProps(model);
        activeProps(model);
        appendNote( model.fusion() );

	    if (position == 'center') {
	    	centerNote(model);
	    }else{
	    	setPosition(request.x, request.y);
	    }
	    return id;
  }
  async loadNotes(request){
    for (let i = 1; i < 100; i++) {
	    const note = await new Promise((resolve, reject) => {
	     	this.load(request.url+i, (res)=>{
		     	if(res){
		    		resolve(res);
		      }
	    	})
	    });
	    if(note[request.url+i]){
	    	this.createNote(note[request.url+i], i, false);
	    	this.onDrag();
	    }
    }
  }
   
}