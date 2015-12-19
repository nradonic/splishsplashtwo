var numrows = 53;
var numcols =46;
var radius = 10;
var baseX = 10;
var baseY = 10;

var newDropX = 10;
var newDropY = 10;
var myVar;

var splashDelay = 10;
var rippleDelay = 500;
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
var allDirectionTagsOn = [2,2,2,2,2,2];
      
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
    /**
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
	*/
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
	var ledCenterOld = ledsOld[Y][X];
	var ledCenterNext = ledsNext[Y][X];
	var updownRX = updownRight(Y,X);
	var updownLX = updownLeft(Y,X);
	
	var branchR = ledCenterOld.dir[cellr]===2;//1 && ledCenterOld.dir[cellur]===0 && ledCenterOld.dir[celllr]===0;
	var branchLR = ledCenterOld.dir[celllr]===2;//1 && ledCenterOld.dir[cellr]===0 && ledCenterOld.dir[cellll]===0;
	var branchUR = ledCenterOld.dir[cellur]===2;//1 && ledCenterOld.dir[cellr]===0 && ledCenterOld.dir[cellul]===0;
	var branchL = ledCenterOld.dir[celll]===2;//1 && ledCenterOld.dir[cellul]===0 && ledCenterOld.dir[cellll]===0;
	var branchLL = ledCenterOld.dir[cellll]===2;//1 && ledCenterOld.dir[celll]===0 && ledCenterOld.dir[celllr]===0;
	var branchUL = ledCenterOld.dir[cellul]===2;//1 && ledCenterOld.dir[cellur]===0 && ledCenterOld.dir[celll]===0;
	
	// various edge conditions on letting the single 'dir' bit branch decisions
	var branchOnSingle = Y>0 &&	(X>0 || X===0 && evenOdd(Y)===even) && Y<numrows-1 && 
			(X<numcols-1 || X===numcols-1 && evenOdd(Y)===odd) ? 1 : 0;
	
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
	if(ledCenterOld.dir[cellr]!==neighborIsTurnedOff){ 
		if(leftX>=0){
			ledsNext[Y][leftX].dir[cellr]=ledCenterOld.dir[cellr];
		}
		if(branchR){ 
			if(Y>0 && updownLX >= 0){
				var tempDir = ledsNext[upY][updownLX];
				tempDir.dir[celllr]=Math.max(neighborIsTurnedOn,tempDir.dir[celllr]);
			}
			if(Y<numrows-1 && updownLX>=0){
				var tempDir = ledsNext[downY][updownLeft(Y,X)];
				tempDir.dir[cellur]=Math.max(neighborIsTurnedOn,tempDir.dir[cellur]);
			}
		}
	}
	// tag right
	if(ledCenterOld.dir[celll]!==neighborIsTurnedOff){
		if(rightX<numcols){
			ledsNext[Y][rightX].dir[celll]=ledCenterOld.dir[celll];
		}
		if(branchL){ 
			if(upY>=0 && updownRX<numcols){
				var tempDir = ledsNext[upY][updownRX];
				tempDir.dir[cellll]=Math.max(neighborIsTurnedOn,tempDir.dir[cellll]);
			}
			if(downY<numrows && updownRX<numcols){
				var tempDir = ledsNext[downY][updownRX];
				tempDir.dir[cellul]=Math.max(neighborIsTurnedOn,tempDir.dir[cellul]);
			}
		}
	}
	// tag upright
	if(ledCenterOld.dir[cellll]!==neighborIsTurnedOff){ 
		if(upY>=0 && updownRX < numcols){
			ledsNext[upY][updownRX].dir[cellll]=ledCenterOld.dir[cellll];
		}
		if(branchLL){ 
			if(upY>=0 && updownLX>=0){
				var tempDir = ledsNext[upY][updownLX];
				tempDir.dir[celllr]=Math.max(neighborIsTurnedOn,tempDir.dir[celllr]);
			}
			if(rightX<numcols){
				var tempDir = ledsNext[Y][rightX];
				tempDir.dir[celll]=Math.max(neighborIsTurnedOn,tempDir.dir[celll]);
			}
		}
	}
	// tag downright
	if(ledCenterOld.dir[cellul]!==neighborIsTurnedOff){
		if(downY<numrows && updownRX < numcols-1){
			ledsNext[downY][updownRX].dir[cellul]=ledCenterOld.dir[cellul];
		}
		if(branchUL){ 
			if(downY<numrows && updownLX >=0){
				var tempDir = ledsNext[downY][updownLX];
				tempDir.dir[cellur]=Math.max(neighborIsTurnedOn,tempDir.dir[cellur]);
			}
			if(rightX<numcols && branchOnSingle!==0){
				var tempDir = ledsNext[Y][rightX];
				tempDir.dir[celll]=Math.max(neighborIsTurnedOn,tempDir.dir[celll]);
			}
		}
	}
	// tag upleft
	if(ledCenterOld.dir[celllr]!==neighborIsTurnedOff){ 
		if(upY>=0 && updownLX>=0){
			ledsNext[upY][updownLX].dir[celllr]=ledCenterOld.dir[celllr];
		}
		if(branchLR){ 
			if(upY>=0 && updownRX<numcols){
				var tempDir = ledsNext[upY][updownRX];
				tempDir.dir[cellll]=Math.max(neighborIsTurnedOn,tempDir.dir[cellll]);
			}
			if(leftX>=0){
				var tempDir = ledsNext[Y][leftX];
				tempDir.dir[cellr]=Math.max(neighborIsTurnedOn,tempDir.dir[cellr]);
			}
		}
	}
	// tag downleft
	if(ledCenterOld.dir[cellur]!==neighborIsTurnedOff){ 
		if(downY<numrows && updownLX>=0){
			ledsNext[downY][updownLX].dir[cellur]=ledCenterOld.dir[cellur];
		}
		if(branchUR){ 
			if(downY<numrows && updownRX<numcols){
				var tempDir = ledsNext[downY][updownRX];
				tempDir.dir[cellul]=Math.max(neighborIsTurnedOn,tempDir.dir[cellul]);
			}
			if(leftX>=0){
				var tempDir = ledsNext[Y][leftX];
				tempDir.dir[cellr]=Math.max(neighborIsTurnedOn,tempDir.dir[cellr]);
			}
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
					break;
				default:
					ledsNext[nrows][ncols].valL = ledStateOff;
					break;			
			}			
		}
	}
	// clear ledsNext tags
	for (nrows=0; nrows<numrows; nrows++){
		for (ncols=0; ncols<numcols; ncols++){
			clearTags(ledsNext, nrows, ncols);
		}
	}
	// set neighbor change tags
	for (nrows=0; nrows<numrows; nrows++){
		for (ncols=0; ncols<numcols; ncols++){
			//if(ledsNext[nrows][ncols].valL === ledStateJustTurnedOn){
			setNeighborDirection(ledsOld, ledsNext, nrows, ncols);				
			//}
		}
	}
	// propagate the changes look for change tags and turn on those lights
	for (nrows=0; nrows<numrows; nrows++){
		for (ncols=0; ncols<numcols; ncols++){
			if(checkTags(ledsNext, nrows, ncols) > 0){
				ledsNext[nrows][ncols].valL = ledStateJustTurnedOn;
			}
		}
	}
}

