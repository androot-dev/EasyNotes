class font{
  constructor(){
    //this.fontLoad("https://fonts.googleapis.com/css2?family=Comic+Neue&display=swap");
  }
  fontLoad(link){
    if(!document.getElementById('font-ready')){
      let tag = document.createElement('link');
      tag.href=link;
      tag.rel ="stylesheet";
      tag.id = "font-ready";
      document.head.appendChild(tag);
    }
  }
}
class note extends font {
  constructor(){
    super();
    function getTotalNotes(){
      return document.querySelectorAll('.noteEx0A').length;
    }
    this.countNote = getTotalNotes();

  }
  createNote(request){
      const create = function(tag, attr){ 
        let el = document.createElement(tag);
        for (let key in attr){
          if(key == 'class'){
            el.classList+= attr[key];
          }else{
            el[key] = attr[key];
          }
          
        }
        return el;
      }
      const noteModel = {
        note: create ('div',{class:"noteEx0A", id:"noteEx"+(this.countNote+1)}),
        area: create ('div',{class:"areaEx0A", id:"areaEx"+(this.countNote+1)}),
        tack: create ('div',{class:"tackEx0A", id:"tackEx"+(this.countNote+1)}),
        span: create ('span',{class:"removeEx0A", id:"removeEx"+(this.countNote+1)}),
        text: create ('div',{
          class:"paperEx0A", 
          id:"paperEx"+(this.countNote+1),
          contentEditable: "true"
        }),
        generate: function(){
          this.tack.appendChild(this.span);
          this.note.appendChild(this.tack);
          this.note.appendChild(this.text);
          this.area.appendChild(this.note);
        },
        initialize: function(request){
          this.generate();
          let init = {
            beforeInsertStyle: (request)=>{
              this.note.style.background = request.noteColor;
              this.text.style.color = request.fontColor;
              this.area.style.height = document.body.clientHeight+'px';
            },
            insertNote: () => {
              function insertAfter(nodeRef, insertNode){
                if(nodeRef.nextSibling){ 
                    nodeRef.parentNode.insertBefore(insertNode,nodeRef.nextSibling); 
                } else { 
                    nodeRef.parentNode.appendChild(insertNode); 
                }
              }
                if(document.body.tagName == 'FRAMESET'){
                  document.body.insertAdjacentHTML('afterend', this.area.outerHTML);
                }else{
                  insertAfter( document.body.children[0], this.area);
                } 
            },
            afterInsertStyle: (request) =>{
              this.note.style.position = 'absolute';
              this.note.style.top = (window.scrollY+(this.note.clientHeight/2))+"px";
              this.note.style.left = this.note.offsetLeft+"px"; 
              this.area.style.visibility = 'hidden';
              this.note.style.visibility = 'visible';
            }

          }
          
          init.beforeInsertStyle(request);
          init.insertNote();
          init.afterInsertStyle(request);
         
       
        }}
      noteModel.initialize(request);
  }
}
class comunicationContentScript extends note{
  constructor(callback){
    super();
    chrome.runtime.onMessage.addListener ( (request, _, sendResponse) =>  {

      this[request.action](request);
      callback();

      return true;
    });
  }
}
class DragDrop{
  constructor(drag, drop){
    const $ = (sel) => { 
      let el = document.querySelectorAll(sel); //selecciona lista de elementos
      el.on = (evt) =>{ // añade un evento a todos los elementos de una lista 
        el.forEach( (element, index) => {

          if(evt == 'dragstart'){element.setAttribute('draggable', 'true')}
            element.mouseX = function(evt){ //obtiene la posicion x del mouse
              let ClientRect = this.getBoundingClientRect();
              return Math.round(evt.clientX - ClientRect.left)
            },
            element.mouseY = function(evt){
              let ClientRect = this.getBoundingClientRect();
              return Math.round(evt.clientY - ClientRect.top)
            }

            element.addEventListener(evt, (e) => 
            this[evt](e), false);
        });
      }
      return el; }
    this.dragElement = drag;
    this.dropElement = drop;
    this.dragged = null;
    this.dropped = null;
    this.dropoutEvent = null;
    this.dataEvents = {};
    $(this.dragElement).on('dragstart');
    $(this.dropElement).on('dragover');
    $(this.dropElement).on('drop');
    $(this.dragElement).on('drop');
  }
  setData(name, val){
     this.dataEvents[name] = val;
  }
  getData(nameProp){
    return this.dataEvents[nameProp];
  }
  dragstart(evt){

    if(evt.target.mouseX){
      let drag ={
        getArea: function(){
        let id ;

        for(let i =3; i<evt.target.id.length; i++){
          if(evt.target.id[i] == 'E'){
            id = evt.target.id.substring(i+2, evt.target.id.length);
            break;
          }
        }
        return document.getElementById("areaEx"+id);
       },
      css_start:function(){
        this.getArea().style.visibility = 'visible';
        evt.target.style.opacity = '1';
      },
      props_global:()=>{
         this.dragged = evt.target;
         this.setData('idArea', evt.target.id.replace('noteEx', ''));
      },
      preventGhost:function(){
        let img = document.createElement('img');
        evt.dataTransfer.setDragImage(img, 0, 0);
      }
     }
      drag.css_start();
      drag.props_global();
      this.setData('x', evt.target.mouseX(evt))
      this.setData('y', evt.target.mouseY(evt))
      drag.preventGhost();
    }else{
      evt.preventDefault()
    }
  }
  dragover(evt){

    let over = {

      area: document.getElementById('areaEx'+this.getData('idArea')),
      move: (area)=>{
        this.dragged.style.top =area.mouseY(evt)-this.getData('y') + 'px';
        this.dragged.style.left =area.mouseX(evt)-this.getData('x') + 'px';
      },
      setDropZones(arrayClass){
        //solo funciona si el dropzone tiene una sola clase
        let drop = false;
        for (let i in arrayClass){
          if(arrayClass[i] == evt.target.classList[0]){
            drop == true;
            break;
          }
        }
        if(drop == true){
           evt.preventDefault();
        }
      }
    }
    over.move(over.area);
    over.setDropZones(['areaEx0A', 'noteEx0A', 'paperEx0A', 'tackEx0A']);
  }
  drop(){
    
  }
  
  /* end class */
}
 new comunicationContentScript(() =>{
     new DragDrop('.noteEx0A', '.areaEx0A');
 });
