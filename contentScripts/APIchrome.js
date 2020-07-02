class easyMethods {
	contructor() {}
	on(el, evt, fn) {
		return el.addEventListener(evt, () => {
			fn();
		}, false);
	}
	animate(el, start, end, time, toggle = false, transition = 200) {
		transition = transition / 1000;
		let temp = {
			end: end,
			start: start
		};
		if (!el.toggleAction) {
			el.toggleAction = 'open';
		}
		if (toggle == true) {
			if (el.toggleAction == 'close') {
				el.toggleAction = 'open';
				end = temp.start;
				start = temp.end;
			}
			else {
				el.toggleAction = 'close';
				end = temp.end;
				start = temp.start;
			}
		}
		el.style.transition = 'all ' + transition + 's ease-in-out';
		for (let key in start) {
			el.style[key] = start[key];
		}
		if (el.toggle) {
			clearTimeout(el.toggle);
		}
		el.toggle = setTimeout(function() {
			for (let key in end) {
				el.style[key] = end[key];
			}
		}, time);
	}
	css(el, css, option = null) {
		if (typeof css == 'object') {
			for (let i in css) {
				if (el.tagName) {
					el.style[i] = css[i];
				}
				else {
					for (let a in el) {
						el[a].style[i] = css[i];
					}
				}
			}
		}
		else {
			if (el.tagName) {
				el.style[css] = option;
			}
			else {
				for (let a in el) {
					el[a].style[css] = option;
				}
			}
		}
	}
}
class APIchrome extends easyMethods {
	constructor() {
		super();
		let filterRules = {
			protocol: 'chrome:',
			hostname: 'chrome.google.com'
		}
		this.filter = (tab) => {
			let url = new URL(tab.url);
			if (tab.title == url.hostname) {
				//sin conexion
				return false;
			}
			for (let a in filterRules) {
				if (url[a] == filterRules[a]) {
					return false;
				}
			}
			return true;
		}
	}
	URL(url) {
		return chrome.runtime.getURL(url);
	}
	send(msg, tabId = null, fn = null) {
		if (tabId == null) {
			chrome.runtime.sendMessage(msg);
		}
		else {
			chrome.tabs.sendMessage(tabId, msg);
		}
		if (msg.response) {
			this.onMessages({
				[msg.response]: (res) => {
					if (fn != null) {
						fn(res);
					}
				}
			});
		}
	}
	sendReceive(msg, tabId = null){
		return new Promise((resolve, reject) => {
			msg.response = 'await';
			if (tabId == null) {
				chrome.runtime.sendMessage(msg, function(response){
					resolve(response);
				});
			}
			else {
				chrome.tabs.sendMessage(tabId, msg, function(response){
					resolve(response);
				});
			}
		});

	}
	async exeScript(tabId, script, cancelTime = 100) {
		return new Promise((resolve, reject) => {
			let timeout;
			chrome.tabs.executeScript(tabId, script, function(res) {
				timeout = null;
				resolve(res);
			});
			timeout = setTimeout(function() {
				resolve('timeout');
			}, cancelTime);
		})
	}
	async getTab(request = {}) {
		if (request == 'active') {
			request = {
				'active': true,
				lastFocusedWindow: true
			}
		}
		return await new Promise((resolve, reject) => {
			if (typeof(request) == 'number') {
				chrome.tabs.get(request, (tab) => {
					if (tab && tab.url) {
						resolve(tab);
					}
					else {
						resolve('empty');
					}
				});
			}
			else {
				chrome.tabs.query(request, (tab) => {
					if (tab && tab.length > 0) {
						resolve(tab);
					}
					else {
						resolve('empty');
					}
				});
			}
		});
	}
	async getStorage(request = null) {
		return await new Promise(async (resolve, reject) => {
			chrome.storage.sync.get(request, (items) => {
				items = request == null ? items : items[request];
				if (items) {
					resolve(items);
				}
				else {
					resolve('empty');
				}
			});
		});
	}
	async setStorage(key, value) {
		let exist = await this.getStorage(key);
		return new Promise((resolve, reject) => {
			chrome.storage.sync.set({
				[key]: value
			}, function() {
				if (exist == {}) {
					resolve('setted')
				}
				else {
					resolve('modified')
				}
			});
		});
	}
	async removeStorage(array = null) {
		return new Promise((resolve, reject) => {
			if (array) {
				chrome.storage.sync.remove(array, function() {
					resolve();
				});
			}
			else {
				chrome.storage.sync.clean(function() {
					resolve();
				});
			}
		});
	}
	async onUpdated(actions) {
		chrome.tabs.onUpdated.addListener((tabId, info) => {
			if (info.status == "complete") {
				for (let key in actions) {
					actions[key]({
						tabId: tabId,
						info: info
					});
				}
			}
		});
	}
	onMessages(messages) {
		if (messages) {
			chrome.runtime.onMessage.addListener(async (response, sender, sendResponse) => {
				let defaultAction = true;
				for (let key in messages) {
					if (response.action) {
						if (response.action == key) {
							messages[key](response);
							defaultAction = false;
							break;
						}
					}
					else if (response.verifyURL) {
						messages['verifyURL'](response);
						defaultAction = false;
						break;
					}
				}
				if (defaultAction == true && messages['default']) {
					messages['default'](response);
				}
			});
		}
	}
}