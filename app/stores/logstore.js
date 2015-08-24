import Reflux from 'reflux';

var Firebase = require("firebase");

var FIREBASE_URL = "https://shining-heat-4904.firebaseio.com";
var FIREBASE_AUTH_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjowLCJkIjp7InVpZCI6Im9saXZlci1tYWNhcm9uIn0sImlhdCI6MTQ0MDQ0MDMxOH0.wDebqVW8m17r24mtrlVo_7XFs4uzhwIT4hLimU7NhSo";


var logActions = Reflux.createActions(
	[
		'log'
	]
);


var logStore = Reflux.createStore({

	listenables: [logActions],

	init: function() {

		//set up firebase test user data
		this._firebase_user = new Firebase(FIREBASE_URL+"/test/user");
		this._firebase_user.set("alakazam");

		//authenticate firebase
		this._firebase_user.auth(FIREBASE_AUTH_TOKEN, function(error, result) {
		  if (error) {
		    console.log("Authentication Failed!", error);
		  } else {
		    console.log("Authenticated successfully with payload:", result.auth);
		    console.log("Auth expires at:", new Date(result.expires * 1000));
		  }
		});

		//setup firebase log data
		this._firebase_log = new Firebase(FIREBASE_URL+"/test/log");

	},

	onLog(txt) {
		this._firebase_log.push({t:Date.now(), value:txt});
	}

});


module.exports  = {
	actions:logActions,
	store:logStore
};