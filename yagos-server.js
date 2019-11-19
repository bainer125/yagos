/*

	Web server for YAGOS.
	Monitors currently displayed graphics and scoreboards.
	Serves control pages for scoreboards and graphic display.

	Last rev: 10/31/19

	Authors: Liam McBain, Zach Schaller

	YAGOS

*/

// Import necessary modules

var express = require('express');
var WebSocket = require ('ws');
var fs = require('fs');
var bodyParser = require('body-parser');

// Import classes

const {timer} = require('./public/js/classes.js');
const {Scoreboard} = require('./public/js/classes.js');
const {penalty_timer} = require('./public/js/classes.js');

const {handle_scoreboard_event} = require('./public/js/events.js');
const {handle_graphics_event} = require('./public/js/events.js');

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
var graphics = [];
var settings = [];

var current = {
	Mode: "Ice Hockey",

	// Sports graphics
	Game: 0
}

add_new_scoreboard("Game 1", "Ice Hockey");
add_new_scoreboard("Game 2", "Ice Hockey");
add_new_scoreboard("Game 3", "Ice Hockey");
current.Game = 0;

var server = app.listen( port, function() {} );

wss = new WebSocket.Server({
	server
});

wss.on('connection', function connection ( ws ) {
	var gamereq = {
		type: "boards",
		data: scoreboards
	}
	console.log("Connection opened");
	ws.send(JSON.stringify(gamereq));
	ws.on('message', function incoming ( mess ) {
		var x = JSON.parse(mess);
		var event = x.data;
		switch (x.type){
			case 'score':
				handle_scoreboard_event( event , scoreboards );
				broadcast(x,ws);
			break;
			case 'graphics':
			break;
			case 'game':
				current.Game = event;
				broadcast(x,ws);
			break;
			case 'game request':
				gamereq.data = scoreboards;
				ws.send(JSON.stringify(gamereq));
			break;
			case 'load teams':
				var raw = fs.readFileSync('./public/Teams/team-data.json');
				var data = JSON.parse(raw);
				var newteams = [];
				data.Teams.forEach(function(team){
					var i = 1;
					var path = "/Teams/"+team["league"]+"/"+team["location"];
					fs.readdirSync("./public"+path).forEach(function(file){
						team["logo"+i.toString()] = path + "/" + file;
						i++;
					});
					newteams.push(team);
				});
				data.Teams = newteams;
				var msg = {
					type: "team data",
					data: data
				}
				broadcast(msg,ws,false);
			break;
			case 'load themes':
				var path = "/Teams/"+team["league"]+"/"+team["location"];
				fs.readdirSync("./public"+path).forEach(function(file){
				});
			break;
		}
	})
});

app.get('/', function (req, res) {
	res.sendFile("/public/html/overlay.html", { root: '.' });
});

app.get('/preview', function (req, res) {
	res.sendFile("/public/html/overlay-preview.html", { root: '.' });
});

app.get('/control-panel',function(req,res){
	res.sendFile("/public/html/control-panel.html", { root: '.' });
});

app.get('/hockey-scoreboard',function(req,res){
	res.sendFile("/public/html/hockey-scoreboard.html", { root: '.' });
});

app.get('/team-settings',function(req,res){
	res.sendFile("/public/html/team-settings.html", { root: '.' });
});

/*
app.get('/team-data.json',function(req,res){
	res.sendFile("public/team-data.json", { root: '.' });
});
*/

function update_display(){
	console.log(scoreboards[current.Game].clock.sec + " . " + scoreboards[current.Game].clock.ms);
}

function add_new_scoreboard(title,mode){

	// Add scoreboard object to scoreboards array
	scoreboards.push(new Scoreboard(title,mode,update_display));

	//console.log (scoreboards[0]);
}

function broadcast(data,ws,exclude=true){
	wss.clients.forEach(function each(client){
		if(exclude){
			if (client!==ws && client.readyState === WebSocket.OPEN){
				client.send(JSON.stringify(data));
			}
		}
		else{
			if (client.readyState === WebSocket.OPEN){
				client.send(JSON.stringify(data));
			}
		}
	});
}