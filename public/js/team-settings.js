/*

	Team settings control

*/

var teams = [];

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
		});
		document.getElementById("home_league_select").addEventListener("change",function(){
			update_team_data("home");
			boards[game]["home_teamInfo"] = teams.filter(x => x["league"] == document.getElementById("home_league_select").value && x["fullName"] == document.getElementById("home_team_select").value)[0];
			sendmessage("home_teamInfo","update",boards[game]["home_teamInfo"]);
		});
		document.getElementById("away_league_select").addEventListener("change",function(){
			update_team_data("away");
			boards[game]["away_teamInfo"] = teams.filter(x => x["league"] == document.getElementById("away_league_select").value && x["fullName"] == document.getElementById("away_team_select").value)[0];
			sendmessage("away_teamInfo","update",boards[game]["away_teamInfo"]);
		});
		document.getElementById("home_team_select").addEventListener("change",function(){
			boards[game]["home_teamInfo"] = teams.filter(x => x["league"] == document.getElementById("home_league_select").value && x["fullName"] == document.getElementById("home_team_select").value)[0];
			sendmessage("home_teamInfo","update",boards[game]["home_teamInfo"]);
		});
		document.getElementById("away_team_select").addEventListener("change",function(){
			boards[game]["away_teamInfo"] = teams.filter(x => x["league"] == document.getElementById("away_league_select").value && x["fullName"] == document.getElementById("away_team_select").value)[0];
			sendmessage("away_teamInfo","update",boards[game]["away_teamInfo"]);
		});
		load_teams();
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
			case "team data":
				teams = msg.data.Teams;
				update_options();
			break;
		}
	}
};

function update_options () {
	var leagues = [];
	teams.forEach(function(item,index){
		if(leagues.includes(teams[index].league)){
			//console.log("Do nothing");
		}
		else{
			leagues.push(teams[index].league);
		}
	});

	//console.log(leagues);

	leagues.forEach(function(item){
		var x = document.getElementById("home_league_select");
		var option = document.createElement("option");
		option.text = item;
		x.add(option);
	});
	leagues.forEach(function(item){
		var x = document.getElementById("away_league_select");
		var option = document.createElement("option");
		option.text = item;
		x.add(option);
	});

	removeOptions(document.getElementById("home_team_select"));
	removeOptions(document.getElementById("away_team_select"));

	var filtered = teams.filter(function(a){
		var y=new RegExp(document.getElementById("home_league_select").value);
		//console.log(y);
		return y.test(a["league"]);
	});

	filtered.forEach(function(item){
		var x = document.getElementById("home_team_select");
		var option = document.createElement("option");
		option.text = item["fullName"];
		x.add(option);
	});

	var filtered = teams.filter(function(a){
		var y=new RegExp(document.getElementById("away_league_select").value);
		//console.log(y);
		return y.test(a["league"]);
	});

	filtered.forEach(function(item){
		var x = document.getElementById("away_team_select");
		var option = document.createElement("option");
		option.text = item["fullName"];
		x.add(option);
	});
}

function update_team_data ( team ){

	removeOptions(document.getElementById(team+"_team_select"));

	var filtered = teams.filter(function(a){
		var y=new RegExp(document.getElementById(team+"_league_select").value);
		//console.log(y);
		return y.test(a["league"]);
	});

	filtered.forEach(function(item){
		var x = document.getElementById(team+"_team_select");
		var option = document.createElement("option");
		option.text = item["fullName"];
		x.add(option);
	});
}

function removeOptions(selectbox){
    var i;
    for(i = selectbox.options.length - 1 ; i >= 0 ; i--)
    {
        selectbox.remove(i);
    }
}