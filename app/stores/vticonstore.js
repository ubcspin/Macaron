import Reflux from 'reflux';

var LogStore = require('./logstore.js');

var vticonActions = Reflux.createActions(
	[
		'selectVTIcon',

		'setVTIcon',

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

		'selectTimeRange',
		'selectAllTimeRange',
		'unselectTimeRange',

		'moveSelectedKeyframes',
		'startMovingSelectedKeyframes',

		'undo',
		'redo',

		'deleteSelectedKeyframes',
		//hasti Dilorom
		'increaseAmplitude',
		'decreaseAmplitude',
		'inFreq',
		'decFreq',
		'energy',
		'pulse',
		// 'jumpHistory'

		//hasti Dilorom
	]

);


var vticonStore = Reflux.createStore({

	listenables: [vticonActions],

	init : function() {
		this._data = {

					main: { //left side editor
						duration: 3000, //ms //was 3000

						selected: true,

						selectedTimeRange: {
							active:false,
							time1:0,
							time2:0
						},

						parameters: {
							amplitude: {
								valueScale:[0,1], //normalized
								data : [
									{ id: 0, t: 1500, value:0.5, selected:false}]
							},

							frequency: {
								valueScale:[50,500], //Hz
								data : [
									{ id: 1, t: 1500, value:250, selected:false}]
							}
						}
					},
					

				

					example: { //right side editor
						duration: 3000, //ms 

						selected: true,  

						selectedTimeRange: {
							active:false, 
							time1:0, 
							time2:0 
						},

						parameters: {
							amplitude: {
								valueScale:[0,1], 
								data : [
									{ id: 6, t: 600, value:0.5, selected:false},  
									{ id: 7, t: 1500, value:1, selected:false},   
									{ id: 8, t: 3000, value:0, selected:false}]   
							},

							frequency: {
								valueScale:[50,500], //Hz , was [50,500]
								data : [
									{ id: 9, t: 0, value:250, selected:false}, 
									{ id: 10, t: 1200, value:50, selected:false}, 
									{ id: 11, t: 1800, value:500, selected:false}] 
									
							}
						}
					}
						
					};

		this._previousStates = []; //for undo
		this._nextStates = []; //for redo

		this._kfuidCount = 0;
		for (var n in this._data) {
			for (var p in this._data[n].parameters) {
				for (var d in this._data[n].parameters[p].data)
				{
					this._kfuidCount += 1;
				}
			}
		}

		// to keep track of all amplitude changes
		this._ampArray = [];
		//dilorom//
		this._freqArray = [];

		// to remember previous position of the amplitude slider
		this._prevAmpPos = 0
		
	},

	getInitialState : function() {
		return this._data;

	},

	/**
	*
	* VTIcon Selection
	* 
	*/

	_selectVTIcon(name="") {
		var rv = "";
		if (name in this._data) {
			rv = name;
			for (var n in this._data) {
				this._data[n].selected = (name === n);
			}
		} else {
			for (var n in this._data) {
				if (this._data[n].selected) {
					rv = n;
				}
			}
		}
		LogStore.actions.log("VTICON_SELECT_"+rv);
		return rv;
	},

	onSelectVTIcon(name) {
		this._selectVTIcon(name);
		this.trigger(this._data);
	},


	/*
	*
	* Set VT Icon
	*
	*/

	onSetVTIcon(vticon, name) {
		if (name in this._data)
		{
			this._data[name].duration = vticon.duration;

			this._data[name].selectedTimeRange.active=false;

			for (var p in this._data[name].parameters) {
				this._data[name].parameters[p].valueScale = vticon.parameters[p].valueScale;
				this._data[name].parameters[p].data = [];
				for (var i = 0; i < vticon.parameters[p].data.length; i++) {
					var d = vticon.parameters[p].data[i];
					this._addNewKeyframe(p, d.t, d.value, false, name=name);
				}
				this._setAllKeyframes(false, name);
			}

		}
		this.trigger(this._data);
	
	},

	/*
	*
	* Keyframe creation
	*
	*/

	onNewKeyframe(parameter, t, value, addToSelection=false, name="") {
		this._saveStateForUndo();
		name = this._selectVTIcon(name);

		LogStore.actions.log("VTICON_NEWKEYFRAME_"+name);

		var new_id = this._addNewKeyframe(parameter, t, value, addToSelection, name=name);
		if (new_id >= 0)
		{
			if (addToSelection)
			{
				this.trigger(this._data);
			} else {
				this.onSelectKeyframe(new_id);
			}
		}
	},

	onNewMultipleKeyframes(parameter_keyframe_map, overwrite=true, name="")
	{
		this._saveStateForUndo();
		name = this._selectVTIcon(name);
		var leftover_ids_to_delete = [];

		if (overwrite) {

			//find range of parameter_keyframe_map
			var min = {};
			var max = {};
			for (var p in parameter_keyframe_map) {
				if (!(p in min)) {
					min[p] = -1;
				}
				if (!(p in max)) {
					max[p] = -1;
				}
				for (var i = 0; i < parameter_keyframe_map[p].length; i++)
				{
					if (min[p] == -1 || parameter_keyframe_map[p][i].t < min[p])
					{
						min[p] = parameter_keyframe_map[p][i].t;
					}

					if (max[p] == -1 || parameter_keyframe_map[p][i].t > max[p])
					{
						max[p] = parameter_keyframe_map[p][i].t;
					}
				}
			}

			//delete keyframes in range
			var ids_to_delete = [];
			for (var p in this._data[name].parameters) {
				for (var i = 0; i < this._data[name].parameters[p].data.length; i++)
				{
					if (this._data[name].parameters[p].data[i].t >= min[p] &&
						this._data[name].parameters[p].data[i].t <= max[p])
					{
						ids_to_delete.push(this._data[name].parameters[p].data[i].id);
					}
				}
			}

			this._setSelectedKeyframes(ids_to_delete, true, name=name);
			this.onDeleteSelectedKeyframes(name);

			//store any remaining keyframes (e.g., if we deleted the last of them)
			for (var p in this._data[name].parameters) {
				for (var i = 0; i < this._data[name].parameters[p].data.length; i++)
				{
					if (this._data[name].parameters[p].data[i].t >= min[p] &&
						this._data[name].parameters[p].data[i].t <= max[p])
					{
						leftover_ids_to_delete.push(this._data[name].parameters[p].data[i].id);
					}
				}
			}
		} 


		this._setAllKeyframes(false, name=name);
		for (var p in parameter_keyframe_map) {
			for (var i = 0; i < parameter_keyframe_map[p].length; i++)
			{
				this._addNewKeyframe(p, parameter_keyframe_map[p][i].t, parameter_keyframe_map[p][i].value, true, name=name);
			}
		}

		//delete leftover ids
		var not_leftover_id = function(kf) {
			return (leftover_ids_to_delete.indexOf(kf.id) < 0);
		};

		for (var p in this._data[name].parameters) {
			this._data[name].parameters[p].data = this._data[name].parameters[p].data.filter(not_leftover_id);
		}

		this.trigger(this._data);
		
	},

	_addNewKeyframe(parameter, t, value, addToSelection=false, name="") {

		name = this._selectVTIcon(name);

		var new_id = -1;
		if (this._isValidKeyframePosition(parameter, t, value, name=name))
		{
			new_id = this._getNewKFUID();
			this._data[name].parameters[parameter].data.push({
				id:new_id,
				t:t,
				value:value,
				selected:true
			});

			this._data[name].parameters[parameter].data.sort(this._keyframeCompare);
		}
		return new_id;

	},

	/**
	* Selection
	*/

	onSelectKeyframe(id, name="") {
		name = this._selectVTIcon(name);

		this._setSelectedKeyframes([id], true, name=name);
	},

	onSelectKeyframes(ids, name="") {
		name = this._selectVTIcon(name);
		this._setSelectedKeyframes(ids, true, name=name);
	},

	onAddSelectedKeyframe(id, name="") {
		name = this._selectVTIcon(name);
		this._setSelectedKeyframes([id], false, name=name);
	},

	onAddSelectedKeyframes(ids, name="") {
		name = this._selectVTIcon(name);
		this._setSelectedKeyframes(ids, true, name=name);
	},

	onAddToggleSelectedKeyframe(id, name="") {
		name = this._selectVTIcon(name);
		for (var p in this._data[name].parameters) {
			for (var i = 0; i < this._data[name].parameters[p].data.length; i++) {
				if(this._data[name].parameters[p].data[i].id == id)
				{
					this._data[name].parameters[p].data[i].selected = !this._data[name].parameters[p].data[i].selected;
				}
			}
		}
		this.trigger(this._data);
	},

	onUnselectKeyframe(id, name="") {
		name = this._selectVTIcon(name);
		this._setUnselectedKeyframes([id], false, name=name);
	},

	onUnselectKeyframes(name="") {
		name = this._selectVTIcon(name);
		this._setAllKeyframes(false, name=name);
	},

	onSelectAllKeyframes(name="") {
		name = this._selectVTIcon(name);
		this._setAllKeyframes(true, name=name);
	},

	//Range select
	onSelectKeyframesInRange(time1, time2, parameter_value_map, name="") {
		name = this._selectVTIcon(name);
		var ids = this._getKFIDSInRange(time1, time2, parameter_value_map, name=name);
		this._setSelectedKeyframes(ids, true, name=name);

	},

	onAddSelectedKeyframesInRange(time1, time2, parameter_value_map, name="") {
		name = this._selectVTIcon(name);
		var ids = this._getKFIDSInRange(time1, time2, parameter_value_map, name=name);
		this._setSelectedKeyframes(ids, false, name=name);
	},

	//helpers
	//need to refactor into one function at some point?

	_getKFIDSInRange(time1, time2, parameter_value_map, name="") {
		name = this._selectVTIcon(name);
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

			for (var i = 0; i < this._data[name].parameters[p].data.length; i++) {
					if(this._data[name].parameters[p].data[i].t >= tLeft
						&& this._data[name].parameters[p].data[i].t <= tRight
						&& this._data[name].parameters[p].data[i].value <= vTop
						&& this._data[name].parameters[p].data[i].value >= vBottom)
					{
						rv.push(this._data[name].parameters[p].data[i].id);
					}
				}
		}

		return rv;
	},

	_setAllKeyframes(bool, name="") {
		name = this._selectVTIcon(name);
		for (var p in this._data[name].parameters) {
			for (var i = 0; i < this._data[name].parameters[p].data.length; i++) {
					this._data[name].parameters[p].data[i].selected = bool;
			}
		}
		this.trigger(this._data);
	},

	_setSelectedKeyframes(ids, setUnselected, name="") {
		name = this._selectVTIcon(name);
		for (var p in this._data[name].parameters) {
			for (var i = 0; i < this._data[name].parameters[p].data.length; i++) {
				if (ids.indexOf(this._data[name].parameters[p].data[i].id) >= 0 ) {
					this._data[name].parameters[p].data[i].selected = true;
				} else if (setUnselected) {
					this._data[name].parameters[p].data[i].selected = false;
				}
			}
		}
		this.trigger(this._data);
	},

	_setUnselectedKeyframes(ids, setSelected, name="") {
		name = this._selectVTIcon(name);
		for (var p in this._data[name].parameters) {
			for (var i = 0; i < this._data[name].parameters[p].data.length; i++) {
				if (ids.indexOf(this._data[name].parameters[p].data[i].id) >= 0 ) {
					this._data[name].parameters[p].data[i].selected = false;
				} else if (setSelected) {
					this._data[name].parameters[p].data[i].selected = true;
				}
			}
		}
		this.trigger(this._data);
	},


	/**
	* Set selection range
	*/

	onSelectTimeRange(time1, time2, name="")
	{
		name = this._selectVTIcon(name);
		//TODO: Select keyframes in here?

		this._data[name].selectedTimeRange.active = true;
		this._data[name].selectedTimeRange.time1 = Math.max(0, Math.min(this._data[name].duration, time1));
		this._data[name].selectedTimeRange.time2 = Math.max(0, Math.min(this._data[name].duration, time2));

		this.trigger(this._data);
	},

	onSelectAllTimeRange(name="")
	{
		name = this._selectVTIcon(name);
		LogStore.actions.log("VTICON_SELECTALLTIME_"+name);
		this.onSelectTimeRange(0, this._data[name].duration, name);
	},

	onUnselectTimeRange(name="")
	{
		name = this._selectVTIcon(name);
		//TODO: Unselect keyframes in here?

		this._data[name].selectedTimeRange.active = false;

		this.trigger(this._data);
	},

	/**
	* Move Keyframes
	*/

	onMoveSelectedKeyframes(dt, dv, name="") {
		name = this._selectVTIcon(name);
		//guard
		var valid_move = true;
		for (var p in this._data[name].parameters) {
			for (var i = 0; i < this._data[name].parameters[p].data.length; i++) {
				if (this._data[name].parameters[p].data[i].selected) {
					if (!this._isValidKeyframePosition(p, this._data[name].parameters[p].data[i].t+dt, this._data[name].parameters[p].data[i].value+dv[p], name=name))
					{
						valid_move = false;
					}
				}
			}
		}

		if (valid_move)
		{
			//move
			for (var p in this._data[name].parameters) {
				for (var i = 0; i < this._data[name].parameters[p].data.length; i++) {
						if (this._data[name].parameters[p].data[i].selected) {
							this._data[name].parameters[p].data[i].t += dt;
							this._data[name].parameters[p].data[i].value += dv[p];
						}
				}
				this._data[name].parameters[p].data.sort(this._keyframeCompare);
			}
			this.trigger(this._data);
		}

	},

	onStartMovingSelectedKeyframes(name="") {
		name = this._selectVTIcon(name);
		this._saveStateForUndo();
	},

	/**
	* Delete Keyframes
	*/

	onDeleteSelectedKeyframes(name="") {
		name = this._selectVTIcon(name);

		LogStore.actions.log("VTICON_DELETEKEYFRAMES_"+name);

		var kfNotSelected = function(value) {
			return !value.selected;
		};

		this._saveStateForUndo();

		for (var p in this._data[name].parameters) {
			this._data[name].parameters[p].data = this._data[name].parameters[p].data.filter(kfNotSelected);
			if (this._data[name].parameters[p].data.length == 0) {
				//can't have an empty keyframe track, create new keyframe
				var new_id = this._getNewKFUID(p);
				var new_t = this._data[name].duration/2;
				//assign a midway value
				var new_value = (this._data[name].parameters[p].valueScale[0] + this._data[name].parameters[p].valueScale[1])/2; 

				this._data[name].parameters[p].data.push({
					id:new_id,
					t:new_t,
					value:new_value,
					selected:false
				});
			}
		}

		this.trigger(this._data);
	},

	/**
	 * KF Guards
	 */
	 _isValidKeyframePosition(parameter, t, v, name="")
	 {
	 	name = this._selectVTIcon(name);
	 	var valid = false;

	 	if(t >= 0 && t <= this._data[name].duration)
	 	{
	 		var min = Math.min(this._data[name].parameters[parameter].valueScale[0], this._data[name].parameters[parameter].valueScale[1]);
	 		var max = Math.max(this._data[name].parameters[parameter].valueScale[0], this._data[name].parameters[parameter].valueScale[1]);

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
	 	for (name in this._data)
	 	{
	 		state[name] = {};
	 		state[name].duration = this._data[name].duration;
	 		state[name].selectedTimeRange = this._data[name].selectedTimeRange;
	 		state[name].selected = this._data[name].selected;
		 	state[name].parameters = {};
		 	for (var p in this._data[name].parameters)
		 	{
		 		state[name].parameters[p] = {};
		 		state[name].parameters[p].valueScale = this._data[name].parameters[p].valueScale;
		 		state[name].parameters[p].data = [];
		 		for (var i = 0; i < this._data[name].parameters[p].data.length; i++)
		 		{
		 			var d = this._data[name].parameters[p].data[i];
		 			state[name].parameters[p].data.push({
		 				t:d.t,
		 				value:d.value,
		 				selected:d.selected,
		 				id:d.id
		 			});
		 		}
		 	}

	 	}
	 	

	 	return state;
	 },

	 _hasStateChanged() {
	 	var rv = true;
	 	//TODO: Make this less brittle
	 	if (this._previousStates.length > 0) {
	 		rv = false;
	 		var pState = this._previousStates[this._previousStates.length-1];

	 		for (var name in this._data)
	 		{
	 			if (this._data[name].duration != pState.duration)
		 		{
		 			rv = true;
		 		}

			 	for (var p in this._data[name].parameters)
			 	{
			 		if (this._data[name].parameters[p].valueScale != pState[name].parameters[p].valueScale)
			 		{
			 			rv = true;
			 		}

			 		if (this._data[name].parameters[p].data.length != pState[name].parameters[p].data.length)
			 		{
			 			rv = true;
			 		} else {
			 			for (var i = 0; i < this._data[name].parameters[p].data.length; i++)
				 		{
				 			var d = this._data[name].parameters[p].data[i];
				 			var pd = pState[name].parameters[p].data[i];
				 			if (d.t != pd.t || d.value != pd.value || d.id != pd.id)
				 			{
				 				rv = true;
				 			}
				 		}
			 		}
			 	}

	 		}

	 	}
	 	return rv;
	 },

	 _saveStateForUndo() {
	 	if (this._hasStateChanged())
	 	{
		 	this._previousStates.push(this._copyState());
		 	this._nextStates = [];	
	 	}
	 },

	 onUndo() {
	 	if (this._previousStates.length > 0 )
	 	{
			LogStore.actions.log("UNDO");
	 		this._nextStates.push(this._copyState());
	 		this._data = this._previousStates.pop();
	 		this.trigger(this._data);
	 	}
	 },

	 onRedo() {
	 	if (this._nextStates.length > 0 )
	 	{
			LogStore.actions.log("REDO");
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
	},

	// Dilorom **Moving all amplitude keyframes with button/slider
	// TODO: rename this function to ampChange() (or something similar) as it takes care of both amplitude increase and decrease
	onIncreaseAmplitude(currentAmpPos) {
		var currAmpVal = parseFloat(currentAmpPos);
		var prevAmpVal = parseFloat(this._prevAmpPos);
		var dv = currAmpVal - prevAmpVal;
		console.log("current = %f, previous = %f, dv = %f", currAmpVal, prevAmpVal, dv);
		this._prevAmpPos = currAmpVal;

		var tobeAmpVal = 0, overflows = [], underflows = [];
		var currDataArray = JSON.parse(JSON.stringify(this._data["main"].parameters["amplitude"].data))
		
		var valid_change = false;

		for (var ii = 0; ii < this._data["main"].parameters["amplitude"].data.length; ii++) {
			tobeAmpVal = this._data["main"].parameters["amplitude"].data[ii].value+dv;
			// change keyframe position if new value is valid 
			if (this._isValidKeyframePosition("amplitude",
				this._data["main"].parameters["amplitude"].data[ii].t, 
				tobeAmpVal, name="main")) {
					this._data["main"].parameters["amplitude"].data[ii].value += dv;
					valid_change = true;
			} else {
				// keyframe position is not valid, assign highest value (max) if overflow and assign lowest value (min) if underflow
				// overflow = the new value is greater than highest valid amplitude
				// underflow = the new value is lower than lowest valid amplitude
				console.log("amplitude invalid move");

				// get highest and lowest valid amplitude values to detect overflows and underflows
		 		var min = Math.min(this._data["main"].parameters["amplitude"].valueScale[0], 
		 			this._data["main"].parameters["amplitude"].valueScale[1]);
		 		var max = Math.max(this._data["main"].parameters["amplitude"].valueScale[0], 
		 			this._data["main"].parameters["amplitude"].valueScale[1]);

				// check if new value is overflow or underflow. For overflow assign max, otherwise min.
				if (tobeAmpVal >= max) { // this is overflow
					this._data["main"].parameters["amplitude"].data[ii].value = max;
					overflows.push(ii);
				} else { // this is underflow
					this._data["main"].parameters["amplitude"].data[ii].value = min;	
					underflows.push(ii);
				}
			}
		}

		// update keyframe values if there was a valid
		this.trigger(this._data);

		if (valid_change == true) {
			// save this change in amplitude history since we had at least one valid keyframe value change
			this._ampArray.push(currDataArray)
			console.log("saved changes to _ampArray, this._ampArray.length =", this._ampArray.length)
			// console.log(this._ampArray)
		}

		// print overflows and underflows for debugging
		if (overflows.length > 0) {
			console.log("overflows at keyframes: %s", overflows.join(","));
		}
		if (underflows.length > 0) {
			console.log("underflows at keyframes: %s", underflows.join(","));
		}
	},

	//** Moving all frequency keyframes with button/slider
	// TODO: delete this function as it is not needed anymore. onIncreaseAmplitude() is taking care of both increase and decrease (in amplitude)
	onDecreaseAmplitude(df) {
		// // old behaviour: start
		// var df = 50;
		// var f1, f2;

		// var valid_change = false;
		// for (var ii = 0; ii < this._data["main"].parameters["frequency"].data.length; ii++) {

		// 	// f1 = this._data["main"].parameters["frequency"].data[ii].value;
		// 	// 	f2 = f1 + f1/5 + 5;
		// 	// 	this._data["main"].parameters["frequency"].data[ii].value = f2;
		// 	// if (this._isValidKeyframePosition("frequency",
		// 	// 	this._data["main"].parameters["frequency"].data[ii].t, f2, name="main")) {

		// 	if (this._isValidKeyframePosition("frequency",
		// 		this._data["main"].parameters["frequency"].data[ii].t, 
		// 		this._data["main"].parameters["frequency"].data[ii].value+df, name="main")) {
		// 		this._data["main"].parameters["frequency"].data[ii].value += df;
		// 		valid_change = true; 
		// 	} else {
		// 		console.log("frequency invalid move");
		// 	}
		// }
		// if (valid_change == true) {
		// 	this.trigger(this._data);
		// }
		// // old behaviour: end

		var dv = 0.1;
		var valid_change = false;

		// TODO(dilorom): this function is exactly same as onIncreaseAmplitude() except this has "-dv" instead of "+dv". These two functions should be merged to avoid code repetition (and ease maintanence)
		
		for (var ii = 0; ii < this._data["main"].parameters["amplitude"].data.length; ii++) {
			if (this._isValidKeyframePosition("amplitude",
				this._data["main"].parameters["amplitude"].data[ii].t, 
				this._data["main"].parameters["amplitude"].data[ii].value-dv, name="main")) {
					if (ii == 0) {
						// save this change in amplitude history
						this._ampArray.push(JSON.parse(JSON.stringify(this._data["main"].parameters["amplitude"].data)))
						console.log("added changes to the _ampArray, this._ampArray.length =", this._ampArray.length)
						console.log(this._ampArray)
					}

					this._data["main"].parameters["amplitude"].data[ii].value -= dv;
					valid_change = true;
			} else {
				console.log("amplitude invalid move");
			}
		}
		if (valid_change == true) {
			this.trigger(this._data);
		}
	},

	_jumpHistory() {
		if (this._ampArray.length > 0) {
			this._data["main"].parameters["amplitude"].data = this._ampArray.pop()
			console.log("assigned older values to 'data' array, this._ampArray.length =", this._ampArray.length)
			console.log(this._ampArray)
			this.trigger(this._data);
		} else {
			console.log("no more history to jump back, this._ampArray.length =", this._ampArray.length)
		}
	},
	

//Increasing Frequency
	onInFreq(df) {

		this._jumpHistory()
		// // calling onJumpHistory() to test history functionality. Enable the commented block below to restore the expected behavior of "increase frequency".
		// if (this._ampArray.length > 0) {
		// 	this._data["main"].parameters["amplitude"].data = this._ampArray.pop()
		// 	console.log("assigned older values to 'data' array, this._ampArray.length =", this._ampArray.length)
		// 	console.log(this._ampArray)
		// 	this.trigger(this._data);
		// } else {
		// 	console.log("no more history to jump back, this._ampArray.length =", this._ampArray.length)
		// }

		
		// var df = 50;
		// var valid_change = false;
		
		// for (var ii = 0; ii < this._data["main"].parameters["frequency"].data.length; ii++) {
		// 	if (this._isValidKeyframePosition("frequency",
		// 		this._data["main"].parameters["frequency"].data[ii].t, 
		// 		this._data["main"].parameters["frequency"].data[ii].value+df, name="main")) {
		// 			if (ii == 0) {				
		// 				// save this change in frequency history
		// 				this._freqArray.push(JSON.parse(JSON.stringify(this._data["main"].parameters["frequency"].data)))
		// 				console.log("added changes to the _freqArray, this._freqArray.length =", this._freqArray.length)
		// 				console.log(this._freqArray)
		// 			}

		// 			this._data["main"].parameters["frequency"].data[ii].value += df;
		// 			valid_change = true;
		// 	} else {
		// 		console.log("frequency invalid move");
		// 	}
		// }
		// if (valid_change == true) {
		// 	this.trigger(this._data);
		// }
	},

	//decreasing freq//
	onDecFreq() {
		var df = 50;
		
		if (this._freqArray.length > 0) {
			this._data["main"].parameters["frequency"].data = this._freqArray.pop()
			console.log("assigned older values to 'data' array, this._freqArray.length =", this._freqArray.length)
			console.log(this._freqArray)
			this.trigger(this._data);
		} else {
			

			console.log("no more history to jump back, this._freqArray.length =", this._freqArray.length)
		}
		
	},


//Energy f2 = f1 + f1/5 + 5 
	onEnergy() {
		
		var f1, f2;
		var valid_change = true;
		for (var ii = 0; ii < this._data["main"].parameters["frequency"].data.length; ii++) {
			f1 = this._data["main"].parameters["frequency"].data[ii].value;
		
				/*f2 = f1 + f1/5 + 5;
				this._data["main"].parameters["frequency"].data[ii].value = f2;*/
				
			if (this._isValidKeyframePosition("frequency",this._data["main"].parameters["frequency"].data[ii].t, f1, name="main")) {
				f2 = f1 + f1/5 + 5;
				this._data["main"].parameters["frequency"].data[ii].value = f2;
				console.log(f2);

				valid_change = false;
			} else {
				console.log("increase frequency for implimenting Energy is not valid");
			}
		}
		if (valid_change == true) {
			this.trigger(this._data);
		} 
		
//decrease all freq key frames until the 0 point
		/*var df = 50;
		var valid_change = false;
		for (var ii = 0; ii < this._data["main"].parameters["frequency"].data.length; ii++) {
			if (this._isValidKeyframePosition("frequency",
		 		this._data["main"].parameters["frequency"].data[ii].t, 
		 		this._data["main"].parameters["frequency"].data[ii].value+df, name="main")) {
		 		this._data["main"].parameters["frequency"].data[ii].value -= df;
		 		valid_change = true; 
		 	} else {
		 		console.log("frequency invalid move");
		 	}
		 }
		 if (valid_change == true) {
		 	this.trigger(this._data);
		 } */





	},
	onPulse() {

		var pulse_start, pulse_end;
		var time_start, time_end;
		var amp_length = this._data["main"].parameters["amplitude"].data.length;
		console.log(amp_length)

		// see if amplitude=0 for more than 30 msec
		// see if amplitude does not change for more than 30 msec
		// we start loop from 1, instead of 0, since we can not check element 0 with its predecessor array[-1]
		for (var ii = 1; ii < amp_length; ii++) {
			time_start = this._data["main"].parameters["amplitude"].data[ii-1].t;
			time_end = this._data["main"].parameters["amplitude"].data[ii].t;

			pulse_start = this._data["main"].parameters["amplitude"].data[ii-1].value;
			pulse_end = this._data["main"].parameters["amplitude"].data[ii].value;

			// check if time difference is > 30 ms
			if (time_end - time_start > 30) {
				console.log("time difference is > 30 ms")
				// console.log(pulse_start, pulse_end)
				if (pulse_start == 0) {
					console.log("amplitude is 0 more than 30 ms at point ", ii);
				} else {
					console.log("amplitude is not 0 at point ", ii);
				}
			}
		}

		
	}
//Dilorom

	});




module.exports = {
	actions:vticonActions,
	store:vticonStore
};