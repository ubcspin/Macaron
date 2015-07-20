import Reflux from 'reflux';

var PlaybackStore = require('./playbackstore.js');


//'enum' for possible draggables
var Draggable = {
	NONE :0,
	PLAYHEAD:1,
	KEYFRAME:2
};


var dragActions = Reflux.createActions(
	[
		'startPlayheadDrag',
		'startKeyframeDrag',

		'handleMoveToTime',

		'stopDrag'
	]

);


var dragStore = Reflux.createStore({

	listenables: [dragActions],

	init() {
		this._dragging = Draggable.NONE;
	},


	onStartPlayheadDrag(newtime) {
		this._dragging = Draggable.PLAYHEAD;
		PlaybackStore.actions.setTime(newtime);
	},

	//calls other actions based on what's being dragged
	onHandleMoveToTime(newtime) {
		if (this._dragging == Draggable.PLAYHEAD)
		{
			PlaybackStore.actions.setTime(newtime);
		}

	},

	onStopDrag() {
		this._dragging = Draggable.NONE;
	}



});


module.exports = {
	actions:dragActions,
	store:dragStore
};