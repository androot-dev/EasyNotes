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

