
var visuals = [];

var graphics = {};

//************************************************************************************************
// Make buttons named the same as the animations in order to further modularize events and actions
//************************************************************************************************

var animations = ["showGraphic","hideGraphic","homeGoal","awayGoal","homePenalty","awayPenalty"];

var a = document.getElementById('Scoreboard');
var scoreboard;
a.addEventListener("load",function() {
    scoreboard = a.contentDocument;
    visuals.push(scoreboard);
    graphics["Scoreboard"]=scoreboard;
    //console.log(scoreboard);
    update_team_info("home",home_info);
		update_team_info("away",away_info);
		update_overlay_position();
}, false);

var b = document.getElementById('Intermission');
var intermission;
b.addEventListener("load",function() {
    intermission = b.contentDocument;
    visuals.push(intermission);
    graphics["Intermission"]=intermission;
    //console.log(scoreboard);
}, false);



var game = new h_scbd("",update_timers);

var current = {};

var old_current = {};

var home_info = {
	"Sport": "Ice Hockey",
	"League": "International",
	"City": "Ottawa",

	"Full Name": "Team Canada",
	"Location": "Canada",
	"Nickname": "Canadians",
	"Abbreviation": "OTT",

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
	"Abbreviation": "OTT",

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

console.log("Started Listening");

var evtSource = new EventSource("/updates");

send_event("update_graphics",true);

send_event("update_scoreboard",true);





/*
#######################################################


Event sources for SSE updates

clock - gets clock start/stop flag

static - updates all static values (not time dependent)

full - updates entire game object (including timers)


#######################################################
*/



evtSource.addEventListener("clock", function(e) {
	if(e.data=="false"){
		if(game.clock.pause){
			game.clock.start();
			game.home_pen.forEach(function(item, index){
				game.home_pen[index].clock.start();
			});
			game.away_pen.forEach(function(item, index){
				game.away_pen[index].clock.start();
			});
		}
	}
	else{
		game.clock.stop();
		game.home_pen.forEach(function(item, index){
			game.home_pen[index].clock.stop();
		});
		game.away_pen.forEach(function(item, index){
			game.away_pen[index].clock.stop();
		});
	}
    //console.log(e.data);
    send_confirmation("clock");
})

evtSource.addEventListener("static", function(e) {
	//console.log(e.data);
	var data = JSON.parse(e.data);
	console.log(game.name);
	game.home_score=data.home_score
	game.away_score=data.away_score
	update_score();
	game.home_shots=data.home_shots
	game.away_shots=data.away_shots
	update_shots();
	update_period(data.period);
    send_confirmation("static");
})

evtSource.addEventListener("full", function(e) {
	var full = JSON.parse(e.data);
	game.home_score=full.home_score
	game.away_score=full.away_score
	update_score();
	game.home_shots=full.home_shots
	game.away_shots=full.away_shots
	update_shots();
	update_period(full.period);
	update_penalties(full.home_pen,full.away_pen);
	update_penalty_display();
	update_clock(full.clock);
    send_confirmation("full");
    //console.log(game);
})

evtSource.addEventListener("graphics", function(e) {
	var graph = JSON.parse(e.data);
	Object.assign(old_current,current);
	Object.assign(current,graph);
    //console.log(graph);
    if(current["Scoreboard"]!=old_current["Scoreboard"]){
    	show_graphic(document.getElementById("Scoreboard"),true,current["Scoreboard"]);
    }
    if(current["Intermission"]!=old_current["Intermission"]){
    	show_graphic(document.getElementById("Intermission"),true,current["Intermission"]);
	}
    send_confirmation("graphics");
})

evtSource.addEventListener("home", function(e) {
	var info = JSON.parse(e.data);
	Object.assign(home_info,info);
	update_team_info("home",home_info);
	send_confirmation("home");
})

evtSource.addEventListener("away", function(e) {
	var info = JSON.parse(e.data);
	Object.assign(away_info,info);
	update_team_info("away",away_info);
	send_confirmation("away");
})

// Event listener for moving overlay from control panel, on true value
evtSource.addEventListener("Move_True", function(e) {
	document.getElementById("scoreboard").style.top = "50%";
})

// Event listener for moving overlay from control panel, off true value
evtSource.addEventListener("Move_False", function(e) {
	document.getElementById("scoreboard").style.top = "10%";
})

evtSource.addEventListener("overlay_pos", function(e) {
	var info = JSON.parse(e.data);
	overlay_pos.top = info.top;
	overlay_pos.left = info.left;

	console.log(overlay_pos);
	update_overlay_position();
})

evtSource.addEventListener("homeGoal", function(e) {
	var data = JSON.parse(e.data);
	game.home_score=data.home_score;
	play_animation("Scoreboard","homeGoal");
	send_confirmation("homeGoal");
	update_score();
})

evtSource.addEventListener("awayGoal", function(e) {
	var data = JSON.parse(e.data);
	game.away_score=data.away_score;
	play_animation("Scoreboard","awayGoal");
	send_confirmation("awayGoal");
	update_score();
})

function update_timers(){
	if(game.clock.min>0){
		if(game.clock.sec>9){
			update_html_text(`${game.clock.min}:${game.clock.sec}`,"clockText");
		}
		else{
			update_html_text(`${game.clock.min}:0${game.clock.sec}`,"clockText");
		}
	}
	else{
		update_html_text(`${game.clock.sec}.${game.clock.ms}`,"clockText");
	}

	var hpr = [];
	var apr = [];
	var minh = 100000000;
	var mina = 100000000;
	var indh;
	var inda;

	if(game.home_pen.length>0){
		game.home_pen.forEach(function(item, index){
			console.log(item);
			hpr.push(item.clock.total-item.clock.elap);
		});
	}

	if(game.away_pen.length>0){
		game.away_pen.forEach(function(item, index){
			apr.push(item.clock.total-item.clock.elap)
		});
	}

	if (hpr.length!=0){
		if (hpr.length>1){
			sortWithIndeces(hpr);
			indh=hpr.sortIndices[1];
			minh=hpr[1];
		}
		else if (hpr.length==1){
			indh=0;
			minh=hpr[0];
		}
	}

	if (apr.length!=0){
		if (apr.length>1){
			sortWithIndeces(apr);
			inda=apr.sortIndices[1];
			mina=apr[1];
		}
		else if (apr.length==1){
			inda=0;
			mina=apr[0];
		}
	}

	if(minh>mina){
		if(typeof inda !== 'undefined'){
			update_penalty_time(game.away_pen[inda].clock.min,game.away_pen[inda].clock.sec);
		}
	}
	else{
		if(typeof indh !== 'undefined'){
			update_penalty_time(game.home_pen[indh].clock.min,game.home_pen[indh].clock.sec);
		}
	}
	update_penalty_display();
}

function send_confirmation(status){
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/confirm-update", true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({
	    "confirmation": status
	}));
}

