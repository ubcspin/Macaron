import Reflux from 'reflux';

var PlaybackStore = require('./playbackstore.js');


var animationActions = Reflux.createActions(
	[
		'setAnimation'
	]
);


//animations


//HEARTBEAT ANIMATION
var hbSmallSize = 0.75; //0-1
var hbLargeSize = 1;
var hbBeatTime = 110; //ms
var hbInterBeatTime = 1200; //ms
var nBeats = 2;
var Heartbeat = {
	size: {}
};
for (var i = 0; i < nBeats; i++) 
{
	Heartbeat.size[hbInterBeatTime/2 + i*hbInterBeatTime] = hbSmallSize;
	Heartbeat.size[hbInterBeatTime/2 + i*hbInterBeatTime + hbBeatTime] = hbLargeSize;
	Heartbeat.size[hbInterBeatTime/2 + i*hbInterBeatTime + 2*hbBeatTime] = hbSmallSize;
	Heartbeat.size[hbInterBeatTime/2 + i*hbInterBeatTime + 3*hbBeatTime] = hbSmallSize;
	Heartbeat.size[hbInterBeatTime/2 + i*hbInterBeatTime + 4*hbBeatTime] = hbLargeSize;
	Heartbeat.size[hbInterBeatTime/2 + i*hbInterBeatTime + 5*hbBeatTime] = hbSmallSize;

}


//Mobile  ANIMATION
var mobileSmallSize = 0.8;
var mobileBigSize = 1;
var nVibrations = 9;
var vibrationStart = 500;
var vibrationEnd = 2500;
var vibrationDuration = (vibrationEnd-vibrationStart)/nVibrations;
var vibrationRotation = 20;
var Mobile = {
	size: {
		0: mobileSmallSize,
		400:mobileSmallSize,
		600:mobileBigSize,
		2400:mobileBigSize,
		2600:mobileSmallSize
	},

	rotation: {}
}
Mobile.rotation[vibrationStart] = 0;
var rotationSign = 1;
for (var i = 1; i < nVibrations; i++)
{
	rotationSign *= -1;
	Mobile.rotation[vibrationStart+i*vibrationDuration] = rotationSign*vibrationRotation;
}
Mobile.rotation[vibrationEnd] = 0;





var BouncingBall = {
	position: {
		0: 0,
		3000: 100
	}
};


var Animations = {
	'none' : {},
	'heartbeat': Heartbeat,
	'mobile': Mobile
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