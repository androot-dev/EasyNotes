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
			return {action:'notesDelete', notesDelete: deleteNotes}
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
		let instagram, facebook, github, easynotesImg, donate, email;
		let $ = (sel)=>{return document.getElementById(sel)}

		 instagram = $('instagramEx0A');
		 facebook = $('facebookEx0A');
		 github = $('githubEx0A');
		 easynotesImg = $("easynotesEx0A");
		 email = $("sendEmailEx0A");
		 donate = $("donateEx0A");

		 donate.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/coins.svg')+")";
		 email.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/envelope.svg')+")";
		 instagram.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/instagram.svg')+")";
		 facebook.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/facebook.svg')+")";
		 github.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/github.svg')+")";
		 easynotesImg.style.backgroundImage = "url("+chrome.runtime.getURL('src/img/logo128.png')+")";
	}
	createFeedback(){
		let feedback = document.createElement('div');
		feedback.style.display = 'auto';
		feedback.id="feedbackEx0A";
		feedback.innerHTML =  `<div id="contentEx0A">
						
						<div id="sendFeedbackEx0A">
							<div class="areaEx1A"><div class="noteEx1A"  style="background: #f1c40f;"><span class="messageEx1A"></span><div class="tackEx1A" ><span class="removeEx1A"></span>
								<i id="easynotesEx0A"></i><span id="tituloEx0A">EasyNotes</span> 
								<span id="msg-donateEx0A">
									<strong style="color:black !important; font-size: 18px;">¿Te a parecido útil?</strong> <br><br>Puedes apoyarme con una pequeña donación.
								</span>
								<form id="donativesEx0A" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
								
								<input type="hidden" name="cmd" value="_s-xclick">
								<input type="hidden" name="hosted_button_id" value="GC8A5YXZLDRMU">
								<input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!">
								<img alt="" border="0" src="https://www.paypalobjects.com/es_XC/i/scr/pixel.gif" width="1" height="1">
								</form>

							</div>
							<div class="paperEx1A notranslate" style=" font-size: 0.45cm;pointer-events:auto;color: black;">Comunícate con nosotros a través de: <a id="mailEx0A" href="mailto:andros.principal@gmail.com">andros.principal@gmail.com</a>
								<br>
								<br>
								<br>
	
								Síguenos en: 
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
