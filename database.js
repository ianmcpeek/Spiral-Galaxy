/*
  Here lies the code that connects to a database to recieve & store data.

*/

var SOCKET = io.connect("http://76.28.150.193:8888");
var data = {studentname: "Ian McPeek", statename: "SpiralState"};

//Before actually sending the data to the database, we want to create the data
//which is opposite of load
var saveGame = function() {
  console.log("saving...");
  //kind of redundant, but hey...
  data.blackHole = gameEngine.blackHole;
  data.gravityMult = gravityMult;
  data.data = [];
  for(var i=0; i < gameEngine.entities.length; i++) {
    var planet = gameEngine.entities[i];
    var pdata = {
      name: planet.planet_name,
      x: planet.x,
      y: planet.y,
      radius: planet.radius,
      mass: planet.mass,
      velocity: {x: planet.velocity.x, y: planet.velocity.y},
      color: planet.color,
    };
    data.data.push(pdata);
  }
  SOCKET.emit("save", data);
  gameEngine.saved = true;
  document.getElementById("loadBtn").disabled = false;
};
//name, game, x, y, radius, mass, velocity, color
var loadGame = function() {
  SOCKET.emit("load", {studentname: data.studentname,
                       statename: data.statename});
};

SOCKET.on("load", function(data) {
  console.log("loading...");
  gameEngine.entities = [];
  gameEngine.blackHole = data.blackHole;
  gravityMult = data.gravityMult;
  if(!data.blackHole) {
    var b = document.getElementById("blackHoleBtn");
    b.innerHTML = "Do Not Press";
    b.className = "btn btn-warning";
  }

  for(var i =0; i < data.data.length; i++) {
    var pdata = data.data[i];
    var planet = new Planet(pdata.name, gameEngine, pdata.x, pdata.y,
      pdata.radius, pdata.mass, pdata.velocity);
    planet.color = pdata.color;
    gameEngine.addEntity(planet);
  }
  /*
  mercury = new Planet("mercury", gameEngine, cx + (au*0.387), cy, 4, 0.055, { x: 0, y: -42.5 });
  mercury.color = 1;
  gameEngine.addEntity(mercury);
  */
});
