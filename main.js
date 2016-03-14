
/*
  Spiral Galaxy
  written by Ian McPeek
  February 19, 2016
*/

function distance(a, b) {
    var difX = a.x - b.x;
    var difY = a.y - b.y;
    return Math.sqrt(difX * difX + difY * difY);
};

function Planet(name, game, x, y, radius, mass, velocity) {
    this.radius = radius;
    this.planet_name = name;
    this.colors = ["Red", "Tomata", "DarkOrange", "Gold", "Crimson",
              "DarkOrchid", "DarkGoldenRod", "Chartreuse", "Blue", "Salmon", "Black"];
    this.color = 3;
    this.gravity = 0;
    this.mass = mass; //for now mass will replace acceleration
    this.oldDist = {x:x, y:y};
    this.path = [this.oldDist];
    this.peak = y; //used to track height of orbit.
    this.exploded = false;
    //this.radius + Math.random() * (800 - this.radius * 2)
    Entity.call(this, game, x, y);
    this.velocity = velocity;//{ x: 0, y: 0 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    };
}

Planet.prototype = new Entity();
Planet.prototype.constructor = Planet;

Planet.prototype.collideRight = function () {
    return this.x + this.radius > 1600;
};
Planet.prototype.collideLeft = function () {
    return this.x - this.radius < 0;
};
Planet.prototype.collideBottom = function () {
    return this.y + this.radius > 1600;
};
Planet.prototype.collideTop = function () {
    return this.y - this.radius < 0;
};

Planet.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Planet.prototype.explode = function() {
  console.log(this.planet_name + " exploding!");
  if(this.exploded) return;
  var randMass, randRadius, debris;
  for(var i = 0; i < 9; i++) {
    if(this.mass < .05 || this.radius < 1) {
      break;
    }
    //sun = new Planet("sun", gameEngine, cx, cy, 40, 333000, { x: 0, y: 0 });
    randMass = (Math.random() * (this.mass - .05)) + .05;
    randRadius = (Math.random() * (this.radius - 1)) + 1;
    this.mass -= randMass;
    this.radius -= randRadius;

    debris = new Planet(this.planet_name, gameEngine, this.x, this.y, randRadius, randMass, this.velocity);
    debris.exploded = true;
    gameEngine.addEntity(debris);
  }
  this.removeFromWorld = true;
};

Planet.prototype.update = function () {
    Entity.prototype.update.call(this);

    if(gameEngine.blackHole && this.planet_name == "sun" && this.radius < cx) {
      this.radius += 1;
      this.color = 3;
    }

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    //turn off walls
    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x;
    }
    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this != ent && this.collide(ent)) {
          if(this.planet_name != "sun") {
            //this.explode();
          }
            //sun = new Planet("sun", gameEngine, cx, cy, 40, 333000, { x: 0, y: 0 });
            // var temp = this.velocity;
            // this.velocity = ent.velocity;
            // ent.velocity = temp;
            //add in code to apply gravitional formula
        };
    };

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (this != ent && this.planet_name != "sun") {
            var dist = distance(this, ent);
            var difX = (ent.x - this.x) / dist;
            var difY = (ent.y - this.y) / dist;
            this.velocity.x += difX / (dist * dist) * ent.mass * (gravityConstant *gravityMult);
            this.velocity.y += difY / (dist * dist) * ent.mass * (gravityConstant *gravityMult);

            var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
            if (speed > maxSpeed) {
                var ratio = maxSpeed / speed;
                this.velocity.x *= ratio;
                this.velocity.y *= ratio;
            };
        };
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;

    //Debug purposes to find highest peak before expected path was made
    // if(this.peak && this.peak > this.y) {
    //   this.peak = this.y;
    // } else if (this.peak && this.peak < this.y) {
    //   console.log("Highest peak of " + this.planet_name + " at x: " + this.x);
    //   this.peak = null;
    // }

    if(gameEngine.booting && !gameEngine.saved && this.planet_name == "mercury") {
      if(this.collide(mercuryTestRing)) {
        document.getElementById("caliber").innerHTML = "Calibrating the Solar System" + ".".repeat(dot);
        dot = (dot % 3) + 1;
        gravityMult -= 0.1;
        gameEngine.reboot = true;
      } else {
        if(this.peak && this.peak > this.y) {
          this.peak = this.y;
        } else if (this.peak && this.peak < this.y) {
          //console.log("Highest peak of " + this.planet_name + " at x: " + this.x);
          this.peak = null;
          console.log("calibration complete");
          document.getElementById("caliber").innerHTML = "Welcome to Spiral Galaxy!";
          gameEngine.booting = false;
          gameEngine.reboot = true;
        }
      }

    }

}

