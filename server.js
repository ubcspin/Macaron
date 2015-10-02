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
	console.log('a user connected');

	//User disconnects
	// socket.on('disconnect', function(){
	// 	console.log('user disconnected');
	// });

	//Full servo motion
	// socket.on('sweep', function(){
    //     	io.emit('server_message', 'started arduino sweep');
    //     	servo_start();
	// 	console.log('start arduino sweep');
	// });

	// Go to a specific degree
	// socket.on('to_degrees', function(deg) {
	// 	var degrees = parseInt(deg);
	// 	myServo.to(degrees);
	// 	console.log('moving servo to ' + degrees + 'degrees');
	// });

	// Stop all motion
	// socket.on('stop', function() {
	// 	myServo.stop();
	// 	console.log('stopping servo');
	// });
});

// board = new five.Board();
// var myServo;
// board.on("ready", function() {
// 	myServo = new five.Servo({
// 		pin:9,
// 		center:true,
// 		range: [20,160]
// 	});
// 	board.repl.inject({
// 		servo: myServo
// 	});
// 	io.emit('server_message','ready to start board');
//     	console.log('sweep away, my captain');
// });
