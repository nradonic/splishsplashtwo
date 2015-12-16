var numrows = 9;
var numcols = 30;
var radius = 30;
var baseX = 10;
var baseY = 10;

var newDropX = 10;
var newDropY = 10;
var myVar;

var splashDelay = 4;
var rippleDelay = 500;
var timeCounter = 0;

var ledStateOff = 0;
var ledStateStale = 1;
var ledStateJustTurnedOn = 2;

        // right on even columns, left on odd
        //0    x x         2 1
        //1   x x x       3 0 0
        //2    x x         4 5
        
function left1(X){return X-1;}
function right1(X){return X+1;}
function updownLeft(Y,X){
	if(Y%2===0){return X;}
	else{return X-1;}
}
function updownRight(Y,X){
	if(Y%2===0){return X+1;}
	else {return X;}
}

// data array for LEDs - note even rows are drawn right offset by half a cell
initial = function(){
	var temp = {valL : 0, dir : [0,0,0,0,0,0]}; // dir={cellr=0, cellur=1, cellul=2, celll=3, cellll=4, celllr=5}
	return temp;
}
var cellr=0;
var cellur=1;
var cellul=2;
var celll=3;
var cellll=4;
var celllr=5;
var neighborTurnedOn = 1;
var neighborTurnedOff = 0;

// extension to Array type for 2D, with initialization - from Douglas Crockford
Array.matrix = function(numrows, numcols, initial){
   var arr = [];
   for (var i = 0; i < numrows; ++i){
      var columns = [];
      for (var j = 0; j < numcols; ++j){
         columns[j] = initial();
      }
      arr[i] = columns;
    }
    return arr;
};

var ledArray = Array.matrix(numrows,numcols, initial); // create the data matrix, fill with zeros
var ledArrayTemp = Array.matrix(numrows,numcols, initial); // create the data matrix, fill with zeros
var ledsTemp;

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
    c2.moveTo(radiusSin60 + xOffset0, radiusCos60 + yOffset0);
    c2.lineTo(xOffset0, radius0 + yOffset0);
    c2.lineTo(-radiusSin60 + xOffset0, radiusCos60 + yOffset0);
    c2.lineTo(-radiusSin60 + xOffset0, -radiusCos60 + yOffset0);
    c2.lineTo(xOffset0, -radius0 + yOffset0);
    c2.lineTo(radiusSin60 + xOffset0, -radiusCos60 + yOffset0);

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

function drawHexagons(ctx, leds){
	var printIt = document.getElementById("printIt");

	var r3 = Math.sqrt(3) / 2;
	var yStep = 3 * radius;
	var xStep = r3 * radius;
	var toggle = 1.5 * radius;

	
	for (var row = 0; row < numrows; row += 1) {
   	  for (var col = 0; col < numcols; col += 1) {
        var xPos = col * xStep + baseX;
        var yPos = row * yStep + baseY;
        // right on even columns, left on odd
        //0    x x
        //1   x x x
        //2    x x
        var toggle2 = toggle * ((1+col) % 2);
        drawHex(ctx, radius, xPos, yPos + toggle2, leds[row][col].valL===0?black:green);
        // printIt.innerHTML = " " + radius + " " + xStep + " " + yStep + " " + row + " " + col+ " " + toggle2 + " " + toggle + " ";
    	}
	}
}

// clear tags
function clearTags(leds, Y,X){
	leds[Y][X].dir = [0,0,0,0,0,0];
}

// check is any tags are active - returns nonzero for activity
function checkTags(leds, Y, X){
	var activity = 0;
	for (i=0;i<6;i++){
		activity += leds[Y][X].dir[i];
	}
	return activity;
}

// turn on the direction tags to show where activity is coming from ...
function setNeighborDirection(leds, Y,X){
	// tag left
	if(X>0){
		leds[Y][X-1].dir[cellr]=neighborTurnedOn;
	}
	// tag right
	if(X<numcols-1){
		leds[Y][X+1].dir[celll]=neighborTurnedOn;
	}
	// tag upright
	if(Y>0 && X<numcols-1){
		leds[Y-1][updownRight(Y,X)].dir[cellll]=neighborTurnedOn;
	}
	// tag downright
	if(Y<numrows-1 && X<numcols-1){
		leds[Y+1][updownRight(Y,X)].dir[cellul]=neighborTurnedOn;
	}
	// tag upleft
	if(Y>0 && X>0){
		leds[Y-1][updownLeft(Y,X)].dir[celllr]=neighborTurnedOn;
	}
	// tag downleft
	if(Y<numrows-1 && X<numcols-1){
		leds[Y+1][updownLeft(Y,X)].dir[cellur]=neighborTurnedOn;
	}
}

// propagate changes to next generation
function calculateRipples(ledsOld, ledsNext){
	for (nrows=0; nrows<numrows; nrows++){
		for (ncols=0; ncols<numcols; ncols++){
			if(ledsOld[nrows][ncols].valL === ledStateOff){
				ledsNext[nrows][ncols].valL = ledStateOff;
			}
			if(ledsOld[nrows][ncols].valL === ledStateJustTurnedOn){
				ledsNext[nrows][ncols].valL = ledStateStale;
			}
			if(ledsOld[nrows][ncols].valL === ledStateStale){
				ledsNext[nrows][ncols].valL = ledStateOff;
			}
		}
	}
	for (nrows=0; nrows<numrows; nrows++){
		for (ncols=0; ncols<numcols; ncols++){
			if(checkTags(ledsOld, nrows, ncols) > 0) {
				ledsNext[nrows][ncols].valL = ledStateJustTurnedOn;
				clearTags(ledsNext, nrows, ncols);
				clearTags(ledsOld, nrows, ncols);
				
			}
		}
	}
}


// calculate next generation
function nextGen(ledsOld, ledsNext, numrows, numcols){
	calculateRipples(ledsOld, ledsNext);
	
	if( timeCounter % splashDelay === 0){
		newDropY = 4;//Math.floor(Math.random()*numrows);
		newDropX = 4;//Math.floor(Math.random()*numcols);
		ledsNext[newDropY][newDropX].valL = ledStateJustTurnedOn;
		setNeighborDirection(ledsNext, newDropY, newDropX);
	}
}

// perform timer activity - calculate ripples
function cycle(myVar){
	timeCounter++; // increment time 1 cycle
	nextGen(ledArray, ledArrayTemp, numrows, numcols);
	var ctx = document.getElementById('drawHere').getContext('2d');
	drawHexagons(ctx, ledArray);
	var ctx2 = document.getElementById('drawHere2').getContext('2d');
	drawHexagons(ctx2, ledArrayTemp);
	
	
	// swap led arrays....
	ledsTemp = ledArray;
	ledArray = ledArrayTemp;
	ledArrayTemp = ledsTemp;
}

cycle();
myVar = setInterval(function(){cycle(myVar)},rippleDelay);