function update_period(per){
	var txt;
	switch(per){
		case 1:
			txt = '1st';
		break;
		case 2:
			txt = '2nd';
		break;
		case 3:
			txt = '3rd';
		break;
		case 4:
			txt = 'OT';
		break;
		default:
			if(per>4){
				txt = (per-3).toString() + "OT";
			}
			else{txt='1st';}
		break;
	}
	game.period = per;
	update_html_text(`${txt}`,"periodText");
}

function update_penalties(h,a){
	game.home_pen=[];
	game.away_pen=[];
	h.forEach(function(item, index){
		var pen = new h_pen(item.clock.dur,item.num,item.infr);
		var temp = new timer(item.clock.dur,true);
		Object.assign(temp,item.clock);
		Object.assign(pen.clock,temp);
		game.add_pen('h',pen);
		if (game.clock.pause == false){
			game.home_pen[game.home_pen.length-1].clock.start();
		}
	});
	a.forEach(function(item, index){
		var pen = new h_pen(item.clock.dur,item.num,item.infr);
		var temp = new timer(item.clock.dur,true);
		Object.assign(temp,item.clock);
		Object.assign(pen.clock,temp);
		game.add_pen('a',pen);
		if (game.clock.pause == false){
			game.away_pen[game.away_pen.length-1].clock.start();
		}
	});
}

