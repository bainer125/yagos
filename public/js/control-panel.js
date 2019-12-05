/*

	Graphics control panel

*/

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

		/* add event listener to the scoreboard toggle button */
		document.getElementById("btn_Scoreboard").addEventListener("click", function() {
			console.log("Scoreboard button clicked!");

			sendgraphicmessage();
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

function change_game (){
	var msg = {
		type: "game",
		data: game
	}
	ws.send(JSON.stringify(msg));
}