var numrows = 25;
var numcols = 25;
var radius = 20;
var baseX = 10;
var baseY = 10;

var newDropX = 10;
var newDropY = 10;
var myVar;

var splashDelay = 10;
var rippleDelay = 1000;
var timeCounter = 0;

var ledStateOff = 0;
var ledStateStale = 1;
var ledStateJustTurnedOn = 2;

        // right on even columns, left on odd
        //0    x x         2 1
        //1   x x x       3 0 0
        //2    x x         4 5
var cellr=0;
var cellur=1;
var cellul=2;
var celll=3;
var cellll=4;
var celllr=5;
var neighborIsTurnedOn = 1;
var neighborIsTurnedOff = 0;
var allDirectionTagsOn = [1,1,1,1,1,1];
      
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

function drawHex(c2, radius, xOffset0, yOffset0, color, dir) {

    c2.fillStyle = color;
    // radius0  is 1 pixel smaller than radius value - buffer for line
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
    // draw direction arrows
    c2.beginPath();
    c2.strokeStyle = "#FF0000";
	if(dir[cellr]!=0){
	    c2.moveTo(radiusCos30 + xOffset0, yOffset0);
	    c2.lineTo(xOffset0, yOffset0);
	}
	if(dir[cellur]!=0){
	    c2.moveTo(radiusCos60 + xOffset0, -radiusSin60 + yOffset0);
	    c2.lineTo(xOffset0, yOffset0);
	}
	if(dir[cellul]!=0){
	    c2.moveTo(-radiusCos60 + xOffset0, -radiusSin60 + yOffset0);
	    c2.lineTo(xOffset0, yOffset0);
	}
	if(dir[celll]!=0){
	    c2.moveTo(-radiusCos30 + xOffset0, yOffset0);
	    c2.lineTo(xOffset0, yOffset0);
	}
	if(dir[cellll]!=0){
	   c2.moveTo(-radiusCos60 + xOffset0, radiusSin60 + yOffset0);
	   c2.lineTo(xOffset0, yOffset0);
	}
	if(dir[celllr]!=0){
	    c2.moveTo(radiusCos60 + xOffset0, radiusSin60 + yOffset0);
	    c2.lineTo(xOffset0, yOffset0);
	}
	c2.closePath();
	c2.stroke();
}

// color constants
var green = "#00FF00";
var yellow = "#C0C000";
var black = "#808080";
	
function getRandomColor(){
	if( Math.floor(Math.random() * 1.1 ) === 1) {return green;}
	else {return black;} 
}

// Even returns 0, Odd returns 1
function evenOdd(x){return x%2;}
var even = 0;
var odd = 1;

