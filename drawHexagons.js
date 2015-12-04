var numrows = 50;
var numcols = 27;
var radius = 10;
var baseX = 10;
var baseY = 10;

var newDropX = 10;
var newDropY = 10;
var myVar;

var splashDelay = 500;

// extension to Array type for 2D, with initialization - from Douglas Crockford
Array.matrix = function(numrows, numcols, initial){
   var arr = [];
   for (var i = 0; i < numrows; ++i){
      var columns = [];
      for (var j = 0; j < numcols; ++j){
         columns[j] = initial;
      }
      arr[i] = columns;
    }
    return arr;
};

// data array for LEDs - note odd rows are drawn right offset by half a cell
var ledArray = Array.matrix(numrows,numcols, 0); // create the data matrix, fill with zeros

function drawHex(c2, radius, xOffset0, yOffset0, color) {

    c2.fillStyle = color;
		var radius0 = radius - 1;
    var radiusCos30 = radius0 * Math.sqrt(3) / 2;
    var radiusSin30 = radius0 * 0.5;
    var radiusCos60 = radiusSin30;
    var radiusSin60 = radiusCos30;

    c2.lineWidth = 2;
    c2.strokeStyle = "#000000";

    c2.beginPath();
    c2.moveTo(radiusCos60 + xOffset0, radiusSin60 + yOffset0);
    c2.lineTo(-radiusCos60 + xOffset0, radiusSin60 + yOffset0);
    c2.lineTo(-radius0 + xOffset0, yOffset0);
    c2.lineTo(-radiusCos60 + xOffset0, -radiusSin60 + yOffset0);
    c2.lineTo(radiusCos60 + xOffset0, -radiusSin60 + yOffset0);
    c2.lineTo(radius0 + xOffset0, yOffset0);

    c2.closePath();
    c2.stroke();
    c2.fill();
}

// color constants
var green = "#00FF00";
var black = "#000000";
	
function getRandomColor(){
	if( Math.floor(Math.random() * 1.1 ) === 1) {return green;}
	else {return black;} 
}

function drawHexagons(){
	var ctx = document.getElementById('drawHere').getContext('2d');
	var printIt = document.getElementById("printIt");

	var r3 = Math.sqrt(3) / 2;
	var yStep = r3 * radius;
	var xStep = 3 * radius;
	var toggle = 1.5 * radius;

	
	for (var row = 0; row < numrows; row += 1) {
   	  for (var col = 0; col < numcols; col += 1) {
        var xPos = col * xStep + baseX;
        var yPos = row * yStep + baseY;
        var toggle2 = toggle * (row % 2);
        drawHex(ctx, radius, xPos + toggle2, yPos, ledArray[row][col]===0?black:green);
        // printIt.innerHTML = " " + radius + " " + xStep + " " + yStep + " " + row + " " + col+ " " + toggle2 + " " + toggle + " ";
    	}
	}
}

// perform timer activity - calculate ripples
function cycle(myVar){
	newDropY = Math.floor(Math.random()*numrows);
	newDropX = Math.floor(Math.random()*numcols);
	ledArray[newDropY][newDropX] = 1;
	drawHexagons();
	
}

drawHexagons();
myVar = setInterval(function(){cycle(myVar)},splashDelay);


