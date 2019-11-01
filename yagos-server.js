/*

	Web server for YAGOS.
	Monitors currently displayed graphics and scoreboards.

	Last rev: 10/31/19

	Authors: Liam McBain, Zach Schaller

	YAGOS

*/

// Import necessary modules

var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');


// Import classes

const {timer} = require('./public/js/classes.js')
const {Scoreboard} = require('./public/js/classes.js')
const {penalty_timer} = require('./public/js/classes.js')



var app = express();

console.log("Server Started");



const hostname = '127.0.0.1';
const port = 3000;



app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Temp variable for updating test clock, will change to something different for updating overlay
var update = [];

/*
Initializes the current values buffer which stores all of the data related to
displaying the overlay correctly when loaded.
*/

var scoreboards = [];

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

var overlay_pos = {
	"top": "10px",
	"left": "5px"
}

add_new_scoreboard("Game 1");
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

// ----------------------------------------------------ZS Week 2--------------------------------------------------------------
  	if (req.body.button == 'btn_Test_Overlay') {
  		switch(req.body.value) {
  			case "true": update.push("Move_True");
  				console.log("Move True");
  			break;
  			default: update.push("Move_False");
  				console.log("Move False")
  			break;
  		}
  		update.push("graphics");
  	}

  	if(req.body.button == 'update_Overlay_Pos') {
  		console.log("Recived update overlay call");

  		overlay_pos.top = req.body.value.top;
  		overlay_pos.left = req.body.value.left;

  		update.push("overlay_pos");
  		update.push("graphics");
  	}
// ----------------------------------------------------ZS Week 2--------------------------------------------------------------

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

function add_new_scoreboard(title){

	scoreboards.push(new Scoreboard(title));

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
		case 'overlay_pos':
			return JSON.stringify(overlay_pos);
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