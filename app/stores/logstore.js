import Reflux from 'reflux';

var Firebase = require("firebase");
var AnimationStore = require('./animationstore.js');

var FIREBASE_URL = "https://shining-heat-4904.firebaseio.com";
var FIREBASE_AUTH_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ2IjowLCJkIjp7InVpZCI6Im9saXZlci1tYWNhcm9uIn0sImlhdCI6MTQ0MDQ0MDMxOH0.wDebqVW8m17r24mtrlVo_7XFs4uzhwIT4hLimU7NhSo";

var REQUEST_PARTICIPANT_ID = true;

var logActions = Reflux.createActions(
	[
		'log'
	]
);


var logStore = Reflux.createStore({

	listenables: [logActions],

	init: function() {

		this._pid = "test";
		this._animation = "none";
		var interfaceText = "none";

		if (REQUEST_PARTICIPANT_ID)
		{
			this._pid = prompt("Participant ID: ", "");
			if (this._pid == null || this._pid == "") {
				this._pid = "test";
			}

			this._animation = prompt("Animation: ", "");
			if (this._animation == null || this._animation == "") {
				this._animation = "none";
			}

			AnimationStore.actions.setAnimation(this._animation);

			interfaceText = prompt("Interface: ", "");
			if (interfaceText == null || interfaceText == "") {
				interfaceText = "none";
			}
		}
		

	// 		NO_EXAMPLES:0,
	//  LOWVIS_LOWSELECT:1,
	//  HIGHVIS_LOWSELECT:2,
	//  LOWVIS_HIGHSELECT:3,
	// HIGHVIS_HIGHSELECT:4

		this._interface=0;
		if(interfaceText.indexOf("lo") == 0)
		{
			this._interface=1;
		} else if(interfaceText.indexOf("vis") == 0)
		{
			this._interface=2;
		} else if(interfaceText.indexOf("select") == 0)
		{
			this._interface=3;
		} else if(interfaceText.indexOf("hi") == 0)
		{
			this._interface=4;
		} 

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

	getInitialState : function() {
		return {
			currentMode:this._interface
		};

	},

	onLog(txt) {
		this._firebase_log.push({t:Date.now(), value:txt});
	}

});


module.exports  = {
	actions:logActions,
	store:logStore
};