var ws;

var game = 0;

var boards = [new Scoreboard("Game","Ice Hockey")];

var graphics = {
	doc: document
};

window.onload = function () {
	console.log( "Document loaded" );

	ws = new WebSocket("ws://"+location.host);

	// Bind button actions after websockets connection has been established
	ws.onopen = function (){
		console.log( "Connection established" );
		document.getElementById("game_select").addEventListener("change",function(){
			game = this.value;
			change_game();
		});
	}

	ws.onmessage = function (event) {
		var msg = JSON.parse(event.data);
		switch (msg.type){
			case "boards":
				var i=0;
				msg.data.forEach(function(board){
					var x = new Scoreboard("","");
					if(boards[i]===undefined){
						boards[i] = x;
					}
					Object.assign(boards[i],assign_remove_functions(x,board));
					var option = document.createElement("option");
					option.text = boards[i].id;
					option.value = i;
					document.getElementById("game_select").add(option);
					i++;
				});
			break;
			case "score":
				if (msg.data.game == game){
					handle_scoreboard_event(msg.data,boards,true,graphics);
				}
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

function change_game (){
	var msg = {
		type: "game",
		data: game
	}
	ws.send(JSON.stringify(msg));
}

function request_update (){
	var msg = {
		type: "game request",
		data: {}
	}
	ws.send(JSON.stringify(msg));
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