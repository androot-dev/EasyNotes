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
}
