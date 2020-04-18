class note {
  constructor(){}
  createNote(Accessory='tack', dimensions = {width: 210, height:200}){
    
      let tag = function(tag, id){
        let el = document.createElement(tag);
        el.id=id;
        return el;
      }
      let note      = tag ('div', "noteEx0A")
      let textarea  = tag ('textarea', "paperEx0A")
      let accessory = tag ('div', Accessory+"Ex0A")
      let area      = tag ('div',"areaEx0A")
      if(Accessory == 'tack'){
        var remove  = tag ('span', "removeEx0A");
      }
      accessory.appendChild(remove)
      note.appendChild(accessory);
      note.appendChild(textarea);
      area.appendChild(note);
      this.fontLoad("https://fonts.googleapis.com/css2?family=Comic+Neue&display=swap");
      this.insertNote(area, note, accessory);
  }
  colorsNote(palette_note='default', accessory='tack'){
    let palettes = {
     default: ['#fc5c65', '#fd9644', '#fed330', '#26de81', '#2bcbba' ]
    };
    
    if (palette_note) {}
    let note = palettes[palette_note][ Math.floor(Math.random() * 6)];
    let tack  = tackColor[ Math.floor(Math.random() * 5)]

    return {
      noteColor: note,
      tackColor: tack
    }
  }
  insertNote(area, note, tack){
     area.style.height = document.body.clientHeight+'px';
     let colors = this.colorsNote();
     note.style.background = colors.noteColor;
     //tack.style.background = colors.tackColor.background;
     //tack.style.filter = colors.tackColor.filter;


     if(document.body.tagName == 'FRAMESET'){
        document.body.insertAdjacentHTML('afterend', area.outerHTML);
      }else{
        document.body.insertBefore(area, document.body.children[0]);
      }
      note.style.position = 'absolute';
      note.style.top = (window.scrollY+(note.clientHeight/2))+"px";
      note.style.left = note.offsetLeft+"px"; 
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
class recivedMessageBackground extends note{
  constructor(callback){
    super();
    chrome.runtime.onMessage.addListener ( (request, _, sendResponse) =>  {
      this[request]();
      callback();

      return true;
    });
  }
}

class dragAndDrop{
  constructor(arg){
    this.arg = arg;
    this.dragged = null;
    this.dropped = null;
    this.dropoutEvent = null;


  var events=(el, key, drop = false) => {
    let elements = document.querySelectorAll(el);

    let drops = document.querySelectorAll(this.arg[key].drop);

    for (let i = 0; i<elements.length; i++){
      if(drop == false){
      elements[i].setAttribute('draggable', 'true');
      
      elements[i].addEventListener('dragstart', (e) =>
       this.dragstart(e, elements[i]), false);
      } 

      if(drop == true){
        elements[i].addEventListener('dragover', (e) => 
        this.dragover(e, elements[i]), false);
     }
      /* 

      elements[i].addEventListener('dragenter', (e) => 
        this.dragenter(e, elements[i], drops), false);

      elements[i].addEventListener('dragend', (e) => 
        this.dragend(e, elements[i]), false);

      elements[i].addEventListener('dragleave', (e) => 
        this.dragleave(e, elements[i]), false);

       elements[i].addEventListener('drag', (e) => 
        this.drag(e, elements[i]), false);

        elements[i].addEventListener('drop', (e) => 
        this.drop(e, elements[i]), false);
      */
      
     
    }
  }
  for (let key = 0; key < arg.length; key++) {
      events(arg[key].drag, key);
      events(arg[key].drop, key, true);
  }
}
  dragstart(evt, element){
    console.log('dragstart in '+evt.target.id );
    evt.target.style.opacity = '1';
    this.dragged = evt.target;
  }
  drag(evt, element){
   evt.preventDefault();
   console.log('drag in '+evt.target.id )
  }
  dragenter(evt, element, drops){
      evt.preventDefault();
    var drop = false;
    for (let key in drops){
      if(drops[key] == element){
        drop = true;
        break;
      }
    }
    if(drop == true){
        console.log('DRAGENTER '+evt.target.id)
        this.dropoutEvent = false;
        this.dropped=evt.target;
      }else {

      
      }
  
  }
  dragover(evt, element){
   // console.log('dragover in '+evt.target.id )
   //cuando se previene el comportamiento por defecto de este evento
   //sequitan las limitaciones de drop, convirtiendo las zonas en droppables.
    if(evt.target.id == 'capa' /*droppables*/ ){
       evt.preventDefault();
    }
 

  }
  dragleave(evt, element){
    console.log('dragleave in '+evt.target.id )
    evt.preventDefault();
    this.dropoutEvent = true;
    this.dropped=null;
  }
  dragend(evt,  element){
    console.log('dragend in '+evt.target.id )
    if(this.dropoutEvent == true){this.dropout();}
  }
  drop(evt, element){

    console.log('drop in '+evt.target.id )
    function mousePosition(elemento, evt) {
        var ClientRect = elemento.getBoundingClientRect();
        return { //objeto
        x: Math.round(evt.clientX - ClientRect.left),
        y: Math.round(evt.clientY - ClientRect.top)
         }
      }
    if (this.dragged!=null) { 
    let pos = mousePosition(evt.target, evt);
    let centro = {
        width: this.dragged.clientWidth /2,
        height: this.dragged.clientHeight /2
      } 
      this.dragged.style.top = (pos.y-centro.height)+'px';
      this.dragged.style.left = (pos.x-centro.width)+'px';
      this.dropped=null;
      this.dragged=null;
    }
  }  
   dropout(){ /* my event */
    if(this.dragged != null){
     
    }
      this.dropped=null;
      this.dragged=null;
  }
}
 
 new recivedMessageBackground(() =>{

     new dragAndDrop([{
      drag:"#note", //draggable element
      drop: "#capa"
    }]);

 });
