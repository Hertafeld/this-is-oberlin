var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var jsdom = require('jsdom');
var fs = require('fs');
var Canvas = require('canvas');
var document;
var canvas;
var context;
var saveInterval = 60000;
var timer;

fs.readFile(__dirname + "/index.html", 'utf-8', function(err, data){
	if(err) throw err;
	document = jsdom.jsdom(data);
	canvas = new Canvas(document.getElementById("canvas").width, document.getElementById("canvas").height);
	context=canvas.getContext('2d');
	console.log("Created canvas " + canvas.width + " x " + canvas.height);
	loadImage();
});






app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
	res.sendFile(__dirname + "/index.html");
});

io.on('connection', function(socket){
	console.log('A user connected');
	var data = canvas.toDataURL();
	socket.emit('passData', data);
	console.log('Sent canvas data to user');
	socket.on('disconnect', function(){
		console.log('User disconnected');
	});
	socket.on('line', function(line){
		drawLine(line);
		socket.broadcast.emit('line', line);
	});
});

http.listen(3000, function(){
	console.log('Listening on *.3000');
});

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

function loadImage(){
	var file = fs.readFileSync(__dirname + "/public/save/data.png");
	img = new Canvas.Image;
	img.src = file;
	context.drawImage(img, 0, 0, img.width, img.height);
	setInterval(saveImage, saveInterval);

}
function saveImage(){
	var img = canvas.toDataURL();
	var data = img.replace(/^data:image\/\w+;base64,/, "");
	var buffer = new Buffer(data, 'base64');
	fs.writeFile(__dirname + "/public/save/data.png", buffer);
	console.log("Saved canvas data");
}