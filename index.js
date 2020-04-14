let pencil = document.getElementById('pencil')
let brush = document.getElementById('brush')
let image = document.getElementById('image')


pencil.addEventListener('click', SendBackgroundMessage, false)

function SendBackgroundMessage(msj){
	
	chrome.runtime.sendMessage({msg: 'newnote'});
}