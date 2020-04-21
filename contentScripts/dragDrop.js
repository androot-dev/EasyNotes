
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
    this.dropoutEvent = null;
    this.dataEvents = {};
    $(drag).on('dragstart');
    $(drop).on('dragover');
    $(drag).on('drop');
  }
  setData(name, val){
     this.dataEvents[name] = val;
  }
  getData(nameProp){
    return this.dataEvents[nameProp];
  }
  clearData(){
    this.dataEvents = {};
  }
  dragstart(evt){
    this.clearData();
    if(evt.target.mouseX){
      let drag ={
      css_start:()=>{
        this.getData('areaDrop').style.visibility = 'visible';
      },
      props_global:()=>{
         this.setData('drag', evt.target);
         this.setData('areaDrop', 
          document.getElementById("areaEx"+evt.target.id.replace('noteEx', '')));
      },
      preventGhost:function(){
        let img = document.createElement('img');
        evt.dataTransfer.setDragImage(img, 0, 0);
      }
     }
      drag.props_global();
      drag.css_start(); 
      this.setData('x', evt.target.mouseX(evt))
      this.setData('y', evt.target.mouseY(evt))
      drag.preventGhost();
    }else{
      evt.preventDefault()
    }
  }
  dragover(evt){
    
    let over = {

      area: this.getData('areaDrop'),
      move: (area)=>{
        this.getData('drag').style.top =area.mouseY(evt)-this.getData('y') + 'px';
        this.getData('drag').style.left =area.mouseX(evt)-this.getData('x') + 'px';
      },
      setDropZones(arrayClass){
        //solo funciona si el dropzone tiene una sola clase
        let drop = false;
        for (let i in arrayClass){
          if(arrayClass[i] == evt.target.classList[0]){
            drop = true;
            break;
          }
        }
        if(drop == true){
          console.log('dropable')
           evt.preventDefault();
        }
      }
    }
    over.move(over.area);
    over.setDropZones(['areaEx0A', 'noteEx0A', 'paperEx0A', 'tackEx0A']);
  }
  drop(evt){
    this.getData('areaDrop').style.visibility = 'hidden';
  }
  /* end class */
}