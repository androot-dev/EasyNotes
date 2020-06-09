class pallete {
	constructor(arrayColors){
		for (let key in arrayColors){
			if(typeof arrayColors[key] != 'object'){
				arrayColors[key] = {
					color: arrayColors[key]
				}
			}
			if(!arrayColors[key].font){arrayColors[key].font = 'black'};
			if(!arrayColors[key].select){arrayColors[key].select = false};
		}
		this.colors = arrayColors;

	}

	generatePallete(){
		let newStyle = document.createElement('ul');
		newStyle.classList = "styleNote";
		newStyle.id = 'styleNote'+(document.querySelectorAll('.styleNote').length);
		for(let key in this.colors){

			if (!this.colors[key].select){
				let newColor = document.createElement('li');
				newColor.id = "colorNote-"+key;
				newColor.classList = 'prefered';
				newColor.style.background = this.colors[key].color;
				newStyle.appendChild(newColor);
			}
		}
		return newStyle;
	}
}
let defaultPallete = new pallete([
	{color:'#2f3640', font:'white'}, 
	'#fd9644', 
	'#f1c40f', 
	'#26de81', 
	'#2bcbba', 
	'#9c88ff'
]);

export default defaultPallete;