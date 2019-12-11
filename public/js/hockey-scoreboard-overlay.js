/*
########################################################

	Handle button input

########################################################
*/

window.onload = function () {
	console.log( "Document loaded" );
	graphics["Scoreboard"] = document.getElementById('Scoreboard').contentDocument;
	graphics["Intermission"] = document.getElementById('Intermission').contentDocument;
	console.log(graphics);

	if(preview){
		make_graphics_draggable();
	}

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
				update_teams(boards[game],graphics);
			break;
			case "score":
				var disp=false;
				if (msg.data.game == game){disp=true;}
				handle_scoreboard_event( msg.data , boards , disp , graphics );
				if(disp&&msg.data.item=="period"){
					var p = boards[game].period;
					if(p == 1){
						update_text("1st","period_text",graphics);
					}
					else if(p == 2){
						update_text("2nd","period_text",graphics);
					}
					else if(p == 3){
						update_text("3rd","period_text",graphics);
					}
					else if(p == 4){
						update_text("OT","period_text",graphics);
					}
					else if(p>4){
						update_text((p-3).toString()+"OT","period_text",graphics);
					}
				}
			break;
			case "game":
				game = msg.data;
				request_update();
			break;
		}
	}
};

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
	update_penalty_display();
	
}

function update_penalty_display () {
	var t = ["home", "away"];
	var times = [];
	for(var i=0;i<t.length;i++){
		boards[game][t[i]+"_penalties"].forEach(function(pen,index){
			var rem = pen.initial + pen.finish - boards[game].clock.elap;
			times.push(rem);
		});
	}
	if(times.length>0){
		var time = times.reduce(function(a, b) {
		    return Math.min(a, b);
		});
	}
	var min = Math.floor((time)/60000);
	var sec = Math.floor(time/1000) - 60*min;
	if(sec>9){
		update_text(`${min}:${sec}`,"penaltyClock",graphics);
	}
	else{
		update_text(`${min}:0${sec}`,"penaltyClock",graphics);
	}
	var hp = boards[game]["home_penalties"].length;
	var ap = boards[game]["away_penalties"].length;
	console.log(hp,ap);

	if(hp == 0 && ap == 0){
		send_self_message("home_penalty","hide");
		send_self_message("away_penalty","hide");
		send_self_message("even_penalty","hide");
	}

	else if(hp == 1 && ap == 0){
		send_self_message("home_penalty","show");
		send_self_message("away_penalty","hide");
		send_self_message("even_penalty","hide");
	}

	else if(hp > 1 && ap == 1){
		send_self_message("home_penalty","show");
		send_self_message("away_penalty","hide");
		send_self_message("even_penalty","hide");
	}

	else if(hp > 1 && ap == 0){
		send_self_message("home_penalty","show");
		send_self_message("away_penalty","hide");
		send_self_message("even_penalty","hide");
	}

	else if(hp == 0 && ap == 1){
		send_self_message("home_penalty","hide");
		send_self_message("away_penalty","show");
		send_self_message("even_penalty","hide");
	}

	else if(hp == 1 && ap > 1){
		send_self_message("home_penalty","hide");
		send_self_message("away_penalty","show");
		send_self_message("even_penalty","hide");
	}

	else if(hp == 0 && ap > 1){
		send_self_message("home_penalty","hide");
		send_self_message("away_penalty","show");
		send_self_message("even_penalty","hide");
	}

	else if(hp == 1 && ap == 1){
		send_self_message("home_penalty","hide");
		send_self_message("away_penalty","hide");
		send_self_message("even_penalty","show");
	}

	else if(hp > 1 && ap > 1){
		send_self_message("home_penalty","hide");
		send_self_message("away_penalty","hide");
		send_self_message("even_penalty","show");
	}

}