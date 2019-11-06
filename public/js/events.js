/*

	Functions related to event handling

	Last rev: 11/1/19

	Authors: Liam McBain

	YAGOS

*/

function handle_scoreboard_event ( event , boards , overlay = false, graphics = {} ) {
	
	action = event.action;
	item = event.item;
	value = event.value;

	var board = boards[event.game];

	switch(action){

		case 'up':

			board[item]++;

			if (overlay){
				update_item_text(item,board,graphics);
			}

		break;

		case 'down':

			board[item]--;

			if (overlay){
				update_item_text(item,board,graphics);
			}

		break;

		case 'start':

			board[item].start();

		break;

		case 'stop':

			board[item].stop();

		break;

		case 'bool':

			board[item] = !board[item];

		break;

		case 'add':

			board[item].push(value);

		break;

		case 'remove':

			board[item].splice(value,1);

		break;

		case 'update':

			board[item] = value;

		break;

		case 'animate':
		case 'hide':
		case 'show':

			if ( overlay ) {

				handle_graphics_button( event , graphics );

			}

		break;
	}
}

function handle_graphics_event ( event , graphics = {}, animate = false){

	action = event.action;
	item = event.item;
	value = event.value;

		// We have up to three arguments; home/away, item, and action

	var board = boards[event.game];

	switch(action){

		case 'animate':

			var vals = Object.keys(graphics);
			for (const graphic of vals) {
				var a = graphics[graphic].getElementsByClassName(item);
				for (i=0,len=a.length;i<len;i++){
					a[i].beginElement();
				}
			}

		break;

		case 'hide':
			if(animate){
				mod_elements_by_class( item + "_hide" , graphics , function( elem ) {
					elem.beginElement();
				});
			}
			else{
				mod_elements_by_class( item , graphics , function( elem ) {
					elem.style.display = 'none';
				});
			}
		break;

		case 'show':
			if(animate){
				mod_elements_by_class( item + "_show" , graphics , function( elem ) {
					elem.beginElement();
				});
			}
			else{
				mod_elements_by_class( item , graphics , function( elem ) {
					elem.style.display = 'inline';
				});
			}
		break;

		case 'updateText':

			mod_elements_by_class( item , graphics , function( elem ) {
				elem.innerText = value;
			});

		break;
	}

}

function update_text ( text , id , graphics = {} ) {

	mod_elements_by_class( id , graphics , function( elem ) {
		
		elem.innerText = text;

	});

}

function update_item_text ( item , board , graphics = {} , text = false , diff = false) {

	// "tbu" stands for "to be updated"
	if (diff == false){tbu = item;}
	else{tbu = diff;}

	mod_elements_by_class( tbu , graphics , function( elem ) {
		if (text == false) {
			elem.innerText = board[item];
		}
		else {
			elem.innerText = text;
		}
	});

}

function update_subitem_text ( item , subitem , board , graphics = {} , text = false , diff = false) {

	// "tbu" stands for "to be updated"
	if (diff == false){tbu = item + "_" + subitem;}
	else{tbu = diff;}

	mod_elements_by_class( tbu , graphics , function( elem ) {
		if (text == false) {
			elem.innerText = board[item][subitem];
		}
		else {
			elem.innerText = text;
		}
	});

}

function update_team ( board , graphics = {} ) {

}

function update_scoreboard ( board , graphics = {} ) {
	for (var prop in board) {
		if (typeof board[prop] == "number" || typeof board[prop] == "string"){
			update_item_text(prop,board,graphics);
		}
	}
}

/*
function push_event_button ( req , res ){

}
*/

function mod_elements_by_class ( item , graphics , callback ) {

	// Callback takes a DOM element as an argument and modifies it

	var vals = Object.keys(graphics);
	for (const graphic of vals) {
		var a = graphics[graphic].getElementsByClassName(item);
		for (i=0,len=a.length;i<len;i++){
			callback(a[i]);
		}
	}

}

function update_timer ( target , source ){
	Object.keys(source).forEach(function each(key){
		if( typeof source[key] == undefined){}
		else{
			target[key] = source[key];
		}
	})
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
	module.exports = {
		handle_graphics_event: handle_graphics_event,
		handle_scoreboard_event: handle_scoreboard_event,
		update_text: update_text,
		update_item_text: update_item_text,
		update_subitem_text: update_subitem_text,
		update_team: update_team,
		update_timer: update_timer
	}
}
else{
    window.handle_scoreboard_event = handle_scoreboard_event;
    window.handle_graphics_event = handle_scoreboard_event;
    window.update_text = update_text;
    window.update_item_text = update_item_text;
    window.update_subitem_text = update_subitem_text;
    window.update_team = update_team;
    window.update_timer = update_timer;
}