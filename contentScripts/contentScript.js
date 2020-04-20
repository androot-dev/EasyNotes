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
        el.id = attr.id;
        el.className+=attr.class;
        return el;
      }
      const noteModel = {
        note: create ('div',{class:"noteEx0A", id:"noteEx"+(this.countNote+1)}),
        area: create ('div',{class:"areaEx0A", id:"areaEx"+(this.countNote+1)}),
        tack: create ('div',{class:"tackEx0A", id:"tackEx"+(this.countNote+1)}),
        span: create ('span',{class:"removeEx0A", id:"removeEx"+(this.countNote+1)}),
        text: create ('textarea',{class:"paperEx0A", id:"paperEx"+(this.countNote+1)}),
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
            element.addEventListener(evt, (e) => 
            this[evt](e), false);
        });
      }
      return el; }
    this.dragElement = drag;
    this.dropElement = drop;
    this.IDelement;
    this.dragged = null;
    this.dropped = null;
    this.dropoutEvent = null;
   
    $(this.dragElement).on('dragstart');
    $(this.dropElement).on('dragover');
    $(this.dropElement).on('drop');
    $(this.dragElement).on('drop');
  }
  
  dragstart(evt){
    function mousePosition(id) {
        var ClientRect = document.getElementById(id).getBoundingClientRect();
        return { //objeto
          x: Math.round(evt.clientX - ClientRect.left),
          y: Math.round(evt.clientY - ClientRect.top)
        }
    }
    let intID = evt.target.id.replace('noteEx', '');
    let area = document.getElementById("areaEx"+intID);
    area.style.visibility = 'visible';
    evt.target.style.opacity = '1';
    this.dragged = evt.target;
    this.IDelement = intID;
    let pos = mousePosition(evt.target.id);
    let posArea = mousePosition("areaEx"+this.IDelement);
    evt.dataTransfer.setData('x', pos.x);
    evt.dataTransfer.setData('y', pos.y);
    let img = document.createElement('img');

    evt.dataTransfer.setDragImage(img, 0, 0);
    evt.dataTransfer.effectAllowed = "none";
  }
  dragover(evt){
    function mousePosition(id) {
      var ClientRect = document.getElementById(id).getBoundingClientRect();
      return { //objeto
        x: Math.round(evt.clientX - ClientRect.left),
        y: Math.round(evt.clientY - ClientRect.top)
      }
    }
    let posMouse = mousePosition("areaEx"+this.IDelement);
     let positionPressMouseNote = {
        x: evt.dataTransfer.getData('x'),
        y: evt.dataTransfer.getData('y')
      } 
      this.dragged.style.top = (posMouse.y-positionPressMouseNote.y)+'px';
      this.dragged.style.left= (posMouse.x-positionPressMouseNote.x)+'px';
    if(evt.target.classList[0] == 'areaEx0A' ||  
       evt.target.classList[0] == 'noteEx0A' ||
       evt.target.classList[0] == 'paperEx0A' ||
       evt.target.classList[0] == 'tackEx0A'){
      evt.preventDefault();
    }
  }
  drop(evt){
    function mousePosition(id) {
      var ClientRect = document.getElementById(id).getBoundingClientRect();
      return { //objeto
        x: Math.round(evt.clientX - ClientRect.left),
        y: Math.round(evt.clientY - ClientRect.top)
      }
    }
    console.log(evt.target.classList[0])
    if (this.dragged!=null && evt.target.classList[0] == 'areaEx0A') { 
      let posMouse = mousePosition("areaEx"+this.IDelement);
      let positionPressMouseNote = {
          x: evt.dataTransfer.getData('x'),
          y: evt.dataTransfer.getData('y')
        } 
        evt.target.style.visibility = 'hidden';
        this.dragged.style.top = (posMouse.y-positionPressMouseNote.y)+'px';
        this.dragged.style.left= (posMouse.x-positionPressMouseNote.x)+'px';
        this.dropped=null;
        this.dragged=null;

      }
  } 
  /* end class */
}
 new comunicationContentScript(() =>{
     new DragDrop('.noteEx0A', '.areaEx0A');
 });
