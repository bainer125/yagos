/*
########################################################

	Handle button input

########################################################
*/

var ws;

var game = 0;

var boards = [new Scoreboard("Game","Ice Hockey",update_timers)];

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

		document.getElementById("timer_m1_plus").addEventListener("click",function(){sendmessage("clock","update",boards[game].clock.min+10,"min");});
		document.getElementById("timer_m2_plus").addEventListener("click",function(){sendmessage("clock","update",boards[game].clock.min+1,"min");});
		document.getElementById("timer_s1_plus").addEventListener("click",function(){sendmessage("clock","update",boards[game].clock.sec+10,"sec");});
		document.getElementById("timer_s2_plus").addEventListener("click",function(){sendmessage("clock","update",boards[game].clock.sec+1,"sec");});
		document.getElementById("timer_ms_plus").addEventListener("click",function(){sendmessage("clock","update",boards[game].clock.ms+1,"ms");});

/*
		document.getElementById("timer_m1_minus").addEventListener("click",function(){sendmessage("clock","update");});
		document.getElementById("timer_m2_minus").addEventListener("click",function(){sendmessage("clock","update");});
		document.getElementById("timer_s1_minus").addEventListener("click",function(){sendmessage("clock","update");});
		document.getElementById("timer_s2_minus").addEventListener("click",function(){sendmessage("clock","update");});
		document.getElementById("timer_ms_minus").addEventListener("click",function(){sendmessage("clock","update");});*/

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
		})
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
	update_text(Math.floor(boards[game].clock.min/10),"m1",graphics);
	update_text(boards[game].clock.min%10,"m2",graphics);
	update_text(Math.floor(boards[game].clock.sec/10),"s1",graphics);
	update_text(boards[game].clock.sec%10,"s2",graphics);
	update_subitem_text("clock","ms",boards[game],graphics,false,"ms");
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