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
var webSocketServer = require('ws').Server;
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

var current = {
	Mode: "Ice Hockey",

	// Sports graphics
	Game: 0,

	size_x: 1920,
	size_y: 1080
}

add_new_scoreboard("Game 1", "Ice Hockey");
current.Game = 0;

var server = app.listen( port, function() {} );

wss = new webSocketServer({
	server
});

wss.on('connection', function connection ( ws ) {
	console.log("Connection opened");

	ws.on('message', function incoming ( mess ) {
		var event = JSON.parse(mess);
		handle_scoreboard_event( event , scoreboards );
		console.log(scoreboards[0]);
	})
});

app.get('/', function (req, res) {
	res.sendFile("/public/html/overlay.html", { root: '.' });
});

app.get('/control-panel',function(req,res){
	res.sendFile("/public/html/control-panel.html", { root: '.' });
});

app.get('/hockey-scoreboard',function(req,res){
	res.sendFile("/public/html/hockey-scoreboard.html", { root: '.' });
});

/*
app.get('/team-data.json',function(req,res){
	res.sendFile("public/team-data.json", { root: '.' });
});
*/

function update_display(){
	console.log(scoreboards[0].clock.sec + " . " + scoreboards[0].clock.ms);
}

function add_new_scoreboard(title,mode){

	// Add scoreboard object to scoreboards array
	scoreboards.push(new Scoreboard(title,mode,update_display));

	//console.log (scoreboards[0]);
}