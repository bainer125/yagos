var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');

const {timer} = require('./public/modes.js')
const {h_scbd} = require('./public/modes.js')
const {h_pen} = require('./public/modes.js')
const {s_scbd} = require('./public/modes.js')
const {s_book} = require('./public/modes.js')
const {base_scbd} = require('./public/modes.js')



var app = express();



const hostname = '127.0.0.1';
const port = 3000;



app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// This is the current amount of games that are loaded on the server. Goes up each time a game is added
var o=0

// Temp variable for updating test clock, will change to something different for updating overlay
var update = [];

/*
Initializes the current values buffer which stores all of the data related to
displaying the overlay correctly when loaded.
*/

var current = {
	Mode: "Ice Hockey",

	// Sports graphics
	Game: 0,
	Scoreboard: true,
	Intermission: false,
	Commercial: false,
	Full_Screen: false,
	Player_Info: false,
	Player_Stats: false,
	Coach_Info: false,
	Coach_Stats: false,

	// News graphics
	Lower_Third: false,

	// Generic graphics
	Ticker: false,

	Size_x: 1920,
	Size_y: 1080,
	Animations: true,
	Keyer: false,
}

var home_info = {
	"Sport": "Ice Hockey",
	"League": "International",
	"City": "Ottawa",

	"Full Name": "Team Canada",
	"Location": "Canada",
	"Nickname": "Canadians",
	"Abbreviation": "CAN",

	"Color1": "#ff0000",
	"Color2": "#000000",
	"Color3": "#ffffff",
	"Color4": "#ffffff",

	"Logo1": "/Teams/International/Canada/logo1.png",
	"Logo2": "/Teams/International/Canada/logo2.png",
	"Logo3": "/Teams/International/Canada/logo3.png",
	"Logo4": "/Teams/International/Canada/logo4.png",
}

var away_info = {
	"Sport": "Ice Hockey",
	"League": "International",
	"City": "Ottawa",

	"Full Name": "Team Canada",
	"Location": "Canada",
	"Nickname": "Canadians",
	"Abbreviation": "CAN",

	"Color1": "#ff0000",
	"Color2": "#000000",
	"Color3": "#ffffff",
	"Color4": "#ffffff",

	"Logo1": "/Teams/International/Canada/logo1.png",
	"Logo2": "/Teams/International/Canada/logo2.png",
	"Logo3": "/Teams/International/Canada/logo3.png",
	"Logo4": "/Teams/International/Canada/logo4.png",
}

// Dictionaries of available games for each sport

var ih_g = {}
var base_g = {}
var f_g = {}
var s_g = {}



add_new_scoreboard("Ice Hockey","Game 1");
current.Game = 0;




app.get('/', function (req, res) {
	res.sendFile("overlay.html", { root: '.' });
});

app.get('/updates',function(req,res){
	res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    setInterval(() => {
    	sse_update(res,req);
    }, 25);
});

app.get('/control-panel',function(req,res){
	res.sendFile("control-panel.html", { root: '.' });
});

app.get('/current-scores/ice-hockey',function(req,res){
	res.writeHead(200, {
        'Content-Type': 'application/json'
    });
	res.end(JSON.stringify(ih_g));
});

app.get('/hockey-scoreboard',function(req,res){
	res.sendFile("hockey-scoreboard.html", { root: '.' });
});
/*
app.get('/team-data.json',function(req,res){
	res.sendFile("public/team-data.json", { root: '.' });
});
*/








app.post('/control-panel',function(req,res){
	if (req.body.button == 'game_switch'){
  		current.Game = req.body.value;
  		update.push('full');
  		console.log(ih_g[current.Game].home_pen);
  		console.log(ih_g[current.Game].away_pen);
  	}

    if (req.body.button == 'mode_switch'){
  		current.Mode = req.body.value;
  		console.log(current.Mode);
  	}

  	if (req.body.button == 'btn_Scoreboard'){
  		switch(req.body.value){
  			case "true": current.Scoreboard = true;
  			break;
  			default: current.Scoreboard = false;
  			break;
  		}
  		update.push("graphics");
  		console.log(current.Scoreboard);
  	}

  	if (req.body.button == 'btn_Intermission'){
  		switch(req.body.value){
  			case "true": current.Intermission = true;
  			break;
  			default: current.Intermission = false;
  			break;
  		}
  		update.push("graphics");
  	}

  	if (req.body.button == 'home_change'){
  		Object.assign(home_info,req.body.value);
  		update.push('home');
  	}

  	if (req.body.button == 'away_change'){
  		Object.assign(away_info,req.body.value);
  		update.push('away');
  	}

    res.end();
});

app.post('/overlay',function(req,res){
	if(req.body.button=='update_graphics'){
		update.push('graphics');
		update.push('home');
		update.push('away');
	}
	if(req.body.button=='update_scoreboard'){
		update.push('full');
	}
});

