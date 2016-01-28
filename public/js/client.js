var socket = io();

var canvas = document.getElementById('canvas');
var context = canvas.getContext("2d");
var penDown = false;
var eraser = false;
var penWidth = 5;
var eraserWidth = 35;
var currentColor = "$FF0000";
var oldX = 0;
var oldY = 0;
var pickerCanvas;
var timer;
var lastClick;
var idleDelay = 2000;

socket.on('line', function(line){
	drawLine(line);
});
socket.on('passData', function(data){
	//context.putImageData(0, 0, data);
	loadScreen(data);
});

function loadScreen(imageData){
	var imageObj = new Image();
	imageObj.onload = function() {
		//context.clearRect(0,0,canvas.width, canvas.height);
		context.drawImage(this, 0, 0);
	};
	imageObj.src = imageData;
}

function setPen(){

	resetIdleTime();
	eraser = false;
	document.getElementById("colorShower").style.opacity=1.0;
	document.getElementById("colorShower").style.backgroundColor=currentColor;

}

function setEraser(){
	resetIdleTime();
	eraser = true;
	document.getElementById("colorShower").style.opacity=.5;
	document.getElementById("colorShower").style.backgroundColor="#AAAAAA";
}

function clearScreen(){
	context.clearRect(0,0,canvas.width, canvas.height);
}

$('#canvas').mousedown(function(e){
	resetIdleTime();
	penDown = true;
	oldX = e.offsetX+1;
	oldY = e.offsetY;
});

$('#canvas').mousemove(function(e){
	if(penDown) makeLine(e);
});

$('#canvas').mouseleave(function(e){
	penDown = false;
});

$('#canvas').mouseup(function(e){
	resetIdleTime();
	if(penDown){
		makeLine(e);
	 }
	penDown = false;
});

function resetIdleTime(){
	lastClick = new Date();
}
function makeLine(e){
	var line = {};
	line.x0 = oldX;
	line.y0 = oldY;
	line.x1 = e.offsetX;
	line.y1 = e.offsetY;
	line.color = currentColor;
	oldX = e.offsetX;
	oldY = e.offsetY;
	if (!eraser){
		line.operation = "source-over";
		line.width = penWidth;
	}
	else{
		line.operation = "destination-out";
		line.width = eraserWidth;
	}
	socket.emit('line', line);
	drawLine(line);

}

function drawLine(line){
	context.save();
	context.strokeStyle=line.color;
	context.globalCompositeOperation = line.operation;
	context.lineWidth = line.width;
	context.beginPath();
	context.moveTo(line.x0, line.y0);
	context.lineTo(line.x1, line.y1);
	context.closePath();
	context.stroke();
	context.restore();
}

function pickColor(e){
	var pixelData = pickerCanvas.getContext('2d').getImageData(e.offsetX-2, e.offsetY, 1, 1).data;
	currentColor = "rgb(" + pixelData[0] + "," + pixelData[1] + "," + pixelData[2] + ")";
	document.getElementById("colorShower").style.backgroundColor=currentColor;
	setPen();
	return false;
}
function setRed(){
	setPen();
	currentColor = "#FF0000";
}
function setBlue(){
	setPen();
	currentColor = "#0000FF";
}
function setGreen(){
	setPen();
	currentColor = "#00FF00";
}
function setYellow(){
	setPen();
	currentColor = "#FFFF00";
}
function setPurple(){
	setPen();
	currentColor = "#FF00FF";
}
function setBlack(){
	setPen();
	currentColor = "#000000";
	document.getElementById("colorShower").style.backgroundColor=currentColor;

}
function setWhite(){
	setPen();
	currentColor = "#FFFFFF";
	document.getElementById("colorShower").style.backgroundColor=currentColor;

}


$(document).ready(function(){
   context.imageSmoothingEnabled = false;
   context.lineJoin = "round";
   
   var img = document.getElementById('colorBar');
   pickerCanvas = document.createElement('canvas');
   pickerCanvas.width = img.width;
   pickerCanvas.height = img.height;
   pickerCanvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
   
   lastClick = new Date();

});

window.onbeforeunload = function() {
	//saveScreen();
};

function getHiddenProp(){
    var prefixes = ['webkit','moz','ms','o'];
    
    // if 'hidden' is natively supported just return it
    if ('hidden' in document) return 'hidden';
    
    // otherwise loop over all the known prefixes until we find one
    for (var i = 0; i < prefixes.length; i++){
        if ((prefixes[i] + 'Hidden') in document) 
            return prefixes[i] + 'Hidden';
    }

    // otherwise it's not supported
    return null;
}
function isHidden() {
    var prop = getHiddenProp();
    if (!prop) return false;
    
    return document[prop];
}