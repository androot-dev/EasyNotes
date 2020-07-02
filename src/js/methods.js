var $ = (sel) => {
	let el = document.querySelectorAll(sel).length > 1 ? document.querySelectorAll(sel) : document.querySelectorAll(sel)[0];
	function addMethods(el) {
		el.css = (css, option = null)=> {
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
		el.on = function(evt, fn) {
			el.addEventListener(evt, fn, false);
		}
		el.animate = function(start, end, time = 2000, transition = 200) {
			transition = transition / 1000;
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
	}
	if (el) {
		if (el.tagName) {
			addMethods(el);
		}
		else {
			el.on = function(evt, fn) {
				el.forEach(function(element, index) {
					element.addEventListener(evt, (evt) => fn(evt), false);
				});
			}
			el.forEach(function(el, index) {
				addMethods(el);
			});
		}
		return el;
	}
	else {
		console.log('no se encontro el selector: ' + sel);
		return undefined;
	}
}
function rgbToHex(color) {
		    color = ""+ color;
		    if (!color || color.indexOf("rgb") < 0) {
		        return color;
		    }

		    if (color.charAt(0) == "#") {
		        return color;
		    }

		    var nums = /(.*?)rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(color),
		        r = parseInt(nums[2], 10).toString(16),
		        g = parseInt(nums[3], 10).toString(16),
		        b = parseInt(nums[4], 10).toString(16);

		    return "#"+ (
		        (r.length == 1 ? "0"+ r : r) +
		        (g.length == 1 ? "0"+ g : g) +
		        (b.length == 1 ? "0"+ b : b)
		    );
		}
export { $, rgbToHex };