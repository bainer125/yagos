function handle_scoreboard_button ( event , mode , boards , graphics = {}){
	
	args = event.button.split("_");

		// We have up to three arguments; home/away, item, and action

	var board = boards[event.game];

	switch(args[args.length-1]){

		case 'up':

			if (args.length < 3){
				board[args[0]]++;
			}
			else { board[args[0]+"_"+args[1]]++; }

		break;

		case 'down':

			if (args.length < 3){
				board[args[0]]--;
			}
			else { board[args[0]+"_"+args[1]]--; }

		break;

		case 'start':

			if (args.length < 3){
				board[args[0]].start();
			}
			else { board[args[0]+"_"+args[1]].start(); }

		break;

		case 'stop':

			if (args.length < 3){
				board[args[0]].stop();
			}
			else { board[args[0]+"_"+args[1]].stop(); }

		break;

		case 'bool':

			if (args.length < 3){
				board[args[0]]=!board[args[0]];
			}
			else { board[args[0]+"_"+args[1]]=!board[args[0]+"_"+args[1]]; }

		break;

		case 'animate':
		case 'hide':
		case 'show':

			handle_graphics_button( event , mode , graphics );

		break;
	}
}

function handle_graphics_button ( event , mode , graphics = {}, animate = false){

	args = event.button.split("_");

		// We have up to three arguments; home/away, item, and action

	var board = boards[event.game];

	switch(args[args.length-1]){

		case 'animate':

			var vals = Object.keys(graphics);
			for (const graphic of vals) {
				var a = graphics[graphic].getElementsByClassName(event.button);
				for (i=0,len=a.length;i<len;i++){
					a[i].beginElement();
				}
			}

		break;

		case 'hide':
			if(animate){
				var vals = Object.keys(graphics);
				for (const graphic of vals) {
					var a = graphics[graphic].getElementsByClassName(event.button);
					for (i=0,len=a.length;i<len;i++){
						a[i].beginElement();
					}
				}
			}
			else{
				var vals = Object.keys(graphics);
				for (const graphic of vals) {
					var a = graphics[graphic].getElementsByClassName(args.slice(0,-1).join('_'));
					for (i=0,len=a.length;i<len;i++){
						a[i].style.display="none";
					}
				}
			}
		break;

		case 'show':
			if(animate){
				var vals = Object.keys(graphics);
				for (const graphic of vals) {
					var a = graphics[graphic].getElementsByClassName(event.button);
					for (i=0,len=a.length;i<len;i++){
						a[i].beginElement();
					}
				}
			}
			else{
				var vals = Object.keys(graphics);
				for (const graphic of vals) {
					var a = graphics[graphic].getElementsByClassName(args.slice(0,-1).join('_'));
					for (i=0,len=a.length;i<len;i++){
						a[i].style.display="inline";
					}
				}
			}
		break;
	}

}

/*
function push_event_button ( req , res ){

}
*/