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
    this.referenceNode = document.body.children[0];
    this.deleteButton ;
  }
  notesLength(){
    return document.querySelectorAll('.noteEx0A').length;
  }
  createNote(request){
      const create = (tag, attr)=>{ 
        let el = document.createElement(tag);
        for (let key in attr){
          if(key == 'class'){
            if(attr[key] == "removeEx0A"){
              el.addEventListener('click',()=>{
                document.body.removeChild(document.getElementById('areaEx'+this.notesLength()));
              }, false);
            }
            el.classList+= attr[key];
          }else{
            el[key] = attr[key];
          }
        }

        return el;
      }
      const noteModel = {
        area: create ('div',{class:"areaEx0A", id:"areaEx"+(this.notesLength()+1)}),
        note: create ('div',{class:"noteEx0A", id:"noteEx"+(this.notesLength()+1)}),
        span: create ('span',{class:"removeEx0A", id:"removeEx"+(this.notesLength()+1)}),
        tack: create ('div',{ class:"tackEx0A",  id:"tackEx"+(this.notesLength()+1),}),
        text: create ('div',{
          class:"paperEx0A", 
          id:"paperEx"+(this.notesLength()+1),
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
                  document.body.insertBefore(this.area, this.referenceNode);
                  this.referenceNode = this.area;
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
      this.deleteButton = noteModel.tack.id;
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
 new comunicationContentScript(() =>{
     new DragDrop('.noteEx0A', '.areaEx0A');
 });
