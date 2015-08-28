import Reflux from 'reflux';

var VTIconStore = require('./vticonstore.js');
var LogStore = require('./logstore.js');

var PLAYBACK_RATE = 60; //Hz

var STEP_AMOUNT = 100; //ms


var playbackActions = Reflux.createActions(
	[
		'setTime',
		
		'play',
		'pause',
		'togglePlaying',
		'setPlaying',

		'stepBackward',
		'stepForward',
		'skipBackward',
		'skipForward',

		'toggleMute']

);


var playbackStore = Reflux.createStore({

	listenables: [playbackActions],

	init : function() {
		this._data = {
					playing: false,
					currentTime: 0,
					playingIcon:"main",
					loop : {
						enabled:false,
						start:0, //ms
						end:0 //ms
					},
					mute:true,
				};

		this._lastTimerTime = Date.now();
		this._updateTimer = null;
		this.listenTo(VTIconStore.store, this._VTIconUpdate);
		this._VTIconUpdate(VTIconStore.store.getInitialState());
	},

	_VTIconUpdate(vticons) {
		for(var n in vticons)
		{
			if (vticons[n].selected)
			{
				this._vtduration = vticons[n].duration;
				this._data.playingIcon = n;
			}
		}
	},

	getInitialState : function() {
		return this._data;

	},

	onToggleMute() {
		this._data.mute = !this._data.mute;
		LogStore.actions.log("PLAYBACK_MUTE_"+this._data.mute);
		this.trigger(this._data);
	},


	/**
	* Non-play/pause Time Actions
	* 
	*/

	onSetTime(newtime){
		if (newtime < 0) {
			newtime = 0;
		}

		if (newtime > this._vtduration) {
			newtime = this._vtduration;
		}

		this._data['currentTime'] = newtime;
		this.trigger(this._data);
	},

	onStepBackward() { this.onSetTime(this._data.currentTime-STEP_AMOUNT); },

	onStepForward() {this.onSetTime(this._data.currentTime+STEP_AMOUNT);},



	onSkipBackward() { this.onSetTime(0); },

	onSkipForward() {this.onSetTime(this._vtduration);},


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

		LogStore.actions.log("PLAYBACK_SETPLAY_"+newplaying);

		if(this._data['playing']) {
			if (this._data.currentTime >= this._vtduration)
			{
				this._data.currentTime = 0;
			}
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
		if (this._data['currentTime'] > this._vtduration)
		{
			this._data['currentTime'] = this._vtduration;
			this._data.playing = false;
			this._stopUpdateTimer();
			LogStore.actions.log("PLAYBACK_PLAYEND");

		}
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