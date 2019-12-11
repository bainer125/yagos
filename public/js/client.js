/*

    Standard functions and initializations for all websocket connected clients

*/

var preview;

var max_X, max_Y;

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

function send_graphics_message (item, action, value=false, subitem=false) {
    var msg = {
        type: "graphics",
        data: {}
    }

    var obj = {
        item: item,
        action: action,
        value: value
    }

    msg.data = obj;

    ws.send(JSON.stringify(msg));

    handle_graphics_event(obj, graphics, true, item);
}

function send_self_message (item,action,value=false,subitem=false){
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
            if (typeof obj[property] == "object" && typeof obj[property] !== "undefined"){
                if (Array.isArray(ret)){
                    ret[0]={};
                    target[0]={};
                }
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

function create_and_assign_option ( select , option ){
    var opt = document.createElement('option');
    opt.innerHTML = option;
    select.appendChild(opt);
}