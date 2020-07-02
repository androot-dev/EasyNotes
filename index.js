import {
	$,
	rgbToHex
}
from './src/js/methods.js';
import APIchrome from './src/js/chromeAPI.js';
let Chrome = new APIchrome();
class colors extends Array {
	constructor() {
		super();
	}
	setcolor(color) {
		if (typeof color != 'object') {
			color = {
				note: color
			}
		}
		if (!color.font) {
			color.font = 'black';
		}
		if (!color.tack) {
			color.tack = '#E50909';
		}
		this.push(color);
	}
	get[Symbol.toStringTag]() {
		return 'colors';
	}
}
class pallete {
	constructor() {
		this.palletes = [];
		this.tempColor;
		this.colorSelected;
		this.popup = {
			toolbar: $('#toolbar'),
			options: $('#optionsMenu'),
			mininote: {
				font: $('.falseLetter'),
				note: $('#miniNote'),
				tack: $('#miniTack')
			},
			newStyle: $('.newStyle'),
			inputColor: function(name) {
				if (name == 'all') {
					return $('.icolor')
				}
				name = name.substring(0, 1).toUpperCase() + name.substring(1, name.length);
				return $('#colorInput' + name);
			},
			bubble: $('#bubbleInfo'),
			allPalletes: $('.allPalletes'),
			pallete: (name) => {
				return $('#pallete-' + name);
			},
			colors: (pallete = 'all') => {
				if (pallete == 'all') {
					return $('.colorsPallete')
				}
				else {
					return $('.' + pallete + 'Color')
				}
			},
			color: (name, key) => {
				return $('#color-' + name + key);
			}
		}
	}
	async setNewPallete(name, arrayColors, activeKey) {
		let newStyle = document.createElement('ul');
		newStyle.classList = "palletes";
		newStyle.id = 'pallete-' + name;
		this.popup.allPalletes.appendChild(newStyle);
		this.palletes[name] = new colors();
		for (let key in arrayColors) {
			this.setColor(arrayColors[key], name, false);
		}
		Chrome.setStorage('pallete-'+name, this.palletes[name]);
		this.activeColor(activeKey, name, 'load');
	}
	async setColor(color, namePallete, save = true) {
		this.palletes[namePallete].setcolor(color);
		let newColor = document.createElement('li');
		let allColor = document.querySelectorAll('#pallete-' + namePallete + ' > li');
		let key = allColor.length;
		newColor.id = "color-" + namePallete + key;
		newColor.classList += namePallete + 'Color colorsPallete';
		newColor.style.backgroundColor = this.palletes[namePallete][key].note;
		this.popup.pallete(namePallete).appendChild(newColor);
		if(save == true){
			Chrome.setStorage('pallete-'+namePallete, this.palletes[namePallete]);
		}
		newColor.onclick = () => {
			this.activeColor(key, namePallete)
		}
	}
	selectedColor(pallete, color, colorSelect) {
		this.popup.colors('all').forEach(function(el, index) {
			el.css({
				transform: 'scale(1)'
			});
		});
		this.popup.color(pallete, color).css({
			transform: 'scale(1.4)'
		});

		this.popup.mininote.note.style.backgroundColor = colorSelect.note;
		this.popup.mininote.tack.style.backgroundColor = colorSelect.tack;
		this.popup.mininote.font.forEach(function(element, index) {
			element.style.backgroundColor = colorSelect.font;
		});
		if(this.tempColor){
			this.newStyleSelectColors(colorSelect.note, colorSelect.font, colorSelect.tack);
		}
		this.colorSelected = {
			pallete: pallete,
			key: color,
			colors: this.palletes[pallete][color]
		}
		Chrome.setStorage('colorNoteSelect', {
			pallete: pallete,
			key: color,
			colors: this.palletes[pallete][color]
		});
	}
	async loadColors(pallete, color) {
		let storage = await Chrome.getStorage('colorNoteSelect')
		return storage != 'empty' ? storage : this.palletes[pallete][color];
	}
	async activeColor(color, pallete, evt = 'click', defaultVal = {
		pallete: 'default',
		key: 0
	}) {
		let colorSelect;
		let omitir = false;
		if (evt == 'load') {
			colorSelect = await this.loadColors(pallete, color);
			if (!colorSelect || !this.palletes[colorSelect.pallete][colorSelect.key]) {
				colorSelect = this.palletes[defaultVal.pallete][defaultVal.key];
				pallete = defaultVal.pallete;
				color = defaultVal.key;
				omitir = true;
			}
		}
		else {
			colorSelect = this.palletes[pallete][color];
		}
		if (colorSelect.colors && omitir == false) {
			color = colorSelect.key;
			pallete = colorSelect.pallete;
			colorSelect = colorSelect.colors;
		}
		this.selectedColor(pallete, color,colorSelect);
	}
}
class popup extends pallete {
	constructor() {
		super();
		this.setNewPallete('default', [{
			note: '#2f3640',
			font: 'white'
		}, '#fd9644', '#f1c40f', '#26de81', '#2bcbba', '#9c88ff'], 2);

		let loadPalleteUser = async () => {
			let userColors = await Chrome.getStorage('userPallete');
			userColors = userColors == 'empty' ? [] : userColors;
			this.setNewPallete('user', userColors, 0);
		}
		loadPalleteUser();
		this.toggles = {
			menuDelete: false,
			menuHidden: async () => {
				return await new Promise(async (resolve, reject) => {
					let value = await Chrome.getStorage('hiddenNotes');
					return value != 'empty' ? resolve(value) : reject('show');
				});
			}
		}
		window.addEventListener('click', (evt) => {
			if (evt.target.id && (evt.target.id != "optionsMenu" && evt.target.id != 'optionButton')) {
				if (this.popup.options.style.opacity == 1) {
					this.popup.options.style.opacity = 0;
					this.popup.options.style.visibility = "hidden";
				}
			}
		}, false)
		Chrome.onMessages({
			notesDelete: (msg) => {
				msg = msg.notesDelete;
				let plural = msg > 1 || msg == 0 ? "s" : "";
				this.showBubbleMessage('(' + msg + ') ' + '<i>&nbsp nota' + plural + ' eliminada' + plural + '</i>');
			},
			accessUrlBloked: () => {
				this.showBubbleMessage('<div id="warningMsg"></div> Página no accesible!', 2500);
			}

		});
		this.menuHidden('show');
		$('#miniNote').on('click', async () => {
			let note;
			if(this.tempColor){
				note = this.tempColor;
			}else{
				let config = await Chrome.getStorage('colorNoteSelect');
		 		note= this.palletes[config.pallete][config.key];
			}
			Chrome.send({
				verifyURL: 'createNote',
				noteColor: note.note,
				fontColor: note.font,
				tackColor: note.tack
			});
		});
		$('#closeNewStyle').on('click', () => {
			this.closeNewStyle();
		});
		$('#deleteButton').on('click', () => {
			this.menuDelete();
		});
		$('#deleteConfirm').on('click', () => {
			this.deleteNotes();
			this.menuDelete();
		});
		$("#hiddenButton").on('click', () => {
			this.menuHidden('toggle');
		});
		$("#optionButton").on('click', () => {
			this.optionsMenu();
		});
		$("#newStyle").on('click', () => {
			this.newStyle();
		});
	}
	closeNewStyle() {
		this.tempColor = undefined;
		this.popup.newStyle.animate({
			height: '20px',
			visibility: 'visible'
		}, {
			visibility: 'hidden',
			height: '0px',
		}, 10);
	}
	newStyle() {
		let colors;
		this.popup.newStyle.animate({
			height: '0'
		}, {
			height: '20px',
			visibility: 'visible'
		}, 200);
		let apply = (note, font, tack) => {
			if (note != null) {
				this.popup.mininote.note.style.backgroundColor = $(note + ' input').value;
				$(note).style.backgroundColor = $(note + ' input').value;
			}
			if (font != null) {
				this.popup.mininote.font.forEach(function(el, index) {
					el.style.backgroundColor = $(font + ' input').value;
				});
				$(font).style.backgroundColor = $(font + ' input').value;
			}
			if (tack != null) {
				this.popup.mininote.tack.style.backgroundColor = $(tack + ' input').value;
				$(tack).style.backgroundColor = $(tack + ' input').value;
			}
		}
		let noteColor = rgbToHex(this.popup.mininote.note.style.backgroundColor);
		let fontColor = rgbToHex(this.popup.mininote.font[0].style.backgroundColor);
		let tackColor = rgbToHex(this.popup.mininote.tack.style.backgroundColor);

		this.newStyleSelectColors(noteColor, fontColor, tackColor);

		let note = $('#noteColor input');
		let font = $('#fontColor input');
		let tack = $('#tackColor input');

		note.on('input', ()=> {
			apply('#noteColor', null, null)
			this.tempColor.note = note.value;
		})
		font.on('input', ()=> {
			apply(null, '#fontColor', null)
			this.tempColor.font = font.value;
		})
		tack.on('input', ()=> {
			apply(null, null, '#tackColor')
			this.tempColor.tack = tack.value;
		})
	}
	newStyleSelectColors(note, font, tack){
		this.tempColor = {
			note: note,
			font: font,
			tack: tack
		}
		$('#noteColor input').value = note;
		$('#noteColor').style.backgroundColor = note;
		$('#fontColor input').value = font;
		$('#fontColor').style.backgroundColor = font;
		$('#tackColor input').value = tack;
		$('#tackColor').style.backgroundColor = tack;
	}
	optionsMenu(showHidden) {
		let inverse = function(visibility) {
			if (visibility == 'visible' || visibility == 'hidden') {
				return visibility == 'visible' ? 'hidden' : 'visible';
			}
			else if (visibility == 0 || visibility == 1) {
				return visibility == 1 ? 0 : 1;
			}
		}
		this.popup.options.style.pointerEvents = 'all';
		this.popup.options.animate({
			opacity: inverse(this.popup.options.style.opacity),
			visibility: inverse(this.popup.options.style.visibility)
		}, {
			opacity: inverse(this.popup.options.style.opacity),
			visibility: inverse(this.popup.options.style.visibility)
		}, 200);
	}
	showBubbleMessage(msg, time = 2500, colors = {
		color: "#f1c40f",
		font: 'black'
	}) {
		let bubble = $('#bubbleInfo');
		bubble.style.backgroundColor = colors.back;
		bubble.style.color = colors.font;
		bubble.innerHTML = msg;
		bubble.animate({
			opacity: '1'
		}, {
			opacity: '0'
		}, 2000);
	}
	menuHidden(action) {
		let hidden_ = $("#hiddenButton");
		let actions = {
			toggle: (varCondition) => {
				let newValue = varCondition == 'hidden' ? 'show' : 'hidden';
				if (varCondition == 'hidden') {
					Chrome.send({
						action: 'showNotes'
					})
					hidden_.style.backgroundColor = "transparent";
					Chrome.setStorage('hiddenNotes', newValue);
				}
				else if (varCondition == 'show') {
					Chrome.send({
						action: 'hiddenNotes'
					})
					hidden_.style.backgroundColor = "#f39c12";
					Chrome.setStorage('hiddenNotes', newValue);
				}
			},
			show: (varCondition) => {
				if (varCondition == 'hidden') {
					Chrome.setStorage('hiddenNotes', 'hidden');
					hidden_.style.backgroundColor = "#f39c12";
				}
				else {
					Chrome.setStorage('hiddenNotes', 'show');
					hidden_.style.backgroundColor = "transparent";
				}
			}
		}
		this.toggles.menuHidden().then(
			(res) => actions[action](res), (res) => actions[action](res));
	}
	async deleteNotes() {
		let radioButtonsDelete = {
			allHere: function() {
				let el = $('#allHere');
				el.bind = 'removeNotesHere';
				return el;
			},
			allPages: function() {
				let el = $('#allPages');
				el.bind = 'deleteAll';
				return el;
			},
			checked: function() {
				return this.allHere().checked ? this.allHere() : this.allPages();
			}
		}
		let checked = radioButtonsDelete.checked().bind;
		switch (checked) {
			case 'deleteAll':
				Chrome.send({
					action: checked
				});
				break;
			case 'removeNotesHere':
				let tab = await Chrome.getTab('active');
				Chrome.send({
					action: checked,
					url: tab[0].url
				}, tab[0].id);
				break;
		}
	}
	menuDelete() {
		let menu = $('#deleteMenu');
		if (this.toggles.menuDelete == false) {
			$('#deleteButton').style.backgroundColor = "#f39c12";
			menu.animate({
				display: 'flex'
			}, {
				opacity: '1',
				visibility: 'visible'
			}, 150)
			this.toggles.menuDelete = true;
		}
		else {
			$('#deleteButton').style.backgroundColor = "transparent";
			menu.animate({
				opacity: '0',
				visibility: 'hidden'
			}, {
				display: 'none'
			}, 150)
			this.toggles.menuDelete = false;
		}
	}
}
new popup();