var numrows = 5;
var numcols = 5;

// extension to Array type for 2D, with initialization - from Douglas Crockford
Array.matrix = function(numrows, numcols, initial){
   var arr = [];
   for (var i = 0; i < numrows; ++i){
      var columns = [];
      for (var j = 0; j < numcols; ++j){
         columns[j] = {dist:0, dist2:0};
      }
      arr[i] = columns;
    }
    return arr;
};

// data array for LEDs - note odd rows are drawn right offset by half a cell
var ledArray = Array.matrix(numrows,numcols,0); // create the data matrix, fill with zeros

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


function drawHexagons(){
	var ctx = document.getElementById('drawHere').getContext('2d');
	var printIt = document.getElementById("printIt");
	var radius = 50;
	var r3 = Math.sqrt(3) / 2;
	var yStep = r3 * radius;
	var xStep = 3 * radius;
	var toggle = 1.5 * radius;
	var color = "#FF0000";
		
	for (var i = 0; i < numrows; i += 1) {
   	  for (var j = 0; j < numcols; j += 1) {
        var xPos = i * xStep + 100;
        var yPos = j * yStep + 100;
        var toggle2 = toggle * (j % 2);
        drawHex(ctx, radius, xPos + toggle2, yPos, color);
        printIt.innerHTML = " " + radius + " " + xStep + " " + yStep + " " + i + " " + j + " " + toggle2 + " " + toggle + " ";
    	}
	}
}

drawHexagons();