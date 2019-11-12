/*

	Classes to be used universally (client and server side)

	Last rev: 10/28/19

	Authors: Liam McBain

	YAGOS

*/

// Timer objects

class timer {
	// Pass duration in minutes and true to count down, false to count up
	constructor(dur, countdown, callback){
		this.update = callback || function(){};
		this.dur = dur;
		this.countdown = countdown || true;
		this.min = dur;
		this.sec = 0;
		this._ms = 0;
		this.prev = new Date().getTime();
		this.elap = 0;
		this.total = dur*60000;
		this.pause = true;
		this.done = false;
		this.start = function(){
			this.pause = false;
			this.prev = new Date().getTime();
			this.count();
		}
		this.stop = function(){
			this.pause = true;
		}
		this.count = function(){
			if (this.elap >= (this.total)-100){
				this.stop();
				this.done = true;
			}
			else{
				this.done = false;
			}

			if (this.pause){
				return true;
			}

			//this.elap = this.total - (this.min*60000 + this.sec*1000 + this.ms*1000);

			var now = new Date().getTime();
			// diff will be in units 'ms'
			var diff = (now - this.prev);
			this.prev = now;

			this.elap = this.elap + diff;

			if (this.countdown){
				this.min = Math.floor((this.total - this.elap)/60000);
				this.sec = Math.floor((this.total - this.elap)/1000) - 60*this.min;
				this.ms = Math.floor((this.total - this.elap)/100)%10;
			}
			else{
				this.min = Math.floor(this.elap/60000);
				this.sec = Math.floor(this.elap/1000) - 60*this.min;
				this.ms = Math.floor(this.elap/100)%10;
			}


			// NEED TO UPDATE TIMER TO NOT GO NEGATIVE

			var that = this;
			setTimeout(function() {
    			that.count();
  			}, 100);

  			// For debugging purposes
  			//console.log(`${this.min}:${this.sec}:${this.ms}`);
		}
		this.updateclock = function(){
			if (this.countdown){
				this.min = Math.floor((this.total - this.elap)/60000);
				this.sec = Math.floor((this.total - this.elap)/1000) - 60*this.min;
				this.ms = Math.floor((this.total - this.elap)/100)%10;
			}
			else{
				this.min = Math.floor(this.elap/60000);
				this.sec = Math.floor(this.elap/1000) - 60*this.min;
				this.ms = Math.floor(this.elap/100)%10;
			}
		}

	}
	set ms(x){
		this._ms = x;
		this.update();
	}
	get ms(){
		return this._ms;
	}
}


/*

Nomenclature for variable names in classes:

Variables will be a one-word, lowercase
indicator

If the variable is specific to a home or away
team, it will be preceded by either "home" or
"away" followed by "_".

*/

class penalty_timer {

	constructor( minutes , starttime , number , infraction ){

		// Pass the elapsed time of the main clock into 'starttime'
		this.initial = starttime;

		// Amount of ms needed to pass before time is over
		this.finish = minutes * 60000;
		this.number = number;
		this.infraction = infraction;

	}
}

class Scoreboard {

	constructor ( id , mode, callback ){

		this.id = id;

		this.mode = mode;


		// Sets function to be called for any type that
		// requires external update (timers, etc.)

		this.update = callback || function(){};

		this.clock = new timer( 20 , true , this.update );


		// Specific player info for non-team sports

		this.player1Info = {};
		this.player2Info = {};


		// Team info for team sports

		this.home_teamInfo = {};
		this.away_teamInfo = {};


		// Roster for team sports

		this.home_teamRoster = {};
		this.away_teamRoster = {};

		this.home_score = 0;
		this.away_score = 0;

		this.home_shots = 0;
		this.away_shots = 0;

		this.home_shotsOnGoal = 0;
		this.away_shotsOnGoal = 0;

		this.home_penalties = [];
		this.away_penalties = [];

		this.home_timeout = false;
		this.away_timeout = false;


		// Hockey specific variables

		this.period = 1;
		
		this.home_emptyNet = false;
		this.away_emptyNet = false;

		this.home_delayedPenalty = false;
		this.away_delayedPenalty = false;


		var that = this;

		// Delete penalties from arrays

		this.delete_penalties = function (){

			var new_home_pen = [];
			var new_away_pen = [];

			this.home_penalties.forEach(function(item,index){

				if (item.initial + item.finish > that.clock.elap+1000){
					new_home_pen.push(item);
				}

			})

			this.away_penalties.forEach(function(item,index){

				if (item.initial + item.finish > that.clock.elap+1000){
					new_away_pen.push(item);
				}

			})

			this.home_penalties=new_home_pen;
			this.away_penalties=new_away_pen;
		}

		// Soccer specific variables

		this.stoppagetime = new timer ( 5 , false , this.update)

		this.home_bookings = [];
		this.away_bookings = [];

		// American football specific variables

		this.home_timeoutsRemaining = 3;
		this.away_timeoutsRemaining = 3;

		this.flag = false;

		// Basketball specific variables

		this.home_bonus = false;
		this.away_bonus = false;

		// Baseball specific variables

		this.inning = 1;
		this.bottom = false;

		this.first = false;
		this.second = false;
		this.third = false;

		this.strikes = 0;
		this.balls = 0;
		this.outs = 0;

		this.home_pitches = 0;
		this.away_pitches = 0;

		this.home_hits = 0;
		this.away_hits = 0;

		this.home_errors = 0;
		this.away_errors = 0;




		// All functions that should be run every second
		// after scoreboard construction

	    setInterval( function() {

	      	that.delete_penalties();

	    }, 1000 );

	}

}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined'){
	module.exports = {
		timer: timer,
		penalty_timer: penalty_timer,
		Scoreboard: Scoreboard
	}
}
else{
    window.timer = timer;
    window.penalty_timer = penalty_timer;
    window.Scoreboard = Scoreboard;
}