var snd = new Audio("droplet.m4a"); // buffers automatically when created
var dropThreshold = 0.9;

// calculate next generation
function nextGen(ledsOld, ledsNext, numrows, numcols){
	calculateRipples(ledsOld, ledsNext);
	if( Math.random()>dropThreshold){
		newDropY = Math.floor(Math.random()*numrows);
		newDropX = Math.floor(Math.random()*numcols);
		ledsNext[newDropY][newDropX].valL = ledStateJustTurnedOn;
		ledsNext[newDropY][newDropX].dir = allDirectionTagsOn;
		snd.play();
	}
/**	if( timeCounter % splashDelay === 5){
		newDropY = 15;//Math.floor(Math.random()*numrows);
		newDropX = 14;//Math.floor(Math.random()*numcols);
		ledsNext[newDropY][newDropX].valL = ledStateJustTurnedOn;
		ledsNext[newDropY][newDropX].dir = allDirectionTagsOn;
	} */
}

// perform timer activity - calculate ripples
function cycle(myVar){
	timeCounter++; // increment time 1 cycle
	nextGen(ledArray, ledArrayTemp, numrows, numcols);
	var ctx = document.getElementById('drawHere').getContext('2d');
	drawHexagons(ctx, ledArray);
//	var ctx2 = document.getElementById('drawHere2').getContext('2d');
//	drawHexagons(ctx2, ledArrayTemp);
	
	
	// swap led arrays....
	ledsTemp = ledArray;
	ledArray = ledArrayTemp;
	ledArrayTemp = ledsTemp;
	document.getElementById("screenDraw").innerHTML=timeCounter.toFixed(0);
}

cycle();
myVar = setInterval(function(){cycle(myVar)},rippleDelay);