function update_penalty_time(min,sec){
	var text;
	if (sec<10){
		text = `${min}:0${sec}`;
	}
	else{
		text = `${min}:${sec}`;
	}
	console.log(text);
	update_html_text(text,"homePenaltyClock");
	update_html_text(text,"awayPenaltyClock");
	update_html_text(text,"evenPenaltyClock");
}

function update_penalty_display(){
	if(game.home_pen.length == 0 && game.away_pen.length == 0){
		// scoreboard.getElementById("homePenalty").style.display="none";
		// scoreboard.getElementById("awayPenalty").style.display="none";
		// scoreboard.getElementById("evenPenalty").style.display="none";
	}

	else if(game.home_pen.length == 1 && game.away_pen.length == 0){
		// scoreboard.getElementById("homePenalty").style.display="inline";
		// scoreboard.getElementById("homePenaltyText").innerHTML="Power Play";
		// scoreboard.getElementById("awayPenalty").style.display="none";
		// scoreboard.getElementById("evenPenalty").style.display="none";
	}

	else if(game.home_pen.length > 1 && game.away_pen.length == 1){
		// scoreboard.getElementById("homePenalty").style.display="inline";
		// scoreboard.getElementById("homePenaltyText").innerHTML="4 on 3";
		// scoreboard.getElementById("awayPenalty").style.display="none";
		// scoreboard.getElementById("evenPenalty").style.display="none";
	}

	else if(game.home_pen.length > 1 && game.away_pen.length == 0){
		// scoreboard.getElementById("homePenalty").style.display="inline";
		// scoreboard.getElementById("homePenaltyText").innerHTML="5 on 3";
		// scoreboard.getElementById("awayPenalty").style.display="none";
		// scoreboard.getElementById("evenPenalty").style.display="none";
	}

	else if(game.home_pen.length == 0 && game.away_pen.length == 1){
		// scoreboard.getElementById("homePenalty").style.display="none";
		// scoreboard.getElementById("awayPenalty").style.display="inline";
		// scoreboard.getElementById("awayPenaltyText").innerHTML="Power Play";
		// scoreboard.getElementById("evenPenalty").style.display="none";
	}

	else if(game.home_pen.length == 1 && game.away_pen.length > 1){
		// scoreboard.getElementById("homePenalty").style.display="none";
		// scoreboard.getElementById("awayPenalty").style.display="inline";
		// scoreboard.getElementById("awayPenaltyText").innerHTML="4 on 3";
		// scoreboard.getElementById("evenPenalty").style.display="none";
	}

	else if(game.home_pen.length == 0 && game.away_pen.length > 1){
		// scoreboard.getElementById("homePenalty").style.display="none";
		// scoreboard.getElementById("awayPenalty").style.display="inline";
		// scoreboard.getElementById("awayPenaltyText").innerHTML="5 on 3";
		// scoreboard.getElementById("evenPenalty").style.display="none";
	}

	else if(game.home_pen.length == 1 && game.away_pen.length == 1){
		// scoreboard.getElementById("homePenalty").style.display="none";
		// scoreboard.getElementById("awayPenalty").style.display="none";
		// scoreboard.getElementById("evenPenalty").style.display="inline";
		// scoreboard.getElementById("evenPenaltyText").innerHTML="4 on 4";
	}

	else if(game.home_pen.length > 1 && game.away_pen.length > 1){
		// scoreboard.getElementById("homePenalty").style.display="none";
		// scoreboard.getElementById("awayPenalty").style.display="none";
		// scoreboard.getElementById("evenPenalty").style.display="inline";
		// scoreboard.getElementById("evenPenaltyText").innerHTML="3 on 3";
	}
}
function update_clock(time){
	Object.assign(game.clock,time);
	update_timers(game);
}
function update_score(){
	update_html_text(game.home_score,"Score","home");
	update_html_text(game.away_score,"Score","away");
}
function update_shots(){
	update_html_text(game.home_shots,"Shots","home");
	update_html_text(game.away_shots,"Shots","away");
}

/*
	Function that sets the position of the overlay on the screen to
	whatever values are stored in the var 'overlay_pos'.

	Currently it is setup to set the overlay to a percentage of the
	total height from the top, and a percentage of the total width
	from the left.
*/
function update_overlay_position() {
	document.getElementById("scoreboard").style.top = overlay_pos.top;
	document.getElementById("scoreboard").style.left = overlay_pos.left;
}

