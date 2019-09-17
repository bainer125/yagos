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
			if (this.elap >= (dur * 60 * 1000)-100){
				this.stop();
				this.done = true;
			}

			if (this.pause){
				return true;
			}

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

	}
	set ms(x){
		this._ms = x;
		this.update();
		//update_display(this.min,this.sec);
	}
	get ms(){
		return this._ms;
	}
}

// Define all classes used for a hockey
// scoreboard

class h_scbd {
	constructor(name,callback){
		this.update = callback || function(){};
		this.name = name;
		this.period = 1;
		this.clock = new timer(20, true, this.update);
		this.home_score = 0;
		this.away_score = 0;
		this.home_shots = 0;
		this.away_shots = 0;
		this.home_pen = [];
		this.away_pen = [];
		this.home_to = false;
		this.away_to = false;
		this.home_en = false;
		this.away_en = false;

		this.add_pen = function (team, pen){
			if (team=='h'){
				this.home_pen.push(pen);
			}
			else if (team=='a'){
				this.away_pen.push(pen);
			}
		}

		this.del_pen = function (){
			var new_home_pen = [];
			var new_away_pen = [];
			//console.log(this.home_pen);
			this.home_pen.forEach(function(item,index){
				if (item.clock.done==false){
					//console.log(item);
					new_home_pen.push(item);
				}
			})
			this.away_pen.forEach(function(item,index){
				if (item.clock.done==false){
					new_away_pen.push(item);
				}
			})
			this.home_pen=new_home_pen;
			//console.log(new_home_pen);
			this.away_pen=new_away_pen;
		}

		var that = this;

	    setInterval(function(){
	      	that.del_pen();
	    },1000);
	}
}

class h_pen {
	constructor(min,num,infr,callback){
		this.update = callback || function(){};
		this.clock = new timer(min,true,this.update);
		this.num = num;
		this.infr = infr;
	}
}



// Define all classes used for a baseball
// scoreboard

class base_scbd {
	constructor(name){
		this.name = name;
		this.inn = 1;
		this.tb = 0; //0 is top, 1 is bottom
		this.home_runs = 0;
		this.away_runs = 0;
		this.home_hits = 0;
		this.away_hits = 0;
		this.home_err = 0;
		this.away_err = 0;
		
		// 0 denotes no runner on base, 1
		// means runner on base
		this.first = 0;
		this.second = 0;
		this.third = 0;

		this.strikes = 0;
		this.balls = 0;
		this.outs = 0;
	}
}

// Define all classes used for a soccer
// scoreboard

class s_scbd {
	constructor(name){
		this.name = name;
		this.half = "1st";
		this.clock = new timer(45, false);
		this.stoppage = new timer(5,false);
		this.home_score = 0;
		this.away_score = 0;
		this.home_shots = 0;
		this.away_shots = 0;
		this.home_on_target = 0;
		this.away_on_target = 0;
		this.home_corners = 0;
		this.away_corners = 0;
		this.home_book = [];
		this.away_book = [];

		this.add_card = function (team, card, time){
			if (team=='h'){
				this.home_card.push(card);
			}
			else if (team=='a'){
				this.away_card.push(card);
			}
		}
	}
}

class s_book {
	constructor(card,num,time){
		if (card == "r"){
			this.card = 'Red';
		}
		else{
			this.card = "Yellow";
		}
		this.num = num;
		this.time = time;
	}
}

module.exports = {
  timer: timer,
  s_scbd: s_scbd,
  s_book: s_book,
  h_scbd: h_scbd,
  h_pen: h_pen,
  base_scbd: base_scbd
}