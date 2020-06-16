class APIchrome{
	constructor(){
		let filterRules= {
			protocol:'chrome:',
			hostname:'chrome.google.com'
		}
		this.filter = (tab)=>{
			let url = new URL(tab.url);
			
			if(tab.title == url.hostname){
				//sin conexion
				return false;
			}
			for (let a in filterRules){
				if(url[a] == filterRules[a]){
					return false;
				}
			}
			return true;
		}
	}
	send(msg, tabId = null){
		if(tabId == null){
			chrome.runtime.sendMessage(msg);
		}else{
			chrome.tabs.sendMessage(tabId, msg);
		}
	}
	async exeScript(tabId, script, cancelTime = 100){
		return new Promise((resolve, reject)=>{
			let timeout;
			chrome.tabs.executeScript(tabId,script , function(res){
				timeout = null;
				resolve(res);
			});

			timeout = setTimeout(function(){
				resolve('timeout');
			}, cancelTime);
		})
	}
	async getTab(request = {}){
		if(request == 'active'){
			request = {
				'active': true, 
				lastFocusedWindow: true
			}
		}
		return await new Promise ((resolve, reject)=>{
			if(typeof(request)=='number'){
				chrome.tabs.get(request, (tab)=>{
					if(tab && tab.url){
						resolve( tab );
					}else{
						resolve('empty');
					}
				});
			}else{
				chrome.tabs.query(request, (tab)=>{
					if(tab && tab.length > 0){
					 	resolve( tab );
					}else{
						resolve('empty');
					}
				});
			}
		});
	}
	async getStorage(request = null){
		return await new Promise (async(resolve, reject)=>{
			chrome.storage.sync.get(request, (items)=>{
				items = request == null ? items : items[request];
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
	async removeStorage(array = null){
		return new Promise ((resolve, reject)=>{
			if(array){
				chrome.storage.sync.remove(array, function(){
					resolve();
				});
			}else{
				chrome.storage.sync.clean(function(){
					resolve();
				});
			}
		});
	}
	async onUpdated(actions){
		chrome.tabs.onUpdated.addListener( (tabId , info)=> {
			if(info.status == "complete"){
				for(let key in actions){

			  		actions[key]( {tabId:tabId, info:info});
				}
			}	
		});
	}
	onMessages(messages){
		if(messages){

			chrome.runtime.onMessage.addListener(async (response, 
				sender, sendResponse) =>  {

				let defaultAction = true;
			 	 	for(let key in messages){
			 	 		if(response.action){
			 	 			if(response.action == key){
			 	 				messages[key](response);
			 	 				defaultAction = false;
			 	 				break;
			 	 			}
			 	 		}else if(response.verifyURL){
			 	 			messages['verifyURL'](response);
			 	 			defaultAction = false;
			 	 			break;
			 	 		}
			 	 	}
			 	 	if(defaultAction == true && messages['default']){
			 	 		messages['default'](response);
			 	 	}

			});
		}
	}
	async onCommand(cmds){
		chrome.commands.onCommand.addListener(async(cmd)=> {
			for (let i in cmds){
				if(cmd == i){
					cmds[i]();
				}
			}
		})
	}
}