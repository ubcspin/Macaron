import Reflux from 'reflux';

var Firebase = require("firebase");

var FIREBASE_URL = "https://shining-heat-4904.firebaseio.com";


var logActions = Reflux.createActions(
	[
		'log'
	]
);


var logStore = Reflux.createStore({

	listenables: [logActions],

	init: function() {

		this._firebase_user = new Firebase(FIREBASE_URL+"/test/user");
		this._firebase_user.set("foobar");

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