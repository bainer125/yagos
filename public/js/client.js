/*

    Standard functions and initializations for all websocket connected clients

*/

var ws;

var game = 0;

var boards = [new Scoreboard("Game","Ice Hockey")];

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

function request_update (){
    var msg = {
        type: "game request",
        data: {}
    }
    ws.send(JSON.stringify(msg));
}

function load_teams (){
    var msg = {
        type: "load teams"
    }
    ws.send(JSON.stringify(msg));
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