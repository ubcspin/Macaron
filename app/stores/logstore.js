import Reflux from 'reflux';

var Firebase = require("firebase");
var AnimationStore = require('./animationstore.js'); //TODO: Delete this
var StudyStore = require('./studystore.js');

var FIREBASE_URL = "https://shining-heat-4904.firebaseio.com";

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
		this._interfaceText = studyParams.interfaceText;
		this._firebase_log = null;
		this._authenticating = false;

		this._authenticate();

	},

	_authenticate() {
		//set up firebase test user data
		// var firebase_base = new Firebase(FIREBASE_URL+"/"+this._pid+"/");
		var firebase_ref = new Firebase(FIREBASE_URL);

		var logstore = this;

		firebase_ref.authWithOAuthPopup("github", function(error, authData) {
		  if (error) {
		    console.log("Login Failed!", error);
		  } else {
		    console.log("Authenticated successfully with payload:", authData);
		    var firebase_base = new Firebase(FIREBASE_URL+"/"+authData.uid+"/");
			logstore._firebase_block = firebase_base.push();
			logstore._firebase_block.set(
				{
					animation:logstore._animation,
					startTime:Date.now(),
					"interface":logstore._interfaceText
				});

			//setup firebase log data
			var block_key = logstore._firebase_block.key();
			logstore._firebase_log = new Firebase(FIREBASE_URL+"/"+authData.uid+"/"+block_key+"/log/");
		  }
		  logstore._authenticating = false;
		});


	},

	onLog(txt) {
		if (this._firebase_log != null)
		{
			this._firebase_log.push({t:Date.now(), value:txt});
		} else if (!this._authenticating) {
			this._authenticating = true;
			this._authenticate();
		}
	}

});


module.exports  = {
	actions:logActions,
	store:logStore
};