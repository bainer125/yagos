preview = true;

max_X = 1920;
max_Y = 1080;

function make_graphics_draggable () {
	var g = document.getElementById("graphics").childNodes;
	for(var i=0;i<g.length;i++){
		if(g[i].nodeType==1){
			var nodes = g[i].childNodes;
			console.log(nodes);
			make_draggable(nodes[3].id);
		}
	}
}

function make_draggable(elmnt) {
	var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
	var g = Object.keys(graphics);
	var x = document.getElementById(elmnt).parentElement;
	x.onmousedown = dragMouseDown;
	var bar_h = x.childNodes[1].offsetHeight;

	function dragMouseDown(e) {
		e = e || window.event;
		e.preventDefault();
		// get the mouse cursor position at startup:
		pos3 = e.clientX;
		pos4 = e.clientY;

		// Add the mouseup and mousemove functions to each graphic as well for smoother interface
		document.onmouseup = closeDragElement;
		// call a function whenever the cursor moves:
		document.onmousemove = elementDrag;

		/* This solution acts really weird, but the idea is good.

		Basically it adds these callbacks to all of the graphics so that the mouse
		actions are caught even when the mouse passes into the boundaries of the graphics.

		The solution would be to pass the locations of the graphics into the callbacks
		in order to adjust the offset.

		for(var i=0;i<g.length;i++){
			console.log(g[i]);
			graphics[g[i]].onmouseup = closeDragElement;
			graphics[g[i]].onmousemove = function (e){
				elementDrag(e,document.getElementById(g[i]).parentNode.style.left,document.getElementById(g[i]).parentNode.style.top);
			};
		}

		*/

	}

	function elementDrag(e,xoff=0,yoff=0) {
		e = e || window.event;
		e.preventDefault();
		var p = document.getElementById(elmnt).parentElement;
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX + xoff;
		pos2 = pos4 - e.clientY + yoff;
		pos3 = e.clientX + xoff;
		pos4 = e.clientY + yoff;
		newY = p.offsetTop - pos2;
		newX = p.offsetLeft - pos1;

		pos = document.getElementById(elmnt).getBoundingClientRect();
		if(newY<bar_h*-1){
			newY = bar_h*-1;
		}
		else if(newY>max_Y-pos.height){
			newY = max_Y-pos.height;
		}
		if(newX<0){
			newX = 0;
		}
		else if(newX>max_X-pos.width){
			newX = max_X-pos.width;
		}
		// set the element's new position:
		p.style.top = newY + "px";
		p.style.left = newX + "px";
	}

	function closeDragElement() {
		// stop moving when mouse button is released:
		document.onmouseup = null;
		document.onmousemove = null;

		// Need to send message sending the new coordinates of the graphic
	}
}