var ws = new WebSocket("ws://localhost:3000");

var i = 0;

ws.onopen = function (){

	document.getElementById("home_shots_up").addEventListener("click",function(){sendmessage("home_shots","up");});
	document.getElementById("home_shots_down").addEventListener("click",function(){sendmessage("home_shots","down");});
}

ws.onmessage = function (event) {
	var obj = JSON.parse(event.data);
	document.getElementById("square").innerHTML=obj.data;
}

function sendmessage (item,action){
	var obj = {
		item: item,
		action: action
	}
	ws.send(JSON.stringify(obj));
}