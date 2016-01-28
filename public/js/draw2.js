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
var isLoading = false;
var isSaving = false;
var saveWaiting = false;
var loadWaiting = false;
var pickerCanvas;
var timer;
var lastClick;
var idleDelay = 2000;

function setPen(){

	resetIdleTime();
	//Screen(true);
	eraser = false;
	document.getElementById("colorShower").style.opacity=1.0;
	document.getElementById("colorShower").style.backgroundColor=currentColor;

}

function setEraser(){
	resetIdleTime();
	//loadScreen(true);
	eraser = true;
	document.getElementById("colorShower").style.opacity=.5;
	document.getElementById("colorShower").style.backgroundColor="#AAAAAA";
}

function clearScreen(){
	context.clearRect(0,0,canvas.width, canvas.height);
}

$('#canvas').mousedown(function(e){
	resetIdleTime();
	//loadScreen(false);
	penDown = true;
	oldX = e.offsetX+1;
	oldY = e.offsetY;
});

$('#canvas').mousemove(function(e){
	makeLine(e);
});

$('#canvas').mouseleave(function(e){
	if(penDown) saveScreen();
	penDown = false;
});

$('#canvas').mouseup(function(e){
	resetIdleTime();
	if(penDown){
		makeLine(e);
		//saveScreen();
	 }
	penDown = false;
});

function resetIdleTime(){
	lastClick = new Date();
}
function makeLine(e){
	context.lineJoin="round";
	context.strokeStyle=currentColor;
	if (penDown){
		if(eraser){
			context.globalCompositeOperation = "destination-out";
			context.lineWidth = eraserWidth;
			context.beginPath();
			context.moveTo(oldX, oldY);
			context.lineTo(e.offsetX, e.offsetY);
			context.closePath();
			context.stroke();
			context.globalCompositeOperation = "source-over";

		}
		else{
			context.lineWidth = penWidth;
			context.beginPath();
			context.moveTo(oldX, oldY);
			context.lineTo(e.offsetX, e.offsetY);
			context.closePath();
			context.stroke();		

		}
	}
	oldX = e.offsetX;
	oldY = e.offsetY;
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

function loadTime(){
	if (!penDown && !isHidden()){
		var now = new Date();
		if(now - lastClick > idleDelay){
			//alert("idle");
			//loadScreen(true);
			resetIdleTime();
		}
	}
}
function saveScreen(){
	var imageData = canvas.toDataURL();
	var blankData = document.getElementById('blank').toDataURL();
	if(!isSaving && imageData != blankData){
		while(isLoading);
		isSaving=true;
		$.post("php/saveDrawing.php", {data: imageData}, function(result){
        	isSaving=false;
    	});
    }
}

function loadScreen(doClear){
	if(!isLoading && !isSaving){
		isLoading=true;
		$.get("php/upload.txt", function(data){
			if(doClear) loadHelperClear(data);
			else loadHelper(data);
			isLoading=false;
		});
	}
}

function loadHelper(imageData){
	var imageObj = new Image();
	imageObj.onload = function() {
		//context.clearRect(0,0,canvas.width, canvas.height);
		context.drawImage(this, 0, 0);
		canSave=true;
	};
	imageObj.src = imageData;
}

function loadHelperClear(imageData){
	var imageObj = new Image();
	imageObj.onload = function() {
		context.clearRect(0,0,canvas.width, canvas.height);
		context.drawImage(this, 0, 0);
		canSave=true;
	};
	imageObj.src = imageData;
}


$(document).ready(function(){
   //loadScreen(false);
   context.imageSmoothingEnabled = false;
   context.lineJoin = "round";
   
   var img = document.getElementById('colorBar');
   pickerCanvas = document.createElement('canvas');
   pickerCanvas.width = img.width;
   pickerCanvas.height = img.height;
   pickerCanvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
   
   timer = setInterval(loadTime, 4000);
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