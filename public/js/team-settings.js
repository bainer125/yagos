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
			update_teams(boards[game],graphics);

		});
		update_teams(boards[game],graphics);
		document.getElementById("home_league_select").addEventListener("change",function(){
			update_team_data("home");
			boards[game]["home_teamInfo"] = teams.filter(x => x["league"] == document.getElementById("home_league_select").value && x["fullName"] == document.getElementById("home_team_select").value)[0];
			document.getElementById("home_current_league").innerHTML = boards[game]["home_teamInfo"]["league"];
			update_team_options();
		});
		document.getElementById("away_league_select").addEventListener("change",function(){
			update_team_data("away");
			boards[game]["away_teamInfo"] = teams.filter(x => x["league"] == document.getElementById("away_league_select").value && x["fullName"] == document.getElementById("away_team_select").value)[0];
			document.getElementById("away_current_league").innerHTML = boards[game]["away_teamInfo"]["league"];
			update_team_options();
		});
		document.getElementById("home_team_select").addEventListener("change",function(){
			boards[game]["home_teamInfo"] = teams.filter(x => x["league"] == document.getElementById("home_league_select").value && x["fullName"] == document.getElementById("home_team_select").value)[0];
			document.getElementById("home_current_team").innerHTML = boards[game]["home_teamInfo"]["fullName"];
			sendmessage("home_teamInfo","update",boards[game]["home_teamInfo"]);
			load_teams();
		});
		document.getElementById("away_team_select").addEventListener("change",function(){
			boards[game]["away_teamInfo"] = teams.filter(x => x["league"] == document.getElementById("away_league_select").value && x["fullName"] == document.getElementById("away_team_select").value)[0];
			document.getElementById("away_current_team").innerHTML = boards[game]["away_teamInfo"]["fullName"];
			sendmessage("away_teamInfo","update",boards[game]["away_teamInfo"]);
			load_teams();
		});
		load_teams();
		add_color_event_listeners();
		add_logo_event_listeners();
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
				update_teams(boards[game],graphics);
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

	// console.log(leagues);

	removeOptions(document.getElementById("home_league_select"));
	removeOptions(document.getElementById("away_league_select"));

	var homeLeagues = document.getElementById("home_league_select");
	var homeLeagueTemp = document.createElement("option");
	homeLeagueTemp.text = "Choose League";

	homeLeagues.add(homeLeagueTemp);
	leagues.forEach(function(item){
		var option = document.createElement("option");
		option.text = item;
		homeLeagues.add(option);
	});

	var awayLeagues = document.getElementById("away_league_select");
	var awayLeagueTemp = document.createElement("option");
	awayLeagueTemp.text = "Choose League";

	awayLeagues.add(awayLeagueTemp);
	leagues.forEach(function(item){
		var option = document.createElement("option");
		option.text = item;
		awayLeagues.add(option);
	});

	removeOptions(document.getElementById("home_team_select"));
	removeOptions(document.getElementById("away_team_select"));

	var filtered = teams.filter(function(a){
		var y=new RegExp(document.getElementById("home_league_select").value);
		//console.log(y);
		return y.test(a["league"]);
	});

	var homeTeams = document.getElementById("home_team_select");
	var homeTemp = document.createElement("option");
	homeTemp.text = "Choose Team";

	homeTeams.add(homeTemp);
	filtered.forEach(function(item){
		// var x = document.getElementById("home_team_select");
		var option = document.createElement("option");
		option.text = item["fullName"];
		homeTeams.add(option);
	});

	var filtered = teams.filter(function(a){
		var y=new RegExp(document.getElementById("away_league_select").value);
		//console.log(y);
		return y.test(a["league"]);
	});

	var awayTeams = document.getElementById("away_team_select");
	var awayTemp = document.createElement("option");
	awayTemp.text = "Choose Team";

	awayTeams.add(awayTemp);
	filtered.forEach(function(item){
		var option = document.createElement("option");
		option.text = item["fullName"];
		awayTeams.add(option);
	});
}

function update_team_options () {
	removeOptions(document.getElementById("home_team_select"));
	removeOptions(document.getElementById("away_team_select"));

	var filtered = teams.filter(function(a){
		var y=new RegExp(document.getElementById("home_league_select").value);
		//console.log(y);
		return y.test(a["league"]);
	});

	var homeTeams = document.getElementById("home_team_select");
	var homeTemp = document.createElement("option");
	homeTemp.text = "Choose Team";

	homeTeams.add(homeTemp);
	filtered.forEach(function(item){
		// var x = document.getElementById("home_team_select");
		var option = document.createElement("option");
		option.text = item["fullName"];
		homeTeams.add(option);
	});

	var filtered = teams.filter(function(a){
		var y=new RegExp(document.getElementById("away_league_select").value);
		//console.log(y);
		return y.test(a["league"]);
	});

	var awayTeams = document.getElementById("away_team_select");
	var awayTemp = document.createElement("option");
	awayTemp.text = "Choose Team";

	awayTeams.add(awayTemp);
	filtered.forEach(function(item){
		var option = document.createElement("option");
		option.text = item["fullName"];
		awayTeams.add(option);
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

function add_color_event_listeners () {
	edit_elements_by_class ("home_color" , function(elem){
		elem.addEventListener("change",function(){
			sendmessage("home_teamInfo","update",this.value,(this.id).split("_")[1]);
		});
	});
	edit_elements_by_class ("away_color" , function(elem){
		elem.addEventListener("change",function(){
			sendmessage("away_teamInfo","update",this.value,(this.id).split("_")[1]);
		});
	});
}

function add_logo_event_listeners () {
	edit_elements_by_class ("home_logo" , function(elem){
		elem.addEventListener("change",function(){
			sendmessage("home_teamInfo","update",this.value,(this.id).split("_")[1]);
		});
	});
	edit_elements_by_class ("away_logo" , function(elem){
		elem.addEventListener("change",function(){
			sendmessage("away_teamInfo","update",this.value,(this.id).split("_")[1]);
		});
	});
}