class timer {
  // Pass duration in minutes and true to count down, false to count up
  constructor(dur, countdown, callback){
    this.update = callback;
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
  constructor(name, callback){
    this.update = callback;
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
    this.update = callback;
    this.clock = new timer(min,true,this.update);
    this.num = num;
    this.infr = infr;
  }
}

/*
var game = new h_scbd("New",example());
game.add_pen('h',new h_pen(1,4,'bad',example()));
console.log(game);
game.clock.start();
game.home_pen[0].clock.start();
console.log(game);
*/

var time = new h_scbd("new",example);
time.clock.start();

function example(){
  console.log("Here is an update");
}











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