

<script>
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
      if(dropoutEvent == true){dropout();}
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

    chrome.runtime.sendMessage({msg: el('note').outerHTML}, function(response) {
     
    }); 
      dropped=null;
      dragged=null;
  }

export default {
  name: 'app',
  data () {
    return {
      notes:[],
      domain: undefined
    }
  },
  methods:{
    openNote(){
      
      let note = el('note');
      note.style.display = 'flex'; 
      note.addEventListener('dragstart', (e) => dragstart(e, note), false);
      note.addEventListener('drag', (e) => drag(e, note), false);
      note.addEventListener('dragend', (e) => dragend(e, note), false);
      note.addEventListener('dragenter', (e) => dragenter(e, note), false);
      note.addEventListener('dragover', (e) => dragover(e, note), false);
      note.addEventListener('dragleave', (e) => dragleave(e, note), false);
      note.addEventListener('drop', (e) => drop(e, note), false);
      note.setAttribute('draggable', 'true');
      el("app").setAttribute('draggable', 'true');
      el('paper').focus();
    }
  },
  computed:{
    getDomain: function(){ 

      chrome.tabs.query({'active': true, lastFocusedWindow: true},  (tab)=> {
          let url = new URL (tab[0].url);
          let domain = url.hostname;
          this.domain = domain;
          return domain;
      });

    },
  }
}
</script>

<style>
#note{
  display: none;
  position: absolute;
  width: 100%;
  height: 100%;
  background:#EEEEEE;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
#paper{
  position: relative;
  border: none;
  font-family: "NeueR";
  font-size: 15px;
  font-weight: 600;
  width: 90%;
  height: 90%;
  background: transparent;
  resize: none;
}

body, html{
 background: black;
}
#domain{
  width: 100%;
  display: block;
  justify-content: center;
  align-items: center;
  font-family: "NeueR";
  font-size: 13;
  background: #E8E8E8;
  border-bottom:solid 1px black;
  padding: 5px;
  overflow-x: auto;
  overflow-y: hidden;
  text-align: center;
}
#logo-empty{
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center; 
  padding: 10px;
  cursor: pointer;
}
#logo:hover{
  transition: all 0.2s ease-in-out;
  transform: scale(1.04);
}
#logo-empty span{
  font-family: "NeueB";
  font-style: italic;
  font-size: 25px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
#logo-empty #logo{
  width: 200px;
  height: 200px;
  background-image: url("./assets/logo.png"); 
}
.image{
  background-size: 150px;
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: scroll;
}
#app{
  background: #E8E8E8;
  max-height: 300px;
  max-width: 200px;
  padding: 5px;
  padding-top: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

</style>