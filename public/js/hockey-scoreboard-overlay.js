/*
########################################################

	Handle button input

########################################################
*/

var ws;

var game = 0;

var boards = [new Scoreboard("Game","Ice Hockey",update_timers)];

var graphics = {
};

window.onload = function () {
	console.log( "Document loaded" );
	graphics["scoreboard"] = document.getElementById('Scoreboard').contentDocument;
	graphics["intermission"] = document.getElementById('Intermission').contentDocument;

	ws = new WebSocket("ws://"+location.host);

	// Bind button actions after websockets connection has been established
	ws.onopen = function (){
		console.log( "Connection established" );
	}

	ws.onmessage = function (event) {
		console.log("Message received");
		var msg = JSON.parse(event.data);
		console.log(msg.data);
		switch (msg.type){
			case "boards":
				var i=0;
				msg.data.forEach(function(board){
					var x = new Scoreboard("","",update_timers);
					if(boards[i]===undefined){
						boards[i] = x;
					}
					Object.assign(boards[i],assign_remove_functions(x,board));
					i++;
				});
				if(boards[game].clock.pause==false){
					boards[game].clock.start();
				}
				update_timers();
				update_scoreboard(boards[game],graphics);
			break;
			case "score":
				game = msg.data.game;
				handle_scoreboard_event( msg.data , boards , true , graphics );
			break;
		}
	}
};

function sendmessage (item,action,value=false,subitem=false){
	var msg = {
		type: "score",
		data: {}
	}
	var obj = {
		item: item,
		action: action,
		game: game,
		value: value,
		subitem: subitem
	}
	msg.data = obj;
	ws.send(JSON.stringify(msg));
	handle_scoreboard_event(obj,boards,true,graphics);
}

function update_timers () {
	if(boards[game].clock.min>0){
		if(boards[game].clock.sec>9){
			update_text(`${boards[game].clock.min}:${boards[game].clock.sec}`,"clock_text",graphics);
		}
		else{
			update_text(`${boards[game].clock.min}:0${boards[game].clock.sec}`,"clock_text",graphics);
		}
	}
	else{
		update_text(`${boards[game].clock.sec}.${boards[game].clock.ms}`,"clock_text",graphics);
	}
	
}

function assign_remove_functions(target,obj) {
	var ret = target;
    for (var property in obj) {
        if (obj.hasOwnProperty(property)) {
            if (typeof obj[property] == "object"){
                ret[property] = assign_remove_functions(target[property],obj[property]);
            }
            else{
            	//console.log(typeof obj[property] + "  " + property);
                if (typeof obj[property] !== "undefined"){
                	ret[property] = obj[property];
                }
            }
        }
    }
    return ret;
}