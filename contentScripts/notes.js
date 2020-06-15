var Ex$ = (sel)=>{
  let el = document.querySelectorAll(sel).length > 1 ?
  document.querySelectorAll(sel) : document.querySelectorAll(sel)[0];

  function addMethods (el){
    el.on = function(evt, fn){
        el.addEventListener(evt, fn, false);
    }
    el.animate = function(start, end, time=2000, toggle = false, transition=200){
      transition = transition /1000;
      let temp = {end:end, start:start};
      if(!el.toggleAction){
        el.toggleAction = 'open';
      }
      if(toggle == true){

         if(el.toggleAction == 'close'){
          el.toggleAction = 'open';
          end = temp.start;
          start = temp.end;
        }else{
          el.toggleAction = 'close';
          end = temp.end;
          start = temp.start;
        } 

      }
      

      el.style.transition = 'all '+transition+'s ease-in-out';
      for(let key in start){
        el.style[key] = start[key]; 
      }
      if(el.toggle){
        clearTimeout(el.toggle);
      }
      el.toggle = setTimeout(function(){
        for(let key in end){
          el.style[key] = end[key]; 
        }
      }, time);
      
    }
  }
  if(el){
    if(el.tagName){
      addMethods(el);
    }else{
      el.on = function(evt, fn){
        el.forEach( function(element, index) {
          element.addEventListener(evt,(evt)=> fn(evt), false);
        });
      }
      el.forEach( function(el, index){
        addMethods(el);
      });
    }
    return el;
  }else{
    console.log('no se encontro el selector: '+ sel);
    return undefined;
  }
}
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
    this.palleteActive = [
        '#2f3640', 
        '#fd9644', 
        '#f1c40f', 
        '#26de81', 
        '#2bcbba', 
        '#9c88ff'

    ];
    this.save = async(e, time, model, request, id)=>{  

            if( model.text.value != "" ){
              if(this.temp[id]){
                clearTimeout(this.temp[id]);
              }   
              this.temp[id] = setTimeout(()=>{
                let id = model.note.idnote;
                  this.setStorage(request.url+id, {
                    fontSize:model.text.style.fontSize,
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
                  model.info.show(null);
              }, time);
            }
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
    height = this.default.height,
    fontSize = '29px'
    ){

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
          noteModel.text.style.fontSize = fontSize;
          noteModel.text.style.lineHeight = fontSize;
          noteModel.menu.style.color = request.fontColor;
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
            icon: create('button', 'config'),
            menu: create('ul', 'menuConfig'),
            save: create('span', 'saveIcon'),

            fusion: function(){
              this.tack.appendChild(this.span);
              this.note.appendChild(this.info);
              this.note.appendChild(this.tack);
              this.note.appendChild(this.save);
              this.note.appendChild(this.text);
              this.note.appendChild(this.icon);
              this.note.appendChild(this.menu);
              this.area.appendChild(this.note);
              return this.area;
            }
        }
        let addProps = (model) =>{
          model.text.classList+=" notranslate";
          let type = request.fontColor == "white" ? "-light.svg" : '.svg';
         
          model.menu.innerHTML = `
            <span>Texto</span><br>
              <input type="number" value="`+model.text.style.fontSize.replace('px', '')+`" /> px<br>
            <span>Color</span><br>
              <div class="colorsEx0A" id="colorsEx`+id+`">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
              </div>
          `;
          model.menu.style.backgroundColor = request.noteColor;
          model.icon.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/cog'+type)+")";
          model.save.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/save'+type)+")";
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
              if(message != null){
                this.style.setProperty('height', 'auto', 'important');
                this.style.setProperty('padding', '2px 4px', 'important');
              }else{

                model.save.style.opacity = '1';
              }
              
              
              return setTimeout(()=>{
                this.textContent = "";
                this.style.setProperty('height', '0', 'important');
                this.style.setProperty('padding', '0px 0px', 'important');
                model.save.style.opacity = '0';
              },time)
        }
        model.area.saveAuto = (time) =>{
          
            function eventResize(fn,  time, model, request){
              var width = model.text.clientWidth, height = model.text.clientHeight
              model.text.addEventListener("mouseup", function(){
                if(model.text.clientWidth != width || model.text.clientHeight != height){
                    fn(null, time, model, request, id);
                }
                width = model.text.clientWidth;
                height = model.text.clientHeight;
              });
            }
            model.text.addEventListener('keyup', (e) =>{
              this.save(e, 2000, model, request, id)
            });
            model.note.addEventListener('dragend', (e) =>{
              this.save(e, 50, model, request, id)
            });
            eventResize(this.save, 50, model, request, id);
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

          Ex$('#configEx'+id).addEventListener('click', ()=>{
            
            Ex$('#menuConfigEx'+id).animate({
              opacity: '0',
              visibility: 'hidden'
            },{
              opacity: '1',
              visibility:'visible'
            }, 60, true);

          }, false)
        
          if (position == 'center') {
            centerNote(model);
          }else{
            setPosition(request.x, request.y);
          }     
        let setConfigColors = ()=>{
          let colors = Ex$('#colorsEx'+id+' div');
          let input = Ex$('#'+model.menu.id+' input');
          input.addEventListener('change', ()=>{
            model.text.style.fontSize = input.value+'px';
            model.text.style.lineHeight = input.value+'px';
            this.save(null, 50, model, request, id);
          }, false)
          colors.forEach( (el, key) =>{
            el.addEventListener('click', ()=>{
              request.noteColor = this.palleteActive[key];
              request.fontColor = 'black';
              model.note.style.background = this.palleteActive[key];
              model.menu.style.background = this.palleteActive[key];
              model.text.style.color = 'black';
              model.menu.style.color = 'black';
              model.icon.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/cog.svg')+")";
              model.save.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/save.svg')+")";
              if(key == 0){
                model.text.style.color = 'white';
                model.menu.style.color = 'white';
                request.fontColor = 'white';
                model.save.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/save-light.svg')+")";
                model.icon.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/cog-light.svg')+")";
              }
              this.save(null, 50, model, request, id);
            },false);
            el.style.background = this.palleteActive[key]
          }); 

        }
        window.addEventListener('click', function(e){   
          if ( !model.menu.contains(e.target) ){
              model.menu.style.opacity = '0';
              model.menu.style.visibility = 'hidden';
              model.menu.toggleAction = 'open';
          }
        });
        setConfigColors();
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
              note.height,
              note.fontSize
              );
          }
        }
      }
  }
}