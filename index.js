import {
	$,
	rgbToHex
}
from './src/js/methods.js';
import APIchrome from './src/js/chromeAPI.js';
let Chrome = new APIchrome();
class pallete {
	constructor() {
		this.maxColors = 18;
		this.tempColor;
		this.selectionColor;
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
	selectColor(color, colorDefault = '#color-default2') {
		let id = (color == 'empty') ? colorDefault : color;
		let el = $(id);
		if (!el) {
			el = $(colorDefault)
		}
		this.popup.colors('all').forEach((element, key) => {
			element.style.transform = 'scale(1)';
		});
		el.css({
			transform: 'scale(1.4)'
		});
		let mini = this.popup.mininote;
		mini.note.style.backgroundColor = el.note;
		mini.font.forEach((element, key) => {
			element.style.backgroundColor = el.font;
		})
		mini.tack.style.backgroundColor = el.tack;
		this.selectionColor = {
			note:el.note,
			tack:el.tack,
			font:el.font
		}
	}
	async addColors(name, colors) {
		function serialize(color) {
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
			return color;
		}
		let createColor = (name, key, color) => {
			let newColor = document.createElement('li');
			let exist = document.querySelector("#color-" + name + key);
			if (exist) {
				exist.note = color.note;
				exist.font = color.font;
				exist.tack = color.tack;
				exist.style.backgroundColor = color.note;
				return false;
			}
			newColor.id = "color-" + name + key;
			newColor.classList += name + 'Color colorsPallete';
			newColor.note = color.note;
			newColor.font = color.font;
			newColor.tack = color.tack;
			newColor.style.backgroundColor = color.note;
			newColor.onclick = () => {
				this.selectColor('#' + newColor.id);
				Chrome.setStorage('colorNoteSelect', '#color-' + name + key);
			}
			return newColor;
		}
		let pallete = document.querySelector('#pallete-' + name);
		if (pallete.lengthColor < pallete.maxColors) {
			pallete.lengthColor = 0;
			let saveColors = [];
			for (let i in colors) {
				let color = serialize(colors[i]);
				saveColors.push(color);
				let colorNode = createColor(name, i, color);
				if (colorNode != false) {
					pallete.appendChild(colorNode);
				}
				pallete.lengthColor++;
			}
			Chrome.setStorage('pallete-' + name, saveColors);
			return true;
		}
		else {
			this.showBubbleMessage('<div id="warningMsg"></div> Paleta llena!')
			return false;
		}
	}
	async setPalletes(palletes, selectColor) {
		let methods = {
			createPallete: (name, max) => {
				let pallete = document.createElement('ul');
				pallete.maxColors = max;
				pallete.classList = "palletes";
				pallete.id = 'pallete-' + name;
				pallete.lengthColor = 0;
				this.popup.allPalletes.appendChild(pallete);
			}
		}
		for (let name in palletes) {
			let max = palletes[name].max;
			let status = palletes[name].status;
			let colors = (status == 'dinamyc' && palletes[name].colors == 'empty') ? [] : palletes[name].colors;
			methods.createPallete(name, max);
			this.addColors(name, colors);
		}
		this.selectColor(selectColor);
	}
}
class popup extends pallete {
	constructor() {
		super();
		this.urlActive;
		this.palletesON();
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
			},
			recivedUrlActive: (res) => {
				this.urlActive = res.url;
				let url;
				for (let i = res.url.length - 1; i >= 0; i--) {
					if (res.url[i] == '/') {
						this.urlActive = res.url.substring(0, i) + '/*';
						break;
					}
				}
				let view = $('#viewUrl');
				view.textContent = this.urlActive;
				view.css({
					visibility: 'visible'
				});
				view.scrollLeft = view.scrollWidth;
			}
		});
		this.menuHidden('show');
		(async () => {
			let checked = await Chrome.getStorage('anchorDomainCheck');
			if (checked == true) {
				$('#anchorDomain').checked = true;
				this.anchorDomainActive(true);
			}
			else if (checked == false) {
				$('#anchorDomain').checked = false;
				this.anchorDomainActive(false);
			}
		})()
		$('#anchorDomain').on('change', async () => {
			this.anchorDomainActive();
		})
		$('#miniNote').on('click', async () => {
			let note ;
			if (this.tempColor) {
				note = this.tempColor;
			}
			else {
				let id = await Chrome.getStorage('colorNoteSelect');
				note = id == 'empty' ? this.selectionColor : $(id);
			}
			Chrome.send({
				verifyURL: 'createNote',
				noteColor: note.note,
				fontColor: note.font,
				tackColor: note.tack,
				anchorDomain: $('#anchorDomain').checked,
				urlAnchor: this.urlActive
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
			this.menuDeleteStyle('close');
		});
		$("#btn-guardarEstilo").on('click', async () => {
			let user = await Chrome.getStorage('pallete-user');
			if (user == 'empty') {
				user = []
			}
			user.push(this.tempColor);
			this.addColors('user', user);
		});
		$('#deleteStyle').on('click', () => {
			this.menuDeleteStyle('open');
			this.closeNewStyle();
		});
		$('#deleteCancel').on('click', () => {
			this.menuDeleteStyle('close');
		})
		$('#deleteAllColor').on('click', () => {
			this.menuDeleteStyle('close');
			if(this.popup.pallete('user')){
				this.popup.pallete('user').lengthColor = 0 ;
			}
			Chrome.removeStorage('pallete-user');
			let colors = document.querySelectorAll('.userColor');
			colors.forEach(function(el, index) {
				el.parentNode.removeChild(el);
			});
		})
	}
	async palletesON() {
		let defaultPallete = [{
			note: '#2f3640',
			font: 'white'
		}, '#fd9644', '#f1c40f', '#26de81', '#2bcbba', '#9c88ff'];
		let userPallete = await Chrome.getStorage('pallete-user');
		let selectColor = await Chrome.getStorage('colorNoteSelect');
		selectColor = selectColor == 'empty' ? '#color-default2' : selectColor;
		this.setPalletes({
			default: {
				colors: defaultPallete,
				max: 6,
				status: 'static'
			},
			user: {
				colors: userPallete,
				max: 18,
				status: 'dinamyc'
			}
		}, selectColor);
	}
	menuDeleteStyle(toggle) {
		if (toggle == 'close') {
			$('#config-deleteColor').css({
				visibility: 'hidden',
				height: '0px',
				paddingBottom: '0px'
			});
			let colors = document.querySelectorAll('#pallete-user li');
			colors.forEach((el, index) => {
				el.onclick = this.tempSave;
				el.classList.remove('objetiveDelete');
			});
		}
		else if (toggle == 'open') {
			$('#config-deleteColor').css({
				visibility: 'visible',
				height: '20px',
				paddingBottom: '3px'
			})
			let colors = document.querySelectorAll('#pallete-user li');
			colors.forEach((el, index) => {
				this.tempSave = el.onclick;
				el.onclick = async() => {
					let key = el.id.replace('color-user', "");
					let colors = await Chrome.getStorage('pallete-user');
					colors.splice(key, 1);
					Chrome.setStorage('pallete-user', colors);
					el.parentNode.removeChild(el);

				}
				el.classList.add('objetiveDelete');
			});
		}
	}
	async anchorDomainActive(checkedForze = null) {
		let view = $('#viewUrl');
		let check = $('#anchorDomain');
		check.checked = checkedForze != null ? checkedForze : check.checked;
		if (check.checked == true) {
			if (this.urlActive) {
				view.textContent = this.urlActive;
				view.css({
					visibility: 'visible'
				});
				view.scrollLeft = view.offsetLeft;
			}
			else {
				let tab = await Chrome.send({
					action: 'sendUrlActive'
				});
			}
		}
		else {
			view.css({
				visibility: 'hidden'
			})
			view.textContent = "";
		}
		Chrome.setStorage('anchorDomainCheck', check.checked);
	}
	closeNewStyle() {
		this.tempColor = undefined;
		this.popup.newStyle.animate({
			height: '20px',
			visibility: 'visible',
			opacity:'1'
		}, {
			visibility: 'hidden',
			opacity:'0',
			height: '0px'
		}, 10);
	}
	newStyle() {
		let colors;
		this.popup.newStyle.animate({
			height: '0',
			opacity:'0'
		}, {
			height: '20px',
			opacity:'1',
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
		note.on('input', () => {
			apply('#noteColor', null, null)
			this.tempColor.note = note.value;
		})
		font.on('input', () => {
			apply(null, '#fontColor', null)
			this.tempColor.font = font.value;
		})
		tack.on('input', () => {
			apply(null, null, '#tackColor')
			this.tempColor.tack = tack.value;
		})
	}
	newStyleSelectColors(note, font, tack) {
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
			else if (visibility == '20px' || visibility == '0px') {
				return visibility == '20px' ? '0px' : '20px';
			}
		}
		this.popup.options.style.pointerEvents = 'all';
		this.popup.options.animate({
			opacity: inverse(this.popup.options.style.opacity),
			visibility: inverse(this.popup.options.style.visibility),
			height: inverse(this.popup.options.style.height)
		}, {
			opacity: inverse(this.popup.options.style.opacity),
			visibility: inverse(this.popup.options.style.visibility),
			height: inverse(this.popup.options.style.height)
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