var view = {
  displayMessage: function(msg) {
    var messageArea = document.getElementById("messageArea");
    messageArea.innerHTML = msg;
  },
  displayHit: function(location) {
    var cell = document.getElementById(location);
    cell.setAttribute("class", "hit");
  },
  displayMiss: function(location) {
    var cell = document.getElementById(location);
    cell.setAttribute("class", "miss");
  },
  clearBoard: function(){
    var allCells = document.getElementsByTagName("td");
    for (var i = 0; i < allCells.length; i++ ){
      allCells[i].setAttribute("class", "");
    }
  }
}

var model = {
  boardSize: 7,
  numShips: 3,
  shipLength: 3,
  shipsSunk: 0,

  ships: [
        { locations: [0, 0, 0], hits: ["", "", ""] },
        { locations: [0, 0, 0], hits: ["", "", ""] },
        { locations: [0, 0, 0], hits: ["", "", ""] }
      ],

  fire: function(guess) {
    for(var i = 0; i < this.numShips; i++){
      var ship = this.ships[i];

      locations = ship.locations;
      var index = locations.indexOf(guess);

      if ( index >= 0 ) {
        ship.hits[index] = "hit";

        view.displayHit(guess);
        view.displayMessage("명중!");

        if (this.isSunk(ship)) {
          view.displayMessage("전함이 격침되었습니다.!");
          this.shipsSunk++;
        }
        return true;
      }
    }

    view.displayMiss(guess);
    view.displayMessage("실패하였습니다.");
    return false;
  },

  isSunk: function(ship) {
    for (var i = 0; i < this.shipLength; i++ ) {
      if (ship.hits[i] !== "hit") {
        return false;
      }
    }
    return true;
  },

  generateShipLocations: function() {
    var locations;
    for (var i = 0; i < this.numShips; i++ ){
      do {
        locations = this.generateShip();
      } while (this.collision(locations));
      this.ships[i].locations = locations;
    }
  },

  generateShip: function() {
    var direction = Math.floor(Math.random() * 2);
    var row, col;

    if (direction === 1) {
      row = Math.floor(Math.random() * this.boardSize);
      col = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
    } else {
      row = Math.floor(Math.random() * (this.boardSize - this.shipLength + 1));
      col = Math.floor(Math.random() * this.boardSize);
    }

    var newShipLocations = [];
    for (var i = 0; i < this.shipLength; i++) {
      if (direction === 1) {
        newShipLocations.push(row + "" + (col + i));
      } else {
        newShipLocations.push((row + i) + "" + col);
      }
    }

    return newShipLocations;
  },

  collision: function (locations) {
    for (var i = 0; i < this.numShips; i++) {
      var ship = model.ships[i];
      for (var j = 0; j < locations.length; j++) {
          if (ship.locations.indexOf(locations[j]) >= 0) {
              return true;
          }
      }
    }
    return false;
  }
};

var controller = {
  guesses: 0,
  processGuess: function(location) {
    if (location) {
      this.guesses++;
      var hit = model.fire(location);

      if ( hit && model.shipsSunk === model.numShips ) {
        view.displayMessage("여러분은 " + this.guesses + "번 추측으로 전함을 모두 격침 시켰습니다.");

        removeCellEvent();
      }
    }
  }
}

function removeCellEvent(){
  var allCells = document.getElementsByTagName("td");
  for (var i = 0; i < allCells.length; i++ ){
    allCells[i].onclick = function(e) {
      cell.removeEventListener('click', e);
    }
  }
}

function addCellEvent(){
  var allCells = document.getElementsByTagName("td");
  for (var i = 0; i < allCells.length; i++ ){
    allCells[i].onclick = function(e) {
      var cell = e.target;
      controller.processGuess(cell.id);
    }
  }
}

function restart() {
  removeCellEvent();
  addCellEvent();

  view.clearBoard();
  view.displayMessage("자! 게임을 시작해보지.");

  model.ships = [
        { locations: [0, 0, 0], hits: ["", "", ""] },
        { locations: [0, 0, 0], hits: ["", "", ""] },
        { locations: [0, 0, 0], hits: ["", "", ""] }
      ];
  model.generateShipLocations();
  model.shipsSunk = 0;
  controller.guesses = 0;
}

function init() {
  var restartButton = document.getElementById("restartButton");
  restartButton.onclick = restart;
  addCellEvent();
  model.generateShipLocations();

  try {
    var electron = require('electron');
    var ipc = electron.ipcRenderer;

    var captureButton = document.getElementById("captureButton");
    captureButton.onclick = function () {
      var res = ipc.sendSync('captureSync');
      alert(res);
    };
  } catch (error) {
  }
}

window.onload = init;