app.post('/hockey-scoreboard',function(req,res){
    // Check to make sure the game is still registered on the server
    event = req.body;
  	if(event.game in ih_g){

      	// Here include all the possible button clicks

      	if (event.button == 'clock'){
      		if (current.Game == event.game){
      			update.push('clock');
      		}
      		if(ih_g[event.game].clock.pause){
      			ih_g[event.game].clock.start();
      			ih_g[event.game].home_pen.forEach(function(item, index){
					ih_g[event.game].home_pen[index].clock.start();
				});
				ih_g[event.game].away_pen.forEach(function(item, index){
					ih_g[event.game].away_pen[index].clock.start();
				});
      		}
      		else{
      			ih_g[event.game].clock.stop();
      			ih_g[event.game].home_pen.forEach(function(item, index){
					ih_g[event.game].home_pen[index].clock.stop();
				});
				ih_g[event.game].away_pen.forEach(function(item, index){
					ih_g[event.game].away_pen[index].clock.stop();
				});
			}
		}

		if (event.button == 'h_score_up'){
			ih_g[event.game].home_score++;
			update.push('static');
		}

		if (event.button == 'a_score_up'){
			ih_g[event.game].away_score++;
			update.push('static');
		}

		if (event.button == 'h_score_down'){
			ih_g[event.game].home_score--;
			update.push('static');
		}

		if (event.button == 'a_score_down'){
			ih_g[event.game].away_score--;
			update.push('static');
		}

		if (event.button == 'h_shots_up'){
			ih_g[event.game].home_shots++;
			update.push('static');
		}

		if (event.button == 'a_shots_up'){
			ih_g[event.game].away_shots++;
			update.push('static');
		}

		if (event.button == 'h_shots_down'){
			ih_g[event.game].home_shots--;
			update.push('static');
		}

		if (event.button == 'a_shots_down'){
			ih_g[event.game].away_shots--;
			update.push('static');
		}

		if (event.button == 'homeGoal'){
			ih_g[event.game].home_score++;
			update.push('homeGoal');
		}

		if (event.button == 'awayGoal'){
			ih_g[event.game].away_score++;
			update.push('awayGoal');
		}

		if (event.button =='add_h_pen'){
			var pendata = JSON.parse(event.value);
			ih_g[event.game].add_pen('h',new h_pen(pendata.dur,pendata.num,pendata.infr));
			if(!ih_g[event.game].clock.pause){
				ih_g[event.game].home_pen[ih_g[event.game].home_pen.length-1].clock.start();
			}
			update.push('full');
		}

		if (event.button =='add_a_pen'){
			var pendata = JSON.parse(event.value);
			ih_g[event.game].add_pen('a',new h_pen(pendata.dur,pendata.num,pendata.infr));
			if(!ih_g[event.game].clock.pause){
				ih_g[event.game].away_pen[ih_g[event.game].away_pen.length-1].clock.start();
			}
			update.push('full');
		}

		if (event.button == 'period_up'){
			ih_g[event.game].period++;
			update.push('full');
		}
		if (event.button == 'period_down'){
			ih_g[event.game].period--;
			update.push('full');
		}



	}
	res.end();
});

app.post('/confirm-update',function(req,res){

  	if (req.body.confirmation != undefined){
  		// Update with array function
  		var d = update.indexOf(req.body.confirmation);
  		if(d>-1){
			update.splice(d,1);
			console.log("Overlay received "+req.body.confirmation);
  		}
	}
    res.end();
});



var server = app.listen(port, function() {

});



function sse_update(res,req){
	switch(current.Mode){
		case 'Ice Hockey':
			update.forEach(ev => {
				data = ih_update_data(ev);
				res.write(`event:${ev}\ndata:${data}`);
				res.write('\n\n');
				//console.log("Sent");
			});
		break;
	}
}

function update_display(){
	//console.log(`${min} : ${sec}`);
	/*
	update_timers(ih_g[current.Game]);
*/
	console.log("ms");
}

function add_new_scoreboard(sport,title){
	switch(sport){
		case 'Ice Hockey':
			ih_g[o] = new h_scbd(title);
		break;
		case 'Baseball':
			base_g[o] = new base_scbd(title);
		break;
		case 'Soccer':
			s_g[o] = new s_scbd(title);
		break;
		case 'Football':
		break;
		default:
			ih_g[o] = new h_scbd(title);
		break;
	}
	o++;
}

// This determines the data to be sent to the overlay based on the event
function ih_update_data(event){
	switch(event){
		case 'clock':
			return ih_g[current.Game].clock.pause;
		break;
		case 'static':
			return JSON.stringify(ih_g[current.Game]);
		break;
		case 'full':
			return JSON.stringify(ih_g[current.Game]);
		break;
		case 'graphics':
			return JSON.stringify(current);
		break;
		case 'homeGoal':
			return JSON.stringify(ih_g[current.Game]);
		break;
		case 'awayGoal':
			return JSON.stringify(ih_g[current.Game]);
		break;
		case 'home':
			return JSON.stringify(home_info);
		break;
		case 'away':
			return JSON.stringify(away_info);
		break;
		default:
			return false;
		break;
	}
}

/*
function update_timers(g){
	g.del_pen();
}
*/