class comunicationContentScript extends DragDrop{
  constructor(){
    super();
  }
  cathMessage(fn){
    chrome.runtime.onMessage.addListener((request, _, sendResponse) =>  {
  	  fn(request);
	    return true;
    })
  }
}

