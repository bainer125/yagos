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

	// Initialize the new penalty select boxes

	var home_numbers = document.getElementById("home_new_penalty_number");
	var away_numbers = document.getElementById("away_new_penalty_number");
	var home_infractions = document.getElementById("home_new_penalty_infraction");
	var away_infractions = document.getElementById("away_new_penalty_infraction");

	for (var i=1;i<100;i++){
		create_and_assign_option(home_numbers,i);
	}
	for (var i=1;i<100;i++){
		create_and_assign_option(away_numbers,i);
	}

	var infractions = ["Tripping","Slashing","Roughing","Hooking","Cross Checking",
		"High Sticking","Delay of Game","Charging","Boarding","Hitting from Behind",
		"Spearing","Fighting"];

	for (var i=0;i<infractions.length;i++){
		create_and_assign_option(home_infractions,infractions[i]);
	}
	for (var i=0;i<infractions.length;i++){
		create_and_assign_option(away_infractions,infractions[i]);
	}

	home_numbers.value = 1;
	away_numbers.value = 1;

	document.getElementById("add_home_penalty").addEventListener("click",function(){add_new_penalty("home");});
	document.getElementById("add_away_penalty").addEventListener("click",function(){add_new_penalty("away");});

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
		document.getElementById("period_up").addEventListener("click",function(){sendmessage("period","up");});
		document.getElementById("period_down").addEventListener("click",function(){
			if(boards[game].period>1){
				sendmessage("period","down");
			}
		});


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
			update_teams(boards[game],graphics);
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
				update_penalties();
				update_teams(boards[game],graphics);
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

	// Update penalty timers

	var t = ["home", "away"];
	for(var i=0;i<t.length;i++){
		var deleted = 0;
		boards[game][t[i]+"_penalties"].forEach(function(pen,index){
			var rem = pen.initial + pen.finish - boards[game].clock.elap;
			var min = Math.floor((rem)/60000);
			var sec = Math.floor(rem/1000) - 60*min;
			if(sec>9){
				update_text(min.toString() + ":" + sec.toString(),t[i]+"_penalty_time"+(index+1).toString(),graphics);
			}
			else{update_text(min.toString() + ":0" + sec.toString(),t[i]+"_penalty_time"+(index+1).toString(),graphics);}
			if (pen.initial+pen.finish<boards[game].clock.elap+1000){
				console.log(index);
				var ind = index+deleted;
				console.log(index,ind)
				boards[game][t[i]+"_penalties"].splice(index,1);
				deleted++;
				console.log(deleted);
				delete_penalty_view(t[i],ind);
			};
		});
	}


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

function add_new_penalty ( team ){
	var num = document.getElementById(team + "_new_penalty_number").value;
	var dur = document.getElementById(team + "_new_penalty_time").value;
	var inf = document.getElementById(team + "_new_penalty_infraction").value;

	var pen = new penalty_timer(dur,boards[game].clock.elap,num,inf);
	boards[game][team+"_penalties"].push(pen);
	add_penalty_view( team , pen , boards[game][team+"_penalties"].length);
	sendmessage(team+"_penalties","update",boards[game][team+"_penalties"]);
}




// This deals with HTML elements and will need to have its classes updated if
// the HTML or CSS is changed.

function add_penalty_view ( team , penalty , penaltynum ){
	var num = penalty.number;
	var dur = penalty.initial + penalty.finish - boards[game].clock.elap;
	var inf = penalty.infraction;
	console.log(num,dur,inf);
	var list = document.getElementById(team + "_penalty_list");
	var div = document.createElement("div");

	// Current number of penalty
	var pennum = penaltynum.toString();

	div.id = team+"_penalty" + pennum;

	// I just learned that multiple classes can be added separated by commas but
	// I'm too lazy to do it right now, so we'll get back to it later
	div.classList.add("row");// row
	div.classList.add("inherit_w");// inherit_w 
	div.classList.add("penalty_list_item");// penalty_list_item
	var div1 = document.createElement("div");
	div1.classList.add("col");
	div1.classList.add("inherit_h");
	div1.classList.add("penalty_col");
	div1.classList.add(team+"_penalty_number"+pennum);
	div1.id = team+"_penalty_number" + pennum;
	div1.innerHTML = num;
	var div2 = document.createElement("div");
	div2.classList.add("col");
	div2.classList.add("inherit_h");
	div2.classList.add("penalty_col");
	div2.classList.add(team+"_penalty_time"+pennum);
	div2.id = team+"_penalty_time" + pennum;
	var min = Math.floor((dur)/60000);
	var sec = Math.floor(dur/1000) - 60*min;
	if(sec>9){
		div2.innerHTML = min.toString() + ":" + sec.toString();
	}
	else{div2.innerHTML = min.toString() + ":0" + sec.toString();}
	var div3 = document.createElement("div");
	div3.classList.add("col");
	div3.classList.add("inherit_h");
	div3.classList.add("penalty_col");
	div3.classList.add(team+"_penalty_number"+pennum);
	div3.id = team+"_penalty_infraction" + pennum;
	div3.innerHTML = inf;
	var div4 = document.createElement("div");
	div4.classList.add("col");
	div4.classList.add("inherit_h");
	div4.classList.add("penalty_btn");
	var btn = document.createElement("button");
	btn.classList.add("inherit_w");
	btn.classList.add("inherit_h");
	btn.classList.add("btn_minus");
	btn.innerHTML = "-";
	btn.addEventListener("click",function(){
		boards[game][team+"_penalties"].splice(penaltynum-1,1);
		delete_penalty_view( team , penaltynum-1);
		sendmessage(team+"_penalties","update",boards[game][team+"_penalties"]);
	});

	// Append all the children in their respective places

	div4.appendChild(btn);

	div.appendChild(div1);
	div.appendChild(div2);
	div.appendChild(div3);
	div.appendChild(div4);

	list.appendChild(div);
}

function delete_penalty_view ( team , penaltynum ){
	var pen = document.getElementById(team + "_penalty"+(penaltynum + 1).toString());
	pen.parentNode.removeChild(pen);
}

function repopulate_penalty_view ( team , penalty , penaltynum ){
	
}

function update_penalties (){
	var t = ["home", "away"];
	for(var i=0;i<t.length;i++){
		boards[game][t[i]+"_penalties"].forEach(function(pen,index){
			add_penalty_view( t[i] , pen , index+1 );
			var rem = pen.initial + pen.finish - boards[game].clock.elap;
			var min = Math.floor((rem)/60000);
			var sec = Math.floor(rem/1000) - 60*min;
			if(sec>9){
				update_text(min.toString() + ":" + sec.toString(),t[i]+"_penalty_time"+(index+1).toString(),graphics);
			}
			else{update_text(min.toString() + ":0" + sec.toString(),t[i]+"_penalty_time"+(index+1).toString(),graphics);}
		});
	}
}