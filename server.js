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
var rendered_path;

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

    socket.on('path', function(path){
        var unscaled_points = [];
        var scaled_points = [];

        var values = path.split(',');

        console.log(parseFloat(values[10].split('L')[0]));
        for (var i=10; i<values.length; i++) {
            var value = parseFloat(values[i].split('L')[0]);
            // if (value > max) {
            //     max = value;
            // }
            // if (value < min) {
            //     min = value;
            // }
            unscaled_points.push(value);
        }
        // console.log(unscaled_points);
        var min = 0;  // may need to change these for scaling factor
        var max = 50; //
        var span = max - min;

        for (var i=0; i < unscaled_points.length; i++) {
            var p = ((unscaled_points[i] - min) / span) * 180;
            scaled_points.push(p);
        }
        rendered_path = scaled_points;
        console.log(scaled_points);
    });
	socket.on('render', function(){
        render();
		console.log('Loading points.');
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

function render() {
    for(var i=0;i<rendered_path.length;i++) {
        doSetTimeout(i);
    }
}
function doSetTimeout(i) {
    setTimeout(function(){
        myServo.to(rendered_path[i]);
        console.log('Moving servo to ' + rendered_path[i]);
    },50 * i);
}