Planet.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
    Entity.prototype.draw.call(this, ctx);
    if (this.game.showOutlines && this.radius) {
      var dist = {x:this.x, y:this.y};
      if(distance(dist, this.oldDist) > 20) {
        this.path.push(dist);
        this.oldDist = dist;
      }
      if(this.game.showPlanetPath) {
        for (var i = 1; i < this.path.length; i++) {
          ctx.beginPath();
          ctx.strokeStyle = this.colors[this.color];
          ctx.moveTo(this.path[i-1].x,this.path[i-1].y);
          ctx.lineTo(this.path[i].x,this.path[i].y);
          ctx.stroke();
          ctx.closePath();
        }
      }
    }
}

var friction = 1;
//var acceleration = 10000;
var maxSpeed = 2000;

// the "main" code begins here

var ASSET_MANAGER = new AssetManager();
var gameEngine = new GameEngine();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');
    bigBang();
    gameEngine.init(ctx);
    gameEngine.start();
});
//used for vanity to show progress
var dot = 1;
var gravityMult = 2.5;
var gravityConstant = 6674/1000000; //-4
var au = 180;
var cx = 800;
var cy = 800;
var mercuryTestRing = {x:cx, y:cy, radius:(au*0.387) - 8.5};

var rebootSolarSystem = function() {
  gameEngine.entities = [];
  bigBang();
  gameEngine.reboot = false;
  if(!gameEngine.booting) {
    document.getElementById("blackHoleBtn").disabled = false;
    document.getElementById("planetPathBtn").disabled = false;
    document.getElementById("expectedPathBtn").disabled = false;
    document.getElementById("saveBtn").disabled = false;
  }
  //console.log("mercury flew too close to the sun, rebooting with gravity Multiplier " + gravityMult);
}

var blackHoleSun = function() {
  gravityMult = 10000;
  gameEngine.blackHole = true;
}

var bigBang = function() {
  var sun, mercury, venus, earth, moon, jupiter, saturn, neptune, pluto;
  sun = new Planet("sun", gameEngine, cx, cy, 40, 333000, { x: 0, y: 0 });
  sun.color = 0;
  gameEngine.addEntity(sun);

  mercury = new Planet("mercury", gameEngine, cx + (au*0.387), cy, 4, 0.055, { x: 0, y: -42.5 });
  mercury.color = 1;
  gameEngine.addEntity(mercury);

  venus = new Planet("venus",gameEngine, cy, cx - (au*0.732), 8.5, 0.8150, { x: -31.0, y: 0 });
  venus.color = 2;
  gameEngine.addEntity(venus);

  earth = new Planet("earth",gameEngine, cx - (au*1), cy, 10, 1, { x: 0, y: 26.9 });
  earth.color = 3;
  gameEngine.addEntity(earth);
  // moon = new Planet("moon", gameEngine, cx - au, cy, 3, 0.3, { x: 0, y: 26.3 });
  // gameEngine.addEntity(moon);

  mars = new Planet("mars", gameEngine, cy, cx + (au*1.524), 7, 0.107, { x: 21.8, y: 0 });
  mars.color = 4;
  gameEngine.addEntity(mars);

  jupiter = new Planet("jupiter", gameEngine, cx + (au*2), cy, 40, 317.8, { x: 0, y: -19.2 });
  jupiter.color = 5;
  gameEngine.addEntity(jupiter);

  saturn = new Planet("saturn", gameEngine, cy, cx - (au*2.7), 50, 95.1, { x: -16.2, y: 0});
  saturn.color = 6;
  gameEngine.addEntity(saturn);

  uranus = new Planet("uranus", gameEngine, cx - (au*3.2), cy, 30, 14.5, { x: 0, y: 14.9 });
  uranus.color = 7;
  gameEngine.addEntity(uranus);

  neptune = new Planet("neptune", gameEngine, cy, cx + (au*3.7), 28, 17.1, { x: 13.9, y: 0 });
  neptune.color = 8;
  gameEngine.addEntity(neptune);

  pluto = new Planet("pluto", gameEngine, cx + (au*4), cy, 2, 0.00245, { x: 0, y: -13.4 });
  pluto.color = 9;
  gameEngine.addEntity(pluto);

};
