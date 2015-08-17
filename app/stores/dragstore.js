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
		this._targetName = "";
	},

	_ScaleUpdate(scales) {
		this._scales = scales;
	},


	onStartPlayheadDrag(name, newtime) {
		this._targetName = name;
		this._dragging = Draggable.PLAYHEAD;
		PlaybackStore.actions.setTime(newtime);
	},

	onStartKeyframeDrag(name) {
		this._targetName = name;
		VTIconStore.actions.startMovingSelectedKeyframes(name=this._targetName);
		this._dragging = Draggable.KEYFRAME;
	},

	onStartSelectDrag(name, addmode=false) {
		this._targetName = name;
		this._dragging = Draggable.SELECT;
		var unoffsetX = this._lastX - this._scales[this._targetName].leftOffset;
		SelectionStore.actions.startSelecting(name, this._scales[this._targetName].scaleTimeline.invert(unoffsetX), this._calculateSelectionParameterMap(this._lastY), addmode); 
	},

	onHandleMouseMove(x, y) {
	 	if (this._targetName in this._scales) {

	 		var unoffsetX = x - this._scales[this._targetName].leftOffset;
			if (this._dragging == Draggable.PLAYHEAD)
			{
				PlaybackStore.actions.setTime(this._scales[this._targetName].scaleTimeline.invert(unoffsetX));
			} else if (this._dragging == Draggable.KEYFRAME) {
		 		var unoffsetLastX = this._lastX - this._scales[this._targetName].leftOffset;

				var dt = this._scales[this._targetName].scaleTimeline.invert(unoffsetX) - this._scales[this._targetName].scaleTimeline.invert(unoffsetLastX);
				var dv = {};
				for (var p in this._scales[this._targetName].scaleParameter) {
					dv[p] = this._scales[this._targetName].scaleParameter[p].invert(y) - this._scales[this._targetName].scaleParameter[p].invert(this._lastY);
				}
				VTIconStore.actions.moveSelectedKeyframes(dt, dv, name=this._targetName);
			} else if (this._dragging == Draggable.SELECT) {
					SelectionStore.actions.changeSelecting(this._scales[this._targetName].scaleTimeline.invert(unoffsetX), this._calculateSelectionParameterMap(y)); 

			}

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
		this._targetName="";
	},

	/**
	 * Helper Functions
	 */
	 _calculateSelectionParameterMap(y) {
	 	var pmap = {};

	 	for (var p in this._scales[this._targetName].topOffsetParameter) {
	 		pmap[p] = this._scales[this._targetName].scaleParameter[p].invert(y-this._scales[this._targetName].topOffsetParameter[p]);
	 	}

	 	return pmap;

	 }



});


module.exports = {
	actions:dragActions,
	store:dragStore
};