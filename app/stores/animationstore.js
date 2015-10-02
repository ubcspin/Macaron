import Reflux from 'reflux';

var PlaybackStore = require('./playbackstore.js');
var StudyStore = require('./studystore.js');

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



//Cat  ANIMATION
var CAT_PAUSE_TIME = 150;
var CAT_BREATHE_IN_TIME = 650;
var CAT_BREATHE_OUT_TIME = 350;
var CAT_START_VALUE = 1;
var CAT_BREATHE_VALUE = 1.25;
var Cat = {
	size: {},
	t: {
		0:0,
		3000:3000
	}
};
Cat.size[0] = CAT_START_VALUE;
Cat.size[CAT_PAUSE_TIME] = CAT_START_VALUE;
Cat.size[CAT_PAUSE_TIME+CAT_BREATHE_IN_TIME] = CAT_BREATHE_VALUE;
Cat.size[2*CAT_PAUSE_TIME+CAT_BREATHE_IN_TIME] = CAT_BREATHE_VALUE;
Cat.size[2*CAT_PAUSE_TIME+CAT_BREATHE_IN_TIME+CAT_BREATHE_OUT_TIME] = CAT_START_VALUE;
Cat.size[4*CAT_PAUSE_TIME+CAT_BREATHE_IN_TIME+CAT_BREATHE_OUT_TIME] = CAT_START_VALUE;
Cat.size[4*CAT_PAUSE_TIME+2*CAT_BREATHE_IN_TIME+CAT_BREATHE_OUT_TIME] = CAT_BREATHE_VALUE;
Cat.size[5*CAT_PAUSE_TIME+2*CAT_BREATHE_IN_TIME+CAT_BREATHE_OUT_TIME] = CAT_BREATHE_VALUE;
Cat.size[5*CAT_PAUSE_TIME+2*CAT_BREATHE_IN_TIME+2*CAT_BREATHE_OUT_TIME] = CAT_START_VALUE;



var Lightning = {
	right: {
		0:0,
		800:0,
		950:1,
		1100:0,
		1200:1,
		1350:0,
		1800:0,
		1900:1,
		2100:1,
		2200:0
	},
	left: {
		0:0,
		400:0,
		650:1,
		900:0,
		1500:0,
		1600:1,
		1650:1,
		1800:0,
		1850:0,
		1950:1,
		2050:0,
		2300:0,
		2500:1,
		2700:0
	}

};

var Snow = {
	flake1: {
		0:0,
		2000:1
	},

	flake2: {
		650:0,
		2650:1
	},

	flake3: {
		1000:0,
		3000:1
	}

};


var Car = {
	t: {
		0:0,
		3000:3000
	},

	rotation: {
		700:0,
		950:-30,
		1750:0,
		1900:0,
		2200:30,
		2700:0
	}
};

var Bit = {};


var BouncingBall = {
	position: {
		0: 0,
		3000: 100
	}
};


var Animations = {
	'none' : {},
	'heartbeat': Heartbeat,
	'mobile': Mobile,
	'cat':Cat,
	'car':Car,
	'lightning':Lightning,
	'snow': Snow,
	'bit':Bit
};



//animation store

var animationStore = Reflux.createStore({

	listenables:[animationActions],

	init : function() {

		var initialAnimation = StudyStore.store.getInitialState().animationMode;
		this._data = {
			animation:initialAnimation,
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