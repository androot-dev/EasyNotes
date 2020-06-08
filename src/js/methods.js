var $ = (sel)=>{
	let el = document.querySelectorAll(sel).length > 1 ?
	document.querySelectorAll(sel) : document.querySelectorAll(sel)[0];

	function addMethods (el){
		el.on = function(evt, fn){
				el.addEventListener(evt, fn, false);
		}
		el.animate = function(start, end, time=2000){

			for(let key in start){
				el.style[key] = start[key]; 
			}
			if(el.toggle){
				clearTimeout(el.toggle);
			}
			el.toggle = setTimeout(function(){
				for(let key in end){
					el.style[key] = end[key]; 
				}
			}, time);
			
		}
	}
	if(el){
		if(el.tagName){
			addMethods(el);
		}else{
			el.forEach( function(el, index){
				addMethods(el);
			});
		}
		return el;
	}else{
		console.log('no se encontro el selector: '+ sel);
		return undefined;
	}
}
export default $ ;