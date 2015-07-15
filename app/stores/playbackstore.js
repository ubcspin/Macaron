import Reflux from 'reflux';


var PLAYBACK_RATE = 60; //Hz


var playbackActions = Reflux.createActions(
	[
		'setTime',
		
		'play',
		'pause',
		'togglePlaying',
		'setPlaying',

		'stepBackward',
		'stepForward',

		'toggleMute']

);


var playbackStore = Reflux.createStore({

	listenables: [playbackActions],

	init : function() {
		this._data = {
					playing: false,
					currentTime: 450,
					loop : {
						enabled:false,
						start:0, //ms
						end:0 //ms
					},
					mute:true,
				};

		this._lastTimerTime = Date.now();
		this._updateTimer = null;
	},

	getInitialState : function() {
		return this._data;

	},

	onToggleMute() {
		this._data.mute = !this._data.mute;
		this.trigger(this._data);
	},


	/**
	* Non-play/pause Time Actions
	* 
	*/

	onSetTime(newtime){
		this._data['currentTime'] = newtime;
		this.trigger(this._data);
	},

	onStepBackward() { this.onSetTime(0); },

	onStepForward() {
		//TODO: Need to know VTIcon duration
		// this.onSetTime(VT ICON DURATION HERE);
		console.log("Error: Step Forward not currently implemented.");
	},


	/**
	* Play/Pause Action Functions
	* 
	*/

	onPlay() { this.onSetPlaying(true); },

	onPause() { this.onSetPlaying(false); },

	onTogglePlaying () { this.onSetPlaying(!this._data.playing); },

	onSetPlaying(newplaying) {
		this._data['playing'] = newplaying;
		this.trigger(this._data);

		if(this._data['playing']) {
			this._startUpdateTimer();
		} else {
			this._stopUpdateTimer();
		}
	},


	/**
	* Timer functions for updating playback (when playing, etc.)
	* 
	*/

	_startUpdateTimer() {
		this._lastTimerTime = Date.now()
		this._updateTimer = setInterval(this._updateTimerFunction, 1000.0/PLAYBACK_RATE);
	},

	_updateTimerFunction() {
		var t = Date.now();
		var dt = t - this._lastTimerTime;
		this._lastTimerTime = t;

		//TODO: Check duration
		this._data['currentTime'] = this._data.currentTime+dt;
		this.trigger(this._data);
	},

	_stopUpdateTimer() {
		if (this._updateTimer != null)
		{
			clearInterval(this._updateTimer);
		}
	}




	});




module.exports = {
	actions:playbackActions,
	store:playbackStore
};