/*
########################################################

	Handle button input

########################################################
*/

var ws;

var i = 0;

var boards = [new Scoreboard("Game","Ice Hockey",updatetimers)];

var graphics = {
	doc: document
};

document.onload = function () {
	console.log( "Document loaded" );
};

ws = new WebSocket("ws://"+location.host);

// Bind button actions after websockets connection has been established
ws.onopen = function (){
	console.log( "Connection established" );
	document.getElementById("home_shots_up").addEventListener("click",function(){sendmessage("home_shots","up");});
	document.getElementById("home_shots_down").addEventListener("click",function(){sendmessage("home_shots","down");});
	document.getElementById("home_score_up").addEventListener("click",function(){sendmessage("home_score","up");});
	document.getElementById("home_score_down").addEventListener("click",function(){sendmessage("home_score","down");});
	document.getElementById("away_score_up").addEventListener("click",function(){sendmessage("away_score","up");});
	document.getElementById("away_score_down").addEventListener("click",function(){sendmessage("away_score","down");});
	document.getElementById("away_shots_up").addEventListener("click",function(){sendmessage("away_shots","up");});
	document.getElementById("away_shots_down").addEventListener("click",function(){sendmessage("away_shots","down");});
	document.getElementById("btn_clock").addEventListener("click",function(){
		if (document.getElementById("btn_clock").value=="start"){
			sendmessage("clock",document.getElementById("btn_clock").value);
			document.getElementById("btn_clock").value = "stop";
		}
		else{
			sendmessage("clock",document.getElementById("btn_clock").value);
			document.getElementById("btn_clock").value = "start";
		}
	});
}

ws.onmessage = function (event) {
	var obj = JSON.parse(event.data);
}

function sendmessage (item,action){
	var obj = {
		item: item,
		action: action,
		game: 0
	}
	ws.send(JSON.stringify(obj));
	handle_scoreboard_event(obj,boards,true,graphics);
}

function updatetimers () {
	update_subitem_text("clock","min",boards[0],graphics,Math.floor(boards[0].clock.min/10),"m1");
	update_subitem_text("clock","min",boards[0],graphics,boards[0].clock.min%10,"m2");
	update_subitem_text("clock","sec",boards[0],graphics,Math.floor(boards[0].clock.sec/10),"s1");
	update_subitem_text("clock","sec",boards[0],graphics,boards[0].clock.sec%10,"s2");
	update_subitem_text("clock","ms",boards[0],graphics,false,"ms");
}