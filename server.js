//------------------------------------------------------------------------------
// Requires
//------------------------------------------------------------------------------
var express = require('express');
var app = express();
var five = require("johnny-five");
var fs = require('fs');
var path = require('path');

//------------------------------------------------------------------------------
// Globals
//------------------------------------------------------------------------------
var board, myServo;

//------------------------------------------------------------------------------
// Server setup
//------------------------------------------------------------------------------


app.use("/css", express.static(__dirname + '/css'));
app.use("/build", express.static(__dirname + '/build'));
app.use("/dist", express.static(__dirname + '/dist'));
app.use("/thirdparty", express.static(__dirname + '/thirdparty'));
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/build/index.html');
});
var server = app.listen(8080, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

//------------------------------------------------------------------------------
// Socket setup
//------------------------------------------------------------------------------
var io = require('socket.io')(server);

//------------------------------------------------------------------------------
// Socket functions (connect to index.html)
//------------------------------------------------------------------------------
io.on('connection', function(socket){
	console.log('User connected.');

	//User disconnects
	socket.on('disconnect', function(){
		console.log('User disconnected.');
	});

	// Test servo motion
	socket.on('test', function(){
        	io.emit('server_message', 'Started arduino sweep.');
        	myServo.to(0);
		console.log('Arduino test.');
	});

    // Move to degree
    socket.on('degree', function(degree){
            var d = parseInt(degree);
        	io.emit('server_message', 'Moving to degree ' + degree + ".");
        	myServo.to(d);
		console.log('Moving to degree ' + degree + ".");
	});

});

board = new five.Board();
var myServo;
board.on("ready", function() {
	myServo = new five.Servo({
		pin:9,
		center:true,
		range: [0,180]
	});
	board.repl.inject({
		servo: myServo
	});
	io.emit('server_message','Ready to start board.');
    	console.log('Sweep away, my captain.');
});