function drawHexagons(ctx, leds){
	var printIt = document.getElementById("printIt");

	var r3 = Math.sqrt(3);
	var yStep = 1.5 * radius;
	var xStep = r3 * radius;
	var toggle = r3/2 * radius;

	
	for (var row = 0; row < numrows; row += 1) {
   	  for (var col = 0; col < numcols; col += 1) {
        var toggleX = ((row+1) % 2) * toggle;
        var xPos = col * xStep + baseX + toggleX;
        var yPos = row * yStep + baseY;
        var ledColor = black;
        switch (leds[row][col].valL){
          	case ledStateOff: 
          					ledColor = black;
          					break;
            case ledStateStale: 
            				ledColor = yellow;
            				break;
            case ledStateJustTurnedOn:
            				ledColor = green;
            				break;
        }
        drawHex(ctx, radius, xPos, yPos, ledColor, leds[row][col].dir);
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
function setNeighborDirection(ledsOld, ledsNext, Y,X){
	var leftX = X-1;
	var rightX = X+1;
	var upY = Y-1;
	var downY = Y+1;
	var ledCenter = ledsOld[Y][X];
	var updownRX = updownRight(Y,X);
	var updownLX = updownLeft(Y,X);
	
	
/**
DIR Bit	Displacement	Bits to set
		
R	L,LL,UL		R,UR,LR
UR	LL,L,LR		UR,R,UL
UL	LR,LL,R		UL,UR,L
L	R,UR,LR		L,LL,UL
LL	UR,UL,R		LL,LR,L
LR	UL,UR,L		LR,LL,R
*/	
	// tag left
	if(ledCenter.dir[cellr]===neighborIsTurnedOn){ 
		if(leftX>=0){
			ledsNext[Y][leftX].dir[cellr]=neighborIsTurnedOn;
		}
		if(Y>0 && updownLX >= 0){
			ledsNext[upY][updownLX].dir[celllr]=neighborIsTurnedOn;
		}
		if(Y<numrows-1 && updownLX>=0){
			ledsNext[downY][updownLeft(Y,X)].dir[cellur]=neighborIsTurnedOn;
		}
	}
	// tag right
	if(ledCenter.dir[celll]===neighborIsTurnedOn){
		if(rightX<numcols){
			ledsNext[Y][rightX].dir[celll]=neighborIsTurnedOn;
		}
		if(upY>=0 && updownRX<numcols){
			ledsNext[upY][updownRX].dir[cellll]=neighborIsTurnedOn;
		}
		if(downY<numrows && updownRX<numcols){
			ledsNext[downY][updownRX].dir[cellul]=neighborIsTurnedOn;
		}
	}
	// tag upright
	if(ledCenter.dir[cellll]===neighborIsTurnedOn){ 
		if(upY>=0 && updownRX < numcols){
			ledsNext[upY][updownRX].dir[cellll]=neighborIsTurnedOn;
		}
		if(upY>=0 && updownLX>=0){
				ledsNext[upY][updownLX].dir[celllr]=neighborIsTurnedOn;
		}
		if(rightX<numcols){
			ledsNext[Y][rightX].dir[celll]=neighborIsTurnedOn;
		}
	}
	// tag downright
	if(ledCenter.dir[cellul]===neighborIsTurnedOn){
		if(downY<numrows && updownRX < numcols-1){
			ledsNext[downY][updownRX].dir[cellul]=neighborIsTurnedOn;
		}
		if(downY<numrows && updownLX > 0){
			ledsNext[downY][updownLX].dir[cellur]=neighborIsTurnedOn;
		}
		if(rightX<numcols){
			ledsNext[Y][rightX].dir[celll]=neighborIsTurnedOn;
		}		
	}
	// tag upleft
	if(ledCenter.dir[celllr]===neighborIsTurnedOn){ 
		if(upY>=0 && updownLX>=0){
			ledsNext[upY][updownLX].dir[celllr]=neighborIsTurnedOn;
		}
		if(upY>=0 && updownRX<numcols){
			ledsNext[upY][updownRX].dir[cellll]=neighborIsTurnedOn;
		}
		if(leftX>=0){
			ledsNext[Y][leftX].dir[cellr]=neighborIsTurnedOn;
		}
	}
	// tag downleft
	if(ledCenter.dir[cellur]===neighborIsTurnedOn){ 
		if(downY<numrows && updownLX>0){
			ledsNext[downY][updownLX].dir[cellur]=neighborIsTurnedOn;
		}
		if(downY<numrows && updownRX<numcols){
			ledsNext[downY][updownRX].dir[cellul]=neighborIsTurnedOn;
		}
		if(leftX>=0){
			ledsNext[Y][leftX].dir[cellr]=neighborIsTurnedOn;
		}
	}
}

// propagate changes to next generation
function calculateRipples(ledsOld, ledsNext){
	// age light states
	for (nrows=0; nrows<numrows; nrows++){
		for (ncols=0; ncols<numcols; ncols++){
			switch(ledsOld[nrows][ncols].valL){
				case ledStateOff: 
					ledsNext[nrows][ncols].valL = ledStateOff;
					break;
				case ledStateStale: 
					ledsNext[nrows][ncols].valL = ledStateOff;
					break;
				case ledStateJustTurnedOn: 
					ledsNext[nrows][ncols].valL = ledStateStale;
					clearTags(ledsOld, nrows, ncols);				
					break;
				default:
					ledsNext[nrows][ncols].valL = ledStateOff;
					break;			
			}

			
		}
	}
	// propagate the changes look for change tags and turn on those lights
	for (nrows=0; nrows<numrows; nrows++){
		for (ncols=0; ncols<numcols; ncols++){
			if(checkTags(ledsOld, nrows, ncols) > 0){
				ledsNext[nrows][ncols].valL = ledStateJustTurnedOn;
			}
		}
	}
	// set neighbor change tags
	for (nrows=0; nrows<numrows; nrows++){
		for (ncols=0; ncols<numcols; ncols++){
			if(ledsNext[nrows][ncols].valL === ledStateJustTurnedOn){
				setNeighborDirection(ledsOld, ledsNext, nrows, ncols);				
			}
		}
	}
	// set neighbor change tags
	for (nrows=0; nrows<numrows; nrows++){
		for (ncols=0; ncols<numcols; ncols++){
			if(ledsNext[nrows][ncols].valL === ledStateStale){
				clearTags(ledsNext, nrows, ncols);				
			}
		}
	}

}


// calculate next generation
function nextGen(ledsOld, ledsNext, numrows, numcols){
	calculateRipples(ledsOld, ledsNext);
	
	if( timeCounter % splashDelay === 0){
		newDropY = Math.floor(Math.random()*numrows);
		newDropX = Math.floor(Math.random()*numcols);
		ledsNext[newDropY][newDropX].valL = ledStateJustTurnedOn;
		ledsNext[newDropY][newDropX].dir = allDirectionTagsOn;
		ledsOld[newDropY][newDropX].dir = allDirectionTagsOn;
		setNeighborDirection(ledsOld, ledsNext, newDropY, newDropX);
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


