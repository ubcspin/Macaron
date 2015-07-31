import Reflux from 'reflux';

var vticonActions = Reflux.createActions(
	[
		'newKeyframe',
		'newMultipleKeyframes',

		'selectKeyframe',
		'selectKeyframes',
		'addSelectedKeyframe',
		'addSelectedKeyframes',
		'addToggleSelectedKeyframe',
		'selectKeyframesInRange',
		'addSelectedKeyframesInRange',
		'unselectKeyframe',
		'unselectKeyframes',
		'selectAllKeyframes',

		'moveSelectedKeyframes',
		'stopMovingSelectedKeyframes',

		'undo',
		'redo',

		'deleteSelectedKeyframes'
	]

);


var vticonStore = Reflux.createStore({

	listenables: [vticonActions],

	init : function() {
		this._data = {
						duration: 3000, //ms

						parameters: {
							amplitude: {
								valueScale:[0,1], //normalized
								data : [
									{ id: 0, t: 600, value:0.5, selected:false}, 
									{ id: 1, t: 1500, value:1, selected:false},
									{ id: 2, t: 3000, value:0, selected:false}]
							},

							frequency: {
								valueScale:[50,500], //Hz
								data : [
									{ id: 3, t: 0, value:250, selected:false}, 
									{ id: 4, t: 1200, value:50, selected:false},
									{ id: 5, t: 1800, value:500, selected:false}]
							}
						}
					};

		this._previousStates = []; //for undo
		this._nextStates = []; //for redo

		this._kfuidCount = 0;
		for (var p in this._data.parameters) {
			for (var d in this._data.parameters[p].data)
			{
				this._kfuidCount += 1;
			}
		}
	},

	getInitialState : function() {
		return this._data;

	},

	onNewKeyframe(parameter, t, value, addToSelection=false) {
		var new_id = this._addNewKeyframe(parameter, t, value, addToSelection);
		if (new_id >= 0)
		{
			if (addToSelection)
			{
				this.trigger(this._data);
			} else {
				this.onSelectKeyframe(new_id);
			}
			this._saveStateForUndo();
		}
	},

	onNewMultipleKeyframes(parameter_keyframe_map, overwrite=true)
	{
		if (overwrite) {

			//find range of parameter_keyframe_map
			var min = -1;
			var max = -1;
			for (var p in parameter_keyframe_map) {
				for (var i = 0; i < parameter_keyframe_map[p].length; i++)
				{
					if (min == -1 || parameter_keyframe_map[p][i].t < min)
					{
						min = parameter_keyframe_map[p][i].t;
					}

					if (max == -1 || parameter_keyframe_map[p][i].t > max)
					{
						max = parameter_keyframe_map[p][i].t;
					}
				}
			}

			//delete keyframes in range
			var ids_to_delete = [];
			for (var p in this._data.parameters) {
				for (var i = 0; i < this._data.parameters[p].data.length; i++)
				{
					if (this._data.parameters[p].data[i].t >= min &&
						this._data.parameters[p].data[i].t <= max)
					{
						ids_to_delete.push(this._data.parameters[p].data[i].id);
					}
				}
			}

			this._setSelectedKeyframes(ids_to_delete, true);
			this.onDeleteSelectedKeyframes();
		} 


		this._setAllKeyframes(false);
		for (var p in parameter_keyframe_map) {
			for (var i = 0; i < parameter_keyframe_map[p].length; i++)
			{
				this._addNewKeyframe(p, parameter_keyframe_map[p][i].t, parameter_keyframe_map[p][i].value, true);
			}
		}
		this._saveStateForUndo();
		this.trigger(this._data);
		
	},

	_addNewKeyframe(parameter, t, value, addToSelection=false) {
		var new_id = -1;
		if (this._isValidKeyframePosition(parameter, t, value))
		{
			new_id = this._getNewKFUID();
			this._data.parameters[parameter].data.push({
				id:new_id,
				t:t,
				value:value,
				selected:true
			});

			this._data.parameters[parameter].data.sort(this._keyframeCompare);
		}
		return new_id;

	},

	/**
	* Selection
	*/

	onSelectKeyframe(id) {
		this._setSelectedKeyframes([id], true);
	},

	onSelectKeyframes(ids) {
		this._setSelectedKeyframes(ids, true);
	},

	onAddSelectedKeyframe(id) {
		this._setSelectedKeyframes([id], false);
	},

	onAddSelectedKeyframes(ids) {
		this._setSelectedKeyframes(ids, true);
	},

	onAddToggleSelectedKeyframe(id) {
		for (var p in this._data.parameters) {
			for (var i = 0; i < this._data.parameters[p].data.length; i++) {
				if(this._data.parameters[p].data[i].id == id)
				{
					this._data.parameters[p].data[i].selected = !this._data.parameters[p].data[i].selected;
				}
			}
		}
		this.trigger(this._data);
	},

	onUnselectKeyframe(id) {
		this._setUnselectedKeyframes([id], false);
	},

	onUnselectKeyframes() {
		this._setAllKeyframes(false);
	},

	onSelectAllKeyframes() {
		this._setAllKeyframes(true);
	},

	//Range select
	onSelectKeyframesInRange(time1, time2, parameter_value_map) {
		var ids = this._getKFIDSInRange(time1, time2, parameter_value_map);
		this._setSelectedKeyframes(ids, true);

	},

	onAddSelectedKeyframesInRange(time1, time2, parameter_value_map) {
		var ids = this._getKFIDSInRange(time1, time2, parameter_value_map);
		this._setSelectedKeyframes(ids, false);
	},

	//helpers
	//need to refactor into one function at some point?

	_getKFIDSInRange(time1, time2, parameter_value_map) {
		var tLeft = time1;
		var tRight = time2;
		if(tLeft > tRight)
		{
			tLeft = time2;
			tRight = time1;
		}

		var rv =[];

		for (var p in parameter_value_map) {
			var vTop = parameter_value_map[p].value1;
			var vBottom = parameter_value_map[p].value2;
			if(vTop < vBottom)
			{
				vTop = parameter_value_map[p].value2;
				vBottom = parameter_value_map[p].value1;
			}

			for (var i = 0; i < this._data.parameters[p].data.length; i++) {
					if(this._data.parameters[p].data[i].t >= tLeft
						&& this._data.parameters[p].data[i].t <= tRight
						&& this._data.parameters[p].data[i].value <= vTop
						&& this._data.parameters[p].data[i].value >= vBottom)
					{
						rv.push(this._data.parameters[p].data[i].id);
					}
				}
		}

		return rv;
	},

	_setAllKeyframes(bool) {
		for (var p in this._data.parameters) {
			for (var i = 0; i < this._data.parameters[p].data.length; i++) {
					this._data.parameters[p].data[i].selected = bool;
			}
		}
		this.trigger(this._data);
	},

	_setSelectedKeyframes(ids, setUnselected) {
		for (var p in this._data.parameters) {
			for (var i = 0; i < this._data.parameters[p].data.length; i++) {
				if (ids.indexOf(this._data.parameters[p].data[i].id) >= 0 ) {
					this._data.parameters[p].data[i].selected = true;
				} else if (setUnselected) {
					this._data.parameters[p].data[i].selected = false;
				}
			}
		}
		this.trigger(this._data);
	},

	_setUnselectedKeyframes(ids, setSelected) {
		for (var p in this._data.parameters) {
			for (var i = 0; i < this._data.parameters[p].data.length; i++) {
				if (ids.indexOf(this._data.parameters[p].data[i].id) >= 0 ) {
					this._data.parameters[p].data[i].selected = false;
				} else if (setSelected) {
					this._data.parameters[p].data[i].selected = true;
				}
			}
		}
		this.trigger(this._data);
	},

	/**
	* Move Keyframes
	*/

	onMoveSelectedKeyframes(dt, dv) {
		//guard
		var valid_move = true;
		for (var p in this._data.parameters) {
			for (var i = 0; i < this._data.parameters[p].data.length; i++) {
				if (this._data.parameters[p].data[i].selected) {
					if (!this._isValidKeyframePosition(p, this._data.parameters[p].data[i].t+dt, this._data.parameters[p].data[i].value+dv[p]))
					{
						valid_move = false;
					}
				}
			}
		}

		if (valid_move)
		{
			//move
			for (var p in this._data.parameters) {
				for (var i = 0; i < this._data.parameters[p].data.length; i++) {
						if (this._data.parameters[p].data[i].selected) {
							this._data.parameters[p].data[i].t += dt;
							this._data.parameters[p].data[i].value += dv[p];
						}
				}
				this._data.parameters[p].data.sort(this._keyframeCompare);
			}
			this.trigger(this._data);
		}

	},

	onStopMovingSelectedKeyframes() {
		this._saveStateForUndo();
	},

	/**
	* Delete Keyframes
	*/

	onDeleteSelectedKeyframes() {

		var kfNotSelected = function(value) {
			return !value.selected;
		};

		for (var p in this._data.parameters) {
			this._data.parameters[p].data = this._data.parameters[p].data.filter(kfNotSelected);
			if (this._data.parameters[p].data.length == 0) {
				//can't have an empty keyframe track, create new keyframe
				var new_id = this._getNewKFUID(p);
				var new_t = this._data.duration/2;
				//assign a midway value
				var new_value = (this._data.parameters[p].valueScale[0] + this._data.parameters[p].valueScale[1])/2; 

				this._data.parameters[p].data.push({
					id:new_id,
					t:new_t,
					value:new_value,
					selected:false
				});
			}
		}

		this._saveStateForUndo();
		this.trigger(this._data);
	},

	/**
	 * KF Guards
	 */
	 _isValidKeyframePosition(parameter, t, v) 
	 {
	 	var valid = false;

	 	if(t >= 0 && t <= this._data.duration)
	 	{
	 		var min = Math.min(this._data.parameters[parameter].valueScale[0], this._data.parameters[parameter].valueScale[1]);
	 		var max = Math.max(this._data.parameters[parameter].valueScale[0], this._data.parameters[parameter].valueScale[1]);

	 		if (v >= min &&
	 			v <= max)
	 		{
	 			valid = true;
	 		}
	 	}
	 	return valid;
	 },


	 /**
	 * Undo/Redo
	 */

	 _copyState() {
	 	//TODO: Make this more general, right now it's very brittle
	 	var state = {};
	 	state.duration = this._data.duration;
	 	state.parameters = {};
	 	for (var p in this._data.parameters)
	 	{
	 		state.parameters[p] = {};
	 		state.parameters[p].valueScale = this._data.parameters[p].valueScale;
	 		state.parameters[p].data = [];
	 		for (var i = 0; i < this._data.parameters[p].data.length; i++)
	 		{
	 			var d = this._data.parameters[p].data[i];
	 			state.parameters[p].data.push({
	 				t:d.t,
	 				value:d.value,
	 				selected:d.selected,
	 				id:d.id
	 			});
	 		}
	 	}

	 	return state;
	 },

	 _saveStateForUndo() {
	 	this._previousStates.push(this._copyState());
	 	this._nextStates = [];
	 },

	 onUndo() {
	 	if (this._previousStates.length > 0 )
	 	{
	 		this._nextStates.push(this._copyState());
	 		this._data = this._previousStates.pop();
	 		this.trigger(this._data);
	 	}
	 },

	 onRedo() {
	 	if (this._nextStates.length > 0 )
	 	{
	 		this._previousStates.push(this._copyState());
	 		this._data = this._nextStates.pop();
	 		this.trigger(this._data);
	 	}
	 },

	/**
	* KFUID helper functions
	*/

	//returns a new, unique, kfid
	_getNewKFUID(parameter) {
		this._kfuidCount  += 1;
		return this._kfuidCount;
	},

	//compares two keyframes
	_keyframeCompare(a, b) {
		return (a.t - b.t);
	}



	});




module.exports = {
	actions:vticonActions,
	store:vticonStore
};