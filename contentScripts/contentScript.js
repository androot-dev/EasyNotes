chrome.runtime.onMessage.addListener (function (request, _, sendResponse) {
  alert(request)
  let font = document.createElement('link');
  font.href= "https://fonts.googleapis.com/css2?family=Comic+Neue&display=swap";
  font.rel ="stylesheet";

  document.body.insertAdjacentHTML('afterend', request);
  document.head.appendChild(font);
  return true;
});

 function el(id){return document.getElementById(id)}
    var dragged = null;
    var dropped = null;
    var dropoutEvent = null;
/* deag and drop*/ 
  function dragstart(evt, selector){
      dragged=selector;
    }
  function drag(evt, selector){
    evt.preventDefault();
    dragged.style.transition ="none";
      dragged.style.opacity ="0.5";
  }
  function dragenter(evt, selector){
    evt.preventDefault();
      dropoutEvent = false;
      dropped=selector;
  }
  function dragover(evt, selector){
      evt.preventDefault();
  }
  function dragleave(evt, selector){
      evt.preventDefault();
      dropoutEvent = true;
      dropped=null;
  }
  function dragend(evt){
      evt.preventDefault();  
      if(dropoutEvent == true){this.dropout();}
  }
 function drop(evt){
      evt.preventDefault();
      if (dragged!=null) {
        dragged.style.opacity = '1';
        this.move(this.dragged, this.dropped);
        this.move(this.dropped, this.dragged);
        dropped=null;
      dragged=null;
    }
  }  
  function dropout(){ /* my event */
    if(dragged != null){
     dragged.style.opacity = '1';
      }
      dropped=null;
      dragged=null;
  }