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