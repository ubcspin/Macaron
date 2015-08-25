import Reflux from 'reflux';

var Firebase = require("firebase");
var AnimationStore = require('./animationstore.js');
var StudyStore = require('./studystore.js');

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

		
		var studyParams = StudyStore.store.getInitialState();
		this._pid = studyParams.participantID;
		this._animation = studyParams.animationMode;
		var interfaceText = studyParams.interfaceText;

		//set up firebase test user data
		var firebase_base = new Firebase(FIREBASE_URL+"/"+this._pid+"/");

		//authenticate firebase
		firebase_base.auth(FIREBASE_AUTH_TOKEN, function(error, result) {
		  if (error) {
		    console.log("Authentication Failed!", error);
		  } else {
		    console.log("Authenticated successfully with payload:", result.auth);
		    console.log("Auth expires at:", new Date(result.expires * 1000));
		  }
		});



		this._firebase_block = firebase_base.push();
		this._firebase_block.set(
			{
				animation:this._animation,
				startTime:Date.now(),
				"interface":interfaceText
			});

		//setup firebase log data
		var block_key = this._firebase_block.key();
		this._firebase_log = new Firebase(FIREBASE_URL+"/"+this._pid+"/"+block_key+"/log/");

	},

	onLog(txt) {
		this._firebase_log.push({t:Date.now(), value:txt});
	}

});


module.exports  = {
	actions:logActions,
	store:logStore
};