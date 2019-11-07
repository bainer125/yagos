/*
########################################################

	Handle button input

########################################################
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
		document.getElementById("home_shots_up").addEventListener("click",function(){sendmessage("home_shots","up");});
		document.getElementById("home_shots_down").addEventListener("click",function(){sendmessage("home_shots","down");});
		document.getElementById("home_score_up").addEventListener("click",function(){sendmessage("home_score","up");});
		document.getElementById("home_score_down").addEventListener("click",function(){sendmessage("home_score","down");});
		document.getElementById("away_score_up").addEventListener("click",function(){sendmessage("away_score","up");});
		document.getElementById("away_score_down").addEventListener("click",function(){sendmessage("away_score","down");});
		document.getElementById("away_shots_up").addEventListener("click",function(){sendmessage("away_shots","up");});
		document.getElementById("away_shots_down").addEventListener("click",function(){sendmessage("away_shots","down");});


		// Event listeners for timer adjustment
		document.getElementById("timer_m1_plus").addEventListener("click",function(){
			adjust_timer(600000,true);
		});
		document.getElementById("timer_m2_plus").addEventListener("click",function(){
			adjust_timer(60000,true);
		});
		document.getElementById("timer_s1_plus").addEventListener("click",function(){
			adjust_timer(10000,true);
		});
		document.getElementById("timer_s2_plus").addEventListener("click",function(){
			adjust_timer(1000,true);
		});
		document.getElementById("timer_ms_plus").addEventListener("click",function(){
			adjust_timer(100,true);
		});

		document.getElementById("timer_m1_minus").addEventListener("click",function(){
			adjust_timer(600000,false);
		});
		document.getElementById("timer_m2_minus").addEventListener("click",function(){
			adjust_timer(60000,false);
		});
		document.getElementById("timer_s1_minus").addEventListener("click",function(){
			adjust_timer(10000,false);
		});
		document.getElementById("timer_s2_minus").addEventListener("click",function(){
			adjust_timer(1000,false);
		});
		document.getElementById("timer_ms_minus").addEventListener("click",function(){
			adjust_timer(100,false);
		});

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
		document.getElementById("game_select").addEventListener("change",function(){
			game = this.value;
			update_timers();
			update_scoreboard(boards[game],graphics);
		});
	}

	ws.onmessage = function (event) {
		var msg = JSON.parse(event.data);
		switch (msg.type){
			case "boards":
				var i=0;
				msg.data.forEach(function(board){
					var x = new Scoreboard("","",update_timers);
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
				if(boards[game].clock.pause==false){
					boards[game].clock.start();
				}
				update_timers();
				update_scoreboard(boards[game],graphics);
			break;
			case "score":
				if (msg.data.game == game){
					handle_scoreboard_event(msg.data,boards,true,graphics);
				}
			break;
		}
	}
};

function update_timers () {
	update_text(Math.floor(boards[game].clock.min/10),"m1",graphics);
	update_text(boards[game].clock.min%10,"m2",graphics);
	update_text(Math.floor(boards[game].clock.sec/10),"s1",graphics);
	update_text(boards[game].clock.sec%10,"s2",graphics);
	update_subitem_text("clock","ms",boards[game],graphics,false,"ms");

	// Might not actually do anything, so will have to reevaluate the best way to do this
	if(boards[game].done){
		document.getElementById("btn_clock").value = "start";
	}
}

function adjust_timer ( value , op = false ) {
	var time;
	if (op){
		time = boards[game].clock.elap - value;
		if (time<0){
			time = 0;
		}
	}
	else{
		time = boards[game].clock.elap + value;
		if (time>boards[game].clock.total){
			time = boards[game].clock.total;
		}
	}
	sendmessage("clock","update",time,"elap");
	boards[game].clock.updateclock();
	update_timers();
}