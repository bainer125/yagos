var webSocketServer = require ('websocket').server;

var express = require('express');
var app = express();
app.use(express.static('public'));

var port = 3000;

var server = app.listen(port, function() {

});

wsServer = new webSocketServer({
  httpServer: server
});

var Scoreboard = {
	home_shots: 0
}

wsServer.on('request', function(request) {
  var connection = request.accept(null, request.origin);
  console.log ("Connection opened");

  // This is the most important callback for us, we'll handle
  // all messages from users here.
  connection.on('message', function(message) {
    if (message.type === 'utf8') {
    	var rec = JSON.parse(message.utf8Data);
    	console.log(rec.item + ":" + rec.action);

    	switch (rec.action){
    		case "up":
    			Scoreboard[rec.item]++;
    		break;
    		case "down":
    			Scoreboard[rec.item]--;
    		break;
    	}

    	console.log(Scoreboard);

	    var obj = {
	    	author: "Liam",
	    	data: 0
	    }
	    obj.data = 6;
	    var json = JSON.stringify(obj);
	    connection.sendUTF(json);
    }
  });

  connection.on('close', function(connection) {
    // close user connection
    console.log("Connection closed");
  });
});