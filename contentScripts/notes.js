class note  extends dragDrop{
  constructor(){
    super();
    this.id = this.getID();
    this.temp = [];
    this.default = {
      position: 'center',
      width: '4.3cm',
      height: '4.3cm'
    }
  }
  async getID(request){
    let notes = document.querySelectorAll('.noteEx0A');
    let id ;
    if(notes.length > 0){
       id = notes[notes.length-1].idnote;
       id++;
    }else{
      id = 1; 
    }
    if(request){
      let repeat = true;
      let key = id;
      return await new Promise(async(resolve, reject)=>{
          do{
            let res = await new Promise((resolve, reject)=>{
                chrome.storage.sync.get([request.url+key], function(res){
                    if(res[request.url+key]){
                      reject();
                    }else{
                      resolve(key);
                    }
                });     
            }).then( function(ID){ 
              repeat = false; 
              resolve(ID);
            }, () =>{ key++ });
          } while (repeat == true);
      });
    }else{
      return id;
    }
  }
 async createNote(request, 
  control_id ='auto', 
  position = "center", 
  width = this.default.width, 
  height = this.default.height){

      let id;
      if(control_id == 'auto'){
        id= await this.getID(request);
      }else{
        id = control_id;
      }
      this.id = id;
      function requestApply(noteModel, request){
        noteModel.note.style.background = request.noteColor;
        noteModel.text.style.color = request.fontColor;
        noteModel.text.style.width = width;
        noteModel.text.style.height = height;
      }
      let appendNote = (note) =>{
        note.style.height = document.body.clientHeight+'px';
        let referenceNode = () =>{
          let ID = this.getID();
          if(ID == 1){
            return document.body.children[0];
          }else{
            return document.body.children[ID];
          }
        }
        document.body.insertBefore(note, referenceNode());
      }
      let centerNote = (model)=>{
        model.note.style.position = 'absolute';
        model.note.style.top = (window.scrollY+(model.note.clientHeight/2))+"px";
        model.note.style.left = model.note.offsetLeft+"px"; 
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
        el.classList+= name+'Ex0A';
        el.id = name+"Ex"+id;  
        return el;
      }
       let model  = {
          area: create('div', 'area'),
          note: create('div', 'note'),
          span: create('span', 'remove'),
          tack: create('div', 'tack'),
          info: create('span', 'message'),
          text: create('textarea', 'paper'),

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
        model.text.classList+=" notranslate";

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
            this.style.setProperty('height', 'auto', 'important');
            this.style.setProperty('padding', '2px 4px', 'important');
            
            return setTimeout(()=>{
              this.textContent = "";
              this.style.setProperty('height', '0', 'important');
              this.style.setProperty('padding', '0px 0px', 'important');
            },time)
      }
      model.area.saveAuto = (time) =>{
          let save = async(e, time)=>{  

            if( model.text.value != "" ){
              if(this.temp[id]){
                clearTimeout(this.temp[id]);
              }   
              this.temp[id] = setTimeout(()=>{
                let id = model.note.idnote;
                  this.setStorage(request.url+id, {
                    fontColor:request.fontColor,
                    noteColor:request.noteColor,
                    text: model.text.value,
                    id: id,
                    url:request.url,
                    x: model.note.style.left,
                    y: model.note.style.top,
                    width: model.text.clientWidth+'px',
                    height: model.text.clientHeight+'px'
                });
                  model.info.show('Guardado');
              }, time);
            }
          }
          function eventResize(fn,  time){
            var width = model.text.clientWidth, height = model.text.clientHeight
            model.text.addEventListener("mouseup", function(){
              if(model.text.clientWidth != width || model.text.clientHeight != height){
                  fn(null, time);
              }
              width = model.text.clientWidth;
              height = model.text.clientHeight;
            });
          }
          model.text.addEventListener('keyup', (e) =>save(e, 2000));
          model.note.addEventListener('dragend', (e) =>save(e, 50));
          eventResize(save, 50);
        }
      }
      let activeProps = function(model){
        model.text.value = request.text;
        model.span.idExtension = request.url+model.span.idnote;
        model.area.saveAuto(2000);
        model.span.addEventListener('click',function(){
          chrome.storage.sync.remove([request.url+this.idnote], ()=>{
            this.delete();
          });
        }, false);

      }
      if(!request.text){request.text = ""}
        requestApply(model, request);
        addProps(model);
        activeProps(model);
        appendNote( model.fusion() );
        this.onDrag("#"+model.note.id, "#"+model.area.id);
        //model.text.focus();
        if (position == 'center') {
          centerNote(model);
        }else{
          setPosition(request.x, request.y);
        }      
      return id;
  }
  cleanNotesPageDynamic(){
    document.querySelectorAll('.removeEx0A').forEach( function(element, index) {
     let text = document.querySelector('#paperEx'+element.id.replace('removeEx', ""))
     if(text.value!=""){
        element.delete();
     }
    });
  }
  async loadNotes(request){
    let marginFail = 50;
    let count = 0;
    for (let i = 1; i < 200; i++) {
      const note = await this.getStorage(request.url+i);
      count = note!="empty" ?  0 : count++;
      if(count>marginFail){break}
      
      if(note!="empty"){
        let exist = document.getElementById('noteEx'+note.id);
        if(!exist){
          this.createNote(note, i, false, 
            note.width, 
            note.height);
        }
      }
    }
  }
}