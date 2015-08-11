import Reflux from 'reflux';

var PlaybackStore = require('./playbackstore.js');


var animationActions = Reflux.createActions(
	[
		'setAnimation'
	]
);


//animations
var Heartbeat = {
	size: {
		500:0.5,
		600:1,
		700:0.5,

		800:0.5,
		900:1,
		1000:0.5,

		2000:0.5,
		2100:1,
		2200:0.5,

		2300:0.5,
		2400:1,
		2500:0.5
	}
};


var Animations = {
	'none' : {},
	'heartbeat': Heartbeat
};




//animation store

var animationStore = Reflux.createStore({

	listenables:[animationActions],

	init : function() {
		this._data = {
			animation:"none",
			animationParameters:{},
			animationOptions:Object.keys(Animations)
		},

		this.listenTo(PlaybackStore.store, this._PlaybackUpdate);
		this._currentTime = 0;


	},

	_PlaybackUpdate: function(playback) {
		this._currentTime = playback.currentTime;
		this._update();
	},

	getInitialState: function() {
		return this._data;
	},

	_update: function () {
		this._data.animationParameters = this._SampleParameters(this._currentTime);
		this.trigger(this._data);
	},

	onSetAnimation(animation) {
		if (animation in Animations) {
			this._data.animation = animation;
			this._update();
		};
	},

	_SampleParameters(t) {
		var rv = {};
		if (this._data.animation in Animations) {
			//sample each of the parameters for the animation
			for (var p in Animations[this._data.animation]) {
				rv[p] = this._SampleInDictionary(Animations[this._data.animation][p], t);
			}
		}
		return rv;
	},

	_SampleInDictionary(d, t)
	{
		//get adjacent keyframes	
		var prevT = -1;
		var nextT = -1;
		for (var tstamp in d)
		{
			if (tstamp <= t)
			{
				if (prevT === -1 || (t-tstamp) < (t-prevT)) {
					prevT = tstamp;
				}
			}

			if (tstamp >= t)
			{
				if (nextT === -1 || (tstamp-t) < (nextT-t)) {
					nextT = tstamp;
				}
			}
		}

		//interpolate
		var rv = -1;
		if (prevT === -1 && nextT === -1)
		{
			console.log("ERROR! No keyframes in keyframe dictionary.");
		} else if (prevT === -1) {
			rv = d[nextT];
		} else if (nextT === -1) {
			rv = d[prevT];
		} else {
			//linear interpolation for now
			if (prevT == nextT)
			{
				rv = d[prevT];
			} else {
				rv = d[prevT] + (t-prevT) / (nextT-prevT) * (d[nextT]-d[prevT]);		
			}
		}


		return rv;
	}

});


module.exports = {
	actions:animationActions,
	store:animationStore
};