// Sorts the values from largest to smallest
function sortWithIndeces(toSort) {
  // Sorts largest to smallest
	for (var i = 0; i < toSort.length; i++) {
		toSort[i] = [toSort[i], i];
	}
	toSort.sort(function(right, left) {
    	return left[0] < right[0] ? -1 : 1;
	});
  	toSort.sortIndices = [];
  	for (var j = 0; j < toSort.length; j++) {
    	toSort.sortIndices.push(toSort[j][1]);
    	toSort[j] = toSort[j][0];
	}
  	return toSort;
}


// New function to show or hide entire specific graphic
function show_graphic(a,animate,bool){
	if(animate){
		// Show graphic
		if(bool){
			play_animation(a.id,"showGraphic");
		}

		// Hide graphic
		else{
			play_animation(a.id,"hideGraphic");
		}
	}
	else{
		if(bool){
		a.style.display="inline";
		}
		else{
			a.style.display="none";
		}
	}
}

// Hides or shows element depending on boolean
function hide_show(a,animate,bool){
	if(bool){
		a.style.display="inline";
	}
	else{
		a.style.display="none";
	}
}


function play_animation(graphic,event){
	var a = graphics[graphic].getElementsByClassName(event);
	for (i=0,len=a.length;i<len;i++){
		a[i].beginElement();
	}
}


function update_team_info(team,data){
	var visLength = visuals.length;
	console.log(visuals);
	for (var j = 0; j < visLength; j++) {
		var fill = visuals [j].getElementsByClassName(team+"Color1"),i,len;
		console.log(team+"Color1");
		for (i=0,len=fill.length;i<len;i++){
			fill[i].style.fill=data.Color1;
		}
		var abbr = visuals[j].getElementsByClassName(team+"Abbreviation"),i,len;
		for (i=0,len=abbr.length;i<len;i++){
			abbr[i].innerHTML=data.Abbreviation;

	var tobeupd = ["City","Full Name","Location","Nickname","Abbreviation"];
	var vals = Object.values(graphics);
	for (const graphic of vals) {

		var fill = graphic.getElementsByClassName(team+"Color1");
		change_color(fill,data.Color1);

		var fill = graphic.getElementsByClassName(team+"Color2");
		change_color(fill,data.Color2);

		var fill = graphic.getElementsByClassName(team+"Color3");
		change_color(fill,data.Color3);

		var fill = graphic.getElementsByClassName(team+"Color4");
		change_color(fill,data.Color4);

		for (var k = 0; k < tobeupd.length; k++){
			update_inner_html(data,tobeupd[k],team);
		}

		var loc = graphic.getElementsByClassName(team+"Logo1"),i,len;
		for (i=0,len=loc.length;i<len;i++){
			loc[i].setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', data["Logo1"]);
		}
	}
}

// To update values, no longer take graphic as input. Simply iterate through all graphics in "graphics".
// If the graphic is 'false' in the "current" object, skip it. If it is 'true', then iterate through all
// elements that need to be updated and update them.

// Updates inner HTML for text based values
function update_inner_html(data,type,team=""){
	var vals = Object.keys(graphics);
	for (const graphic of vals) {
		var a = graphics[graphic].getElementsByClassName(team+type),i,len;
		for (i=0,len=a.length;i<len;i++){
			a[i].innerHTML=data[type];
		}
	}
}

function update_html_text(data,type,team=""){
	var vals = Object.keys(graphics);
	for (const graphic of vals) {
		var a = graphics[graphic].getElementsByClassName(team+type),i,len;
		for (i=0,len=a.length;i<len;i++){
			a[i].innerHTML=data;
		}
	}
}

function send_event(button,value){
	var xhr = new XMLHttpRequest();
	xhr.open("POST", "/overlay", true);
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.send(JSON.stringify({
	    "button": button, "value": value
	}));
}

function change_color(elems,color){
	for (i=0,len=elems.length;i<len;i++){
		if(elems[i].tagName=="stop"){
			elems[i].style["stop-color"]=color;
		}
		else{
			elems[i].style.fill=color;
		}
	}
}
