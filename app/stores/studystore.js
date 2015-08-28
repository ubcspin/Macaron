import Reflux from 'reflux';

var REQUEST_PARTICIPANT_ID = true;

var DisplayModes = {
	NO_EXAMPLES:0,
	 LOWVIS_LOWSELECT:1,
	 HIGHVIS_LOWSELECT:2,
	 LOWVIS_HIGHSELECT:3,
	HIGHVIS_HIGHSELECT:4
};

var studyActions = Reflux.createActions(
	[
		'setDisplayMode'
	]
);

var studyStore = Reflux.createStore({

	listenables:[studyActions],

	init: function() {


		var pid = "test";
		var animationMode = "none";
		var interfaceText = "none";

		if (REQUEST_PARTICIPANT_ID)
		{
			pid = prompt("Participant ID: ", "");
			if (pid == null || pid == "") {
				pid = "test";
			}

			animationMode = prompt("Animation: ", "");
			if (animationMode == null || animationMode == "") {
				animationMode = "none";
			}

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

		var currentMode=0;
		if(interfaceText.indexOf("lo") == 0)
		{
			currentMode=1;
		} else if(interfaceText.indexOf("vis") == 0)
		{
			currentMode=2;
		} else if(interfaceText.indexOf("select") == 0)
		{
			currentMode=3;
		} else if(interfaceText.indexOf("hi") == 0)
		{
			currentMode=4;
		} 

		this._data = {
			participantID:pid,
			currentMode:currentMode,
			interfaceText:interfaceText,
			animationMode:animationMode,
			modes:DisplayModes
		};
	},

	getInitialState() {
		return this._data;
	},

	onSetDisplayMode(displayMode) {
		// console.log("displayMode", displayMode);
		if (displayMode in DisplayModes)
		{
			this._data.currentMode = displayMode;
			this.trigger(this._data);
		}
	}

});


module.exports = {
	store: studyStore,
	actions:studyActions
};
