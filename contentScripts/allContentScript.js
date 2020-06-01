/* DRAG AND DROP */
class DragDrop{
  constructor(){
      this.dataEvents = {};
      this.principalElement = document.body;
      this.searchPrincial = false;
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
  onDrag(){
    let drag = '.noteEx0A';
    let drop = '.areaEx0A';
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
    $(drag).on('dragend')
    $(drag).on('dragstart');
    $(drop).on('dragover');
    
   // $(drag).on('drop');
  }
  searchPrincialElement(){
    let heightPrincipal = document.body.clientHeight;
    let el = document.body;
    let elements = document.querySelectorAll('body > *');
    elements.forEach( function(element, index) {
       if(element.clientHeight && element.clientHeight > heightPrincipal &&
        element.classList[0] != "areaEx0A"){
          heightPrincipal = element.clientHeight;
          el = element;
       }
    });
    return el;
  }
  dragstart(evt){
    this.clearData();
    if(evt.target.mouseX){
      if(this.searchPrincial == false){
        this.principalElement = this.searchPrincialElement();
        this.searchPrincial = true;
      }
      let drag ={
        props_global:() =>{
           this.setData('drag', evt.target);
           this.setData('areaDrop', 
           document.getElementById("areaEx"+evt.target.id.replace('noteEx', '')));
        },
        css_start:()=>{
          this.getData('areaDrop').style.visibility = 'visible';
          this.getData('areaDrop').style.height = this.principalElement.clientHeight+'px';
        },
        preventGhost:() =>{
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
  dragend(evt){
    this.getData('areaDrop').style.visibility = 'hidden';
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
           evt.preventDefault();
        }
      }
    }
    over.move(over.area);
    over.setDropZones(['areaEx0A', 'noteEx0A', 'paperEx0A', 'tackEx0A']);
  }
  //drop(evt){}
  /* end class */
}
/* DRAG AND DROP */

/* COMUNICATION */
class comunicationContentScript extends DragDrop{
  constructor(){
    super();
  }
  send(msg, destination, action){
  	msg.destination = destination;
  	msg.action = action;
  	chrome.runtime.sendMessage(msg);
  }
  cathMessage(fn){
    chrome.runtime.onMessage.addListener(async (request, _, sendResponse) =>  {
  	  let retorno = false;
      const res = await new Promise(async (resolve, reject) => {
        let response = await fn(request);
       
        if(response && response.notesDelete){
          resolve(response);
        }else{
          resolve(true);
        }
      }).then((response)=>{
          if(response != true){
            chrome.runtime.sendMessage(response);   
          }
        });
      });
  }
}


/* COMUNICATION */

/* STORAGE */
class storage extends comunicationContentScript{
	constructor(){
		super();
	}
	save(name, data){
		chrome.storage.sync.set({[name]:data}); 
	}
	load(name, fn){
	  chrome.storage.sync.get([name], function(res){
	  	fn(res);
	  	return res;
	  });
	}
	async deleteStorage(key){
		new Promise((resolve, reject)=>{
			chrome.storage.sync.remove([key], ()=>{
				resolve();
			})
		})
	}
	async getStorage(request = null){
		return await new Promise (async(resolve, reject)=>{
			chrome.storage.sync.get(request, (items)=>{
				if(items){
					resolve( items );
				}else{
					resolve( 'empty' );
				}
			});
		});
	}
	async setStorage(key, value){
		let exist = await this.getStorage(key);
		return new Promise ((resolve, reject)=>{
			chrome.storage.sync.set({[key]:value}, function(){
				if(exist == {}){
					resolve('setted')
				}else{
					resolve('modified')
				}
			}); 
		});
		
	}
}
/* STORAGE */

/* NOTES */
class note extends storage {
  constructor(){
    super();
    this.id = this.getID();
    this.temp = [];
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
 async createNote(request, control_id ='auto', position = "center"){
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
        model.text.classList+=" notranslate";
        model.note.fontColor = request.fontColor;
        model.note.backColor = request.noteColor;
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
        model.text.addEventListener('keyup', (e) =>save(e, 2000));
        model.note.addEventListener('dragend', (e) =>save(e, 0));
          let save = async(e, time)=>{    
            if( model.text.textContent != "" ){
              if(this.temp[id]){
                clearTimeout(this.temp[id]);
              }   
              this.temp[id] = setTimeout(()=>{
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
        model.span.idExtension = request.url+model.span.idnote;
        model.area.saveAuto(2000);
        model.span.addEventListener('click',function(){
          chrome.storage.sync.remove([request.url+this.idnote], ()=>{
            this.delete();
          });
        }, false);
        model.text.contentEditable= "true";
      }
    	if(!request.text){request.text = ""}
        requestApply(model, request);
        addProps(model);
        activeProps(model);
        appendNote( model.fusion() );
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
     if(text.textContent!=""){
        element.delete();
     }
    });
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
        let exist = document.getElementById('noteEx'+note[request.url+i].id);
        if(!exist){
          this.createNote(note[request.url+i], i, false);
          this.onDrag();
        }
	    }
    }
  }
}
/* NOTES */

/* EXTENSION*/
class extension extends note{
  constructor(){
    super();
  }
  
  async removeNotesHere(rq){
    let countNote = 0;
    let notesInDOM = document.querySelectorAll('.removeEx0A');
    notesInDOM = notesInDOM.length > 0 ? notesInDOM : notesInDOM[0];

    let storage = await this.getStorage();
    let notesHere = async function(fn){
      let notes = await new Promise(async(resolve, reject)=>{
        let countDeleteHere = 0;
        for(let i in storage){
          await new Promise(async(resolve, reject)=>{
            if(storage[i].url && storage[i].url == rq.url){
              resolve(fn(storage[i]));
            }else{
              resolve(0)
            }
          }).then((res)=>{
            countDeleteHere+=res;
          }); 
        }
        resolve(countDeleteHere);
      });
      return notes;
    } 
    if(rq.action == 'removeNotesHere' || rq.action == 'deleteAll' 
      || rq.action =='hiddenNotes'){

      
      let deleteNotes = await notesHere( async (storage) =>{
        if(rq.action == 'removeNotesHere'){
        
          await this.deleteStorage(storage.url+storage.id);
        }
        let elDOM = document.querySelector('#removeEx'+storage.id);
        if(elDOM){ elDOM.delete() } 


        return 1;
      });
      return {notesDelete: deleteNotes}
    }
  }
}
class feedback extends extension{
  constructor(){
    super();
  }
  toggleFeedback(){

  let email = document.getElementById('sendEmailEx0A');
  let donate = document.getElementById('donateEx0A');
  let paper = document.getElementsByClassName('paperEx1A')[0];
  let donative = document.getElementById('donativesEx0A');
  let msgDonate = document.getElementById('msg-donateEx0A');

  function toggle(sel){
    if (sel == 'email'){
      email.style.backgroundColor = '#ecf0f1';
      donate.style.backgroundColor = '#bdc3c7';
      msgDonate.style.visibility = 'hidden';
      paper.style.visibility = 'visible';
      donative.style.visibility = 'hidden';
    }else if (sel =='donate'){
      donate.style.backgroundColor = '#ecf0f1';
      email.style.backgroundColor = '#bdc3c7';
      paper.style.visibility = 'hidden';
      donative.style.visibility = 'visible';
      msgDonate.style.visibility = 'visible';     
    }
  }

  email.addEventListener('click', function (){toggle('email')}, false);
  donate.addEventListener('click', function (){toggle('donate')}, false);

  }
  quitFeedback(scroll){
    let quit = document.getElementsByClassName('removeEx1A')[0];
    let feedback = document.getElementById('feedbackEx0A');

    quit.addEventListener('click',function(){
      feedback.parentNode.removeChild(feedback);
      document.body.style.overflow = scroll;
    } ,false)
  }
  addImgs(){
    let instagram, facebook, github, noteeasyImg, donate, email;
    let $ = (sel)=>{return document.getElementById(sel)}

     instagram = $('instagramEx0A');
     facebook = $('facebookEx0A');
     github = $('githubEx0A');
     noteeasyImg = $("noteeasyEx0A");
     email = $("sendEmailEx0A");
     donate = $("donateEx0A");

     donate.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/coins.svg')+")";
     email.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/envelope.svg')+")";
     instagram.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/instagram.svg')+")";
     facebook.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/facebook.svg')+")";
     github.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/github.svg')+")";
     noteeasyImg.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/logo128.png')+")";
  }
  createFeedback(){
    let feedback = document.createElement('div');
    feedback.style.display = 'auto';
    feedback.id="feedbackEx0A";
    feedback.innerHTML =  `<div id="contentEx0A">
            
            <div id="sendFeedbackEx0A">
              <div class="areaEx1A"><div class="noteEx1A"  style="background: #f1c40f;"><span class="messageEx1A"></span><div class="tackEx1A" ><span class="removeEx1A"></span>
                <i id="noteeasyEx0A"></i><span id="tituloEx0A">NoteEasy</span> 
                <span id="msg-donateEx0A">
                  <strong style="color:black !important; font-size: 18px;">¿Te a parecido util?</strong> <br><br>Puedes apoyarme con una pequeña donación.
                </span>
                <form id="donativesEx0A" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
                
                <input type="hidden" name="cmd" value="_s-xclick">
                <input type="hidden" name="hosted_button_id" value="GC8A5YXZLDRMU">
                <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
                <img alt="" border="0" src="https://www.paypalobjects.com/es_XC/i/scr/pixel.gif" width="1" height="1">
                </form>

              </div>
              <div class="paperEx1A notranslate" style=" font-size: 0.45cm;pointer-events:auto;color: black;">Comunicate con nosotros a través de: <a id="mailEx0A" href="mailto:andros.noteeasy@gmail.com">andros.noteeasy@gmail.com</a>
                <br>
                <br>
                <br>
  
                Siguenos en: 
                <div id="social-barEx0A">
                  <a target="_blank" href="https://github.com/andros-code">
                    <button class="social-iconEx0A" id="githubEx0A"></button>
                  </a>
                  <a target="_blank" href="https://www.instagram.com/andros.cod/">
                    <button class="social-iconEx0A" id="instagramEx0A"></button>
                  </a>
                  <a target="_blank" href="https://www.facebook.com/Andros-Code-114079386985009/">
                    <button class="social-iconEx0A" id="facebookEx0A"></button>
                  </a>
                </div>

               </div>
                <button id="sendEmailEx0A" class="select buttonEx0A"></button>

              <button id="donateEx0A" class="buttonEx0A">
                <div class="coffeRequest" id="msgDonateEx0A"><h3 id="messageEx0A">Invitame un café!</h3></div>
              </button>
              </div>
               
              </div>
              

            </div>

          </div>`;
    let feedbackElement = document.getElementById('feedbackEx0A');
    
    if(!feedbackElement){
      document.body.appendChild(feedback);
      feedbackElement = document.getElementById('feedbackEx0A');
          feedbackElement.style.top = window.scrollY+"px";
          feedbackElement.style.left = feedbackElement.offsetLeft+"px"; 
          let scroll = document.body.style.overflow;
          document.body.style.overflow = 'hidden';
      this.toggleFeedback();
      this.quitFeedback(scroll);
      this.addImgs();
    }
  }
}

  let noteasy = new feedback();

  noteasy.cathMessage( async(request)=>{

    if(typeof noteasy[request.action] == 'function'){
      let val = await noteasy[request.action](request);
      noteasy.onDrag();
      return val;
    }
  });

/* EXTENSION*/