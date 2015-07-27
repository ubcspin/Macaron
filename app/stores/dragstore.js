import Reflux from 'reflux';

var PlaybackStore = require('./playbackstore.js');
var ScaleStore = require('./scalestore.js');
var VTIconStore = require('./vticonstore.js');
var SelectionStore = require('./selectionstore.js');


//'enum' for possible draggables
var Draggable = {
	NONE :0,
	PLAYHEAD:1,
	KEYFRAME:2,
	SELECT:3
};


var dragActions = Reflux.createActions(
	[
		'startPlayheadDrag',
		'startKeyframeDrag',
		'startSelectDrag',

		'handleMouseMove',

		'stopDrag'
	]

);


var dragStore = Reflux.createStore({

	listenables: [dragActions],

	init() {
		this.listenTo(ScaleStore.store, this._ScaleUpdate);

		this._dragging = Draggable.NONE;
		this._lastMouseMove = {};
	},

	_ScaleUpdate(scales) {
		this._scales = scales;
	},


	onStartPlayheadDrag(newtime) {
		this._dragging = Draggable.PLAYHEAD;
		PlaybackStore.actions.setTime(newtime);
	},

	onStartKeyframeDrag() {
		this._dragging = Draggable.KEYFRAME;
	},

	onStartSelectDrag() {
		this._dragging = Draggable.SELECT;
		SelectionStore.actions.startSelecting(this._scales.scaleTimeline.invert(this._lastX), this._calculateSelectionParameterMap(this._lastY)); 
	},

	onHandleMouseMove(x, y) {		
		if (this._dragging == Draggable.PLAYHEAD)
		{
			PlaybackStore.actions.setTime(this._scales.scaleTimeline.invert(x));
		} else if (this._dragging == Draggable.KEYFRAME) {
			var dt = this._scales.scaleTimeline.invert(x) - this._scales.scaleTimeline.invert(this._lastX);
			var dv = {};
			for (var p in this._scales.scaleParameter) {
				dv[p] = this._scales.scaleParameter[p].invert(y) - this._scales.scaleParameter[p].invert(this._lastY);
			}
			VTIconStore.actions.moveSelectedKeyframes(dt, dv);
		} else if (this._dragging == Draggable.SELECT) {
				SelectionStore.actions.changeSelecting(this._scales.scaleTimeline.invert(x), this._calculateSelectionParameterMap(y)); 

		}
		this._lastX = x;
		this._lastY = y;

	},

	onStopDrag() {
		if(this._dragging == Draggable.SELECT)
		{
			SelectionStore.actions.stopSelecting();
		}
		this._dragging = Draggable.NONE;
	},

	/**
	 * Helper Functions
	 */
	 _calculateSelectionParameterMap(y) {
	 	var pmap = {};

	 	for (var p in this._scales.topOffsetParameter) {
	 		pmap[p] = this._scales.scaleParameter[p].invert(y-this._scales.topOffsetParameter[p]);
	 	}

	 	return pmap;

	 }



});


module.exports = {
	actions:dragActions,
	store:dragStore
};