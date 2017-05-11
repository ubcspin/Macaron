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
		'freq_slider',
		'energy',
		'pulse',
		'tempo',
		'tempoNew'
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

		/**
		** DILOORM 
		**/
		// --to keep track of all amplitude changes
		this._ampArray = [];
		
		this._freqArray = [];

		// to remember previous position of the amplitude slider
		this._prevAmpPos = 0;
		this._prevFreqPos = 0;

		//saving initial keyframes values in this array
		this._initialAmpVal = [];
		this._initialFreqVal = [];
		this._initialKfValues = [];
		this._globalPulseArray = [];
		//declare keyframes as global var
		this._keyframes = [];
		this._initialAmpTimeVal = [];
		this._initialFreqTimeVal = [];
		
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
	 *///TODO(dilorom) - clarify this more::This is only giving max and min values of the parameters: NOT TIME!
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
	 //	TODO(dilorom)-normal komentariya yoz!THis function keeps keyframes Time between max and min 
	  _isValidKeyframeTimePosition(t)
	 {
	 	name = this._selectVTIcon(name);
	 	var valid = false;

	 	if(t >= 0 && t <= 3000)
	 	{
	 		return true;
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

	/*
	// Dilorom **  Moving all amplitude keyframes with slider
	**/
	// It takes care of both amplitude increase and decrease
	onIncreaseAmplitude(currentAmpPos) {
		var currAmpVal = parseFloat(currentAmpPos);
		console.log('zero = ' , this._initialAmpVal);

		var dv = currAmpVal;
		console.log("current = %f, dv = %f", currAmpVal, dv);

		var tobeAmpVal = 0, overflows = [], underflows = [];
		var currDataArray = JSON.parse(JSON.stringify(this._data["main"].parameters["amplitude"].data))
		
		var valid_change = false;
		//saving initial keyframes values
		if (this._initialAmpVal.length ==0){
			this._initialAmpVal = JSON.parse(JSON.stringify(this._data["main"].parameters["amplitude"].data))
		console.log('initialKeyframes' , this._initialAmpVal);
		}

		for (var ii = 0; ii < this._data["main"].parameters["amplitude"].data.length; ii++) {
			tobeAmpVal = this._initialAmpVal[ii].value + dv;

			// change keyframe position if new value is valid 
			if (this._isValidKeyframePosition("amplitude",
				this._data["main"].parameters["amplitude"].data[ii].t, 
				tobeAmpVal, name="main")) {
				this._data["main"].parameters["amplitude"].data[ii].value = this._initialAmpVal[ii].value + dv;
					
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
	

//using this function for calling _jumpHistory: it may need later on
	onInFreq(df) {

		this._jumpHistory()
	},


	onFreq_slider(currentFreqPos) {

		var currFreqVal = parseFloat(currentFreqPos);
		var df = currFreqVal;
		console.log("current = %f, df = %f", currFreqVal, df);
		var tobeFreqVal = 0, overflows = [], underflows = [];
		var currFreqDataArray = JSON.parse(JSON.stringify(this._data["main"].parameters["frequency"].data))
		var valid_change = false;
		//saving initial keyframes values
		if (this._initialFreqVal.length ==0) {
			this._initialFreqVal = JSON.parse(JSON.stringify(this._data["main"].parameters["frequency"].data))
			console.log('boshlangich' , this._initialFreqVal);
		}

		for (var ii = 0; ii < this._data["main"].parameters["frequency"].data.length; ii++) {
			tobeFreqVal = this._initialFreqVal[ii].value + df;

			// change keyframe position if new value is valid 
			if (this._isValidKeyframePosition("frequency",
				this._data["main"].parameters["frequency"].data[ii].t, 
				tobeFreqVal, name="main")) {
					this._data["main"].parameters["frequency"].data[ii].value = this._initialFreqVal[ii].value + df;
					
			} else {
				// keyframe position is not valid, assign highest value (max) if overflow and assign lowest value (min) if underflow
				// overflow = the new value is greater than highest valid frequency
				// underflow = the new value is lower than lowest valid frequency
				console.log("frequency invalid move");

				// get highest and lowest valid frequency values to detect overflows and underflows
		 		var min = Math.min(this._data["main"].parameters["frequency"].valueScale[0], 
		 			this._data["main"].parameters["frequency"].valueScale[1]);
		 		var max = Math.max(this._data["main"].parameters["frequency"].valueScale[0], 
		 			this._data["main"].parameters["frequency"].valueScale[1]);

				// check if new value is overflow or underflow. For overflow assign max, otherwise min.
				if (tobeFreqVal >= max) { // this is overflow
					this._data["main"].parameters["frequency"].data[ii].value = max;
					overflows.push(ii);
				} else { // this is underflow
					this._data["main"].parameters["frequency"].data[ii].value = min;	
					underflows.push(ii);
				} 
			}
		}

		// update keyframe values if there was a valid
		this.trigger(this._data);

		if (valid_change == true) {
			// save this change in frequency history since we had at least one valid keyframe value change
			this._freqArray.push(currFreqDataArray)
			console.log("saved changes to _freqArray, this._freqArray.length =", this._freqArray.length)
			// console.log(this._freqArray)
		}

		// print overflows and underflows for debugging
		if (overflows.length > 0) {
			console.log("overflows at keyframes: %s", overflows.join(","));
		}
		if (underflows.length > 0) {
			console.log("underflows at keyframes: %s", underflows.join(","));
		}

	},

//Energy slider f2 = f1 + f1/5 + 5 
	onEnergy(currentFreqPos) {
		var currFreqVal = parseFloat(currentFreqPos);
		var df = currFreqVal + (currFreqVal)/5 +5;
		console.log("current = %f, df(f1 + f1/5 + 5) = %f", currFreqVal, df);
		var tobeFreqVal = 0, overflows = [], underflows = [];
		var currFreqDataArray = JSON.parse(JSON.stringify(this._data["main"].parameters["frequency"].data))
		var valid_change = false;

		//saving initial keyframes values
		if (this._initialFreqVal.length == 0) {
			this._initialFreqVal = JSON.parse(JSON.stringify(this._data["main"].parameters["frequency"].data))
			console.log('boshlangich' , this._initialFreqVal);
		}
		for (var ii = 0; ii < this._data["main"].parameters["frequency"].data.length; ii++) {
			tobeFreqVal = this._initialFreqVal[ii].value + df;

			// change keyframe position if new value is valid 
			if (this._isValidKeyframePosition("frequency",
				this._data["main"].parameters["frequency"].data[ii].t, 
				tobeFreqVal, name="main")) {
				this._data["main"].parameters["frequency"].data[ii].value = this._initialFreqVal[ii].value + df;
					
			} else {
				// keyframe position is not valid, assign highest value (max) if overflow and assign lowest value (min) if underflow
				// overflow = the new value is greater than highest valid frequency
				// underflow = the new value is lower than lowest valid frequency
				console.log("frequency invalid move");

				// get highest and lowest valid frequency values to detect overflows and underflows
		 		var min = Math.min(this._data["main"].parameters["frequency"].valueScale[0], 
		 			this._data["main"].parameters["frequency"].valueScale[1]);
		 		var max = Math.max(this._data["main"].parameters["frequency"].valueScale[0], 
		 			this._data["main"].parameters["frequency"].valueScale[1]);

				// check if new value is overflow or underflow. For overflow assign max, otherwise min.
				if (tobeFreqVal >= max) { // this is overflow
					this._data["main"].parameters["frequency"].data[ii].value = max;
					overflows.push(ii);
				} else { // this is underflow
					this._data["main"].parameters["frequency"].data[ii].value = min;	
					underflows.push(ii);
				} 
			}
		}

		// update keyframe values if there was a valid
		this.trigger(this._data);

		if (valid_change == true) {
			// save this change in frequency history since we had at least one valid keyframe value change
			this._freqArray.push(currFreqDataArray)
			console.log("saved changes to _freqArray, this._freqArray.length =", this._freqArray.length)
			// console.log(this._freqArray)
		}

	},
//this is Discontinuity slider function
	onPulse(currentDiscontPos) {
		
		 /*var MockArray = [
						[0, 0.00000002],
						[347.1, 0.072],
		 				[638.4, 0.188],
		 				[873.9, 0.333],
		 				[1028.9, 0.494],
		 				[1140.4, 0.683],
						[1221, 1],
		  				[1239.6, 0.0002],
		 				[1591.1, 0.0002],
		 				[1938.3, 0.072],
		 				[2229.6, 0.188],
		 				[2465.1, 0.333],
		 				[2620.1, 0.494],
		 				[2731.6, 0.683],
		 				[2812.2, 1],
		 				[2830, 0.00002]
		 				];*/
		
		//var keyframes = MockArray;
		// var keyframes = this._data["main"].parameters["amplitude"].data;
		var T1, T2;
		var currDiscontVal = parseFloat(currentDiscontPos);
		console.log("currDiscontVal = %d", currDiscontVal)
		// TODO(dilorom): explain meaning/purpose/intention (what do they do) of these two variables.
		var PulsestartT = [];
		var PulseEndT = [];
		var currKfTime = 0, pulseStartKfIndex = 0, pulseEndKfIndex = 0;
		

		// TODO(dilorom): explain why this if is needed
		if (this._initialKfValues.length == 0) {
			console.log("this._initialKfValues = 0")
			var tempArray = [];
			var keyframes = [];
			for (var ii = 0; ii < this._data["main"].parameters["amplitude"].data.length; ii++) {
				tempArray.push(this._data["main"].parameters["amplitude"].data[ii].t);
				tempArray.push(this._data["main"].parameters["amplitude"].data[ii].value);

				//console.log("tempArray[%d] = [%s, %s]", ii, tempArray[0], tempArray[1])
				keyframes.push(tempArray)
				tempArray = [];
			}

			// print for debugging
			for (var ii = 0; ii < keyframes.length; ii++) {
				console.log("keyframes[" + ii + "] = " + keyframes[ii]);
			}
			if (keyframes.length <= 1) {
				//console.log('too few keyframes (length = %d). No pulses. Terminating.', keyframes.length)
				return
			}

			var pulseArray = [];
			var t1 = 0; // t1 is pulse start
			var t2 = 0; // t2 is pulse end

			// iterate through keyframes to find pulse-start (t1) and pulse-end (t2)
			var kfIndex = 0;
			
			while (kfIndex < keyframes.length) {
				t1 = this._pulseStart(kfIndex, keyframes);
				if (t1 == -1) {
					console.log("got -1 from _pulseStart. This means no more pulses")
					break;
				} else {
					console.log("returned from _pulseStart = %d", t1)
				}
				t2 = this._pulseEnd(t1, keyframes);

				// add [t1, t2] to the pulseArray
				tempArray.push(t1);
				tempArray.push(t2);
				pulseArray.push(tempArray);
				tempArray = [];
				// assign t2 to kfIndex so that next iteration will start considering keyframes after current t2
				kfIndex = t2;
				// break;
			}
			//TODO(dilorom): what these are doing?
			this._initialKfValues = keyframes;
			this._globalPulseArray = pulseArray;
			
		} else {
			console.log("this._initialKfValues != 0")
		}

		// TODO: describe what this loop does.
		for (var ii = 0; ii < this._globalPulseArray.length; ii++) {
			//console.log("pulseArray[%d] = [%d, %d]", ii, pulseArray[ii][0], pulseArray[ii][1])
			// TODO: follow CamelCase variable naming and make variables lowerCase
			// PulsestartT = keyframes[pulseArray[ii][0]][0];
			PulsestartT = this._initialKfValues[this._globalPulseArray[ii][0]][0];
			// PulseEndT = keyframes[pulseArray[ii][1]][0];
			PulseEndT = this._initialKfValues[this._globalPulseArray[ii][1]][0];
			
			//console.log("pulseStartTime=", PulsestartT, "pulseEndTime=", PulseEndT);
			T1 = PulsestartT + (PulseEndT - PulsestartT)/3;
			T2 = PulsestartT + (currDiscontVal)*(PulseEndT - PulsestartT)/3;
			console.log("T1 time slot = ", T1, "T2 time slot = ", T2);

			// TODO: use pulseStartKfIndex (and pulseEndKfIndex) instead of pulseArray[ii][0] inside loop.
			pulseStartKfIndex = this._globalPulseArray[ii][0];
			pulseEndKfIndex = this._globalPulseArray[ii][1];
			// check keyframes between pulseStartKfIndex and pulseEndKfIndex, and update their amplitudes.Assigning 0 to keyframe amplitude.
			for (var intervalIndex=pulseStartKfIndex; intervalIndex <= pulseEndKfIndex; intervalIndex++) {
				// currKfTime = keyframes[intervalIndex][0];
				currKfTime = this._initialKfValues[intervalIndex][0];
				if ((currKfTime >= T1) && (currKfTime <= T2)) {
					console.log("assigning 0 to keyframes[%d] amplitude since its time: %f falls within {%f, %f} time range",
						intervalIndex, currKfTime, T1, T2)
					// assign 0 to the amplitude of this keyframe, since
					// keyframes[intervalIndex][1] actually corresponds to
					// this._data["main"].parameters["amplitude"].data[intervalIndex].value
					// we just need to assign 0 to the latter and redraw keyframes.
					// Note that making keyframes[intervalIndex][1]=0 would not actually change
					// our graph on the browser, since the browser graph is drawn using values at
					// this._data["main"].parameters["amplitude"].data[intervalIndex].value
					this._data["main"].parameters["amplitude"].data[intervalIndex].value = 0
				} else {
					// TODO(dilorom): change this log message accordingly
					// console.log("not changing keyframes[%d] since its time: %f does not fall within {%f, %f} time range",
					// 	intervalIndex, currKfTime, T1, T2)
					this._data["main"].parameters["amplitude"].data[intervalIndex].value = this._initialKfValues[intervalIndex][1]
				}
				//this if condition breaks if dead loop happens
				// if (intervalIndex == 150) {
				// 	console.log('hit the max, intervalIndex = %d', intervalIndex);
				// 	break;
				// }
			}
			// if (intervalIndex == 150) {
			// 	console.log('hit the outer max, ii = %d', ii);
			// 	break;
			// }
		}
		// redraw keyframes with updated values
		this.trigger(this._data);
	},

	//this function detects pulse start
	_pulseStart(currIndex, keyframes) {
		// the first keyframe is always t1
	 	if (currIndex == 0) {
			return currIndex;
		}
		// t1 can never be the last keyframe. Return error if called with the last keyframe
	 	if (currIndex == keyframes.length-1) 
	 	{
			console.log("_pulseStart is called for the last keyframe (index=%d). Returning -1 to indicate there is no more pulse.", currIndex);
			return -1;
		}

		var thres = 0.01; // threshold to decide equality of two coordinates
		// var t1 = currIndex;
		var delta = 0;
		for (var ii = currIndex; ii < keyframes.length-1; ii++) {
			if ((keyframes[ii][1] < 0.01) && (keyframes[ii+1][1] < 0.01)) {
				delta = Math.abs(keyframes[ii][1] - keyframes[ii+1][1]) 
				if (delta <= thres) {
					return(ii + 1);
				} else {
					//console.log("delta = %f, moving on to the next keyframe", delta)
				}
			}
			
		}
	},

	//this function detects pulse end
	_pulseEnd(currIndex, keyframes) {
		// the last keyframe is always t2
	 	if (currIndex == keyframes.length - 1) {
			//console.log("returning the last keyframe as t2")
			return currIndex;
		}
		// if the next keyframe is last, then that is t2
		if (currIndex+1 == keyframes.length - 1) {
			return currIndex+1;
		}
		var thres = 0.01; // threshold to decide equality of two coordinates
		var delta = 0;
		var ii = 0;
		for (ii = currIndex+1; ii < keyframes.length-1; ii++) {
			if ((keyframes[ii][1] < 0.01) && (keyframes[ii+1][1] < 0.01)) {
				//console.log("endpulse keyframes[ii][1]= %.8f, keyframes[ii+1][1]= %.8f", keyframes[ii][1], keyframes[ii+1][1]);
				delta = Math.abs(keyframes[ii][1] - keyframes[ii+1][1])
				//console.log("delta = %f", delta)
				if (delta <= thres) {
					return ii;
				} else {
					console.log("delta = %f, moving on to the next keyframe", delta)
				}
			}
		}

		console.log("no conditions matched, therefore the last keyframe (index=%d) is t2", ii)
		return ii;
	},




	
	//this function to create 'Tempo parameter' //positive value of the slider decreases Time and negative value increases time
	//T0 =t0
	//T1 = t0+(t1-t0)/2
	//T2 = T1 + (t2-t1)/2

	onTempo(currentAmpTimePos) {
		var currSliderVal = parseFloat(currentAmpTimePos);
		console.log('currSliderVal = ' , currSliderVal);
		var keyframes = [];
		var tempArray = [];
		var keyframesTime = [];
		if (this._initialAmpTimeVal.length == 0) {
			//TODO(dilorom): Explain what this loop does
			for (var ii = 0; ii < this._data["main"].parameters["amplitude"].data.length; ii++) {
				keyframes.push(this._data["main"].parameters["amplitude"].data[ii].t);
				// tempArray.push(this._data["main"].parameters["amplitude"].data[ii].value);
				// keyframes.push(tempArray);
				// //
				// tempArray = [];
				console.log("keyframes[" + ii + "] = " + keyframes[ii]);
			}
			this._initialAmpTimeVal = keyframes;

			//this._initialAmpTimeVal = JSON.parse(JSON.stringify(this._data["main"].parameters["amplitude"].data));
		}
		// print for debugging
		// for (var ii = 0; ii < keyframes.length; ii++) {
		// 	console.log("keyframes[" + ii + "] = " + keyframes[ii]);
		// }
		// keyframes only time value
		// for (var ii = 0; ii < this._initialAmpTimeVal.length; ii++) {
		// 	keyframesTime.push(this._initialAmpTimeVal[ii][0]);
		// 	console.log("keyframesTime[" + ii + "] = " + keyframesTime[ii]);
		// }

		//deltaTime
		var deltaTime = [];
		var delta;
		for (var ii = 0; ii < (this._initialAmpTimeVal.length-1); ii++) {
			delta = this._initialAmpTimeVal[ii+1] - this._initialAmpTimeVal[ii];
			deltaTime.push(delta);
			console.log("deltaTime[" + ii + "] = " + deltaTime[ii]);
		}
		//define timePrime(To be time value)
		var timePrime = [];
		for (var ii = 0; ii < this._initialAmpTimeVal.length; ii++) {
			if (currSliderVal == 0) {
				timePrime = this._initialAmpTimeVal;
			} else if (currSliderVal > 0) {
				if (ii == 0) {
					timePrime[0] = this._initialAmpTimeVal[0];
				} else {
					timePrime[ii] = timePrime[ii-1] + (deltaTime[ii-1])/currSliderVal;
				}
			} else if (currSliderVal < 0) {
				if (ii == 0) {
					timePrime[0] = this._initialAmpTimeVal[0];
				} else {
					timePrime[ii] = timePrime[ii-1] + (deltaTime[ii-1])*Math.abs(currSliderVal);
				}
			}
			this._data["main"].parameters["amplitude"].data[ii].t = timePrime[ii];
			//this condition keeps timePrime in the range[0;3000]
			if (this._isValidKeyframeTimePosition(this._data["main"].parameters["amplitude"].data[ii].t)) {
				console.log("timePrime[" + ii + "] = " + timePrime[ii]);
			} else {
				if (this._data["main"].parameters["amplitude"].data[ii].t < 0) {
					this._data["main"].parameters["amplitude"].data[ii].t = 0;
				}
				if (this._data["main"].parameters["amplitude"].data[ii].t > 3000) {
					this._data["main"].parameters["amplitude"].data[ii].t = 3000;
				}
			}
			
		}
		
		this.trigger(this._data);
	},

	onTempoNew(currentFreqTimePos) {
		var currSliderVal = parseFloat(currentFreqTimePos);
		console.log('currSliderVal = ' , currSliderVal);
		var keyframes = [];
		var tempArray = [];
		var keyframesTime = [];
		if (this._initialFreqTimeVal.length == 0) {
			//TODO(dilorom): Explain what this loop does
			for (var ii = 0; ii < this._data["main"].parameters["frequency"].data.length; ii++) {
				keyframes.push(this._data["main"].parameters["frequency"].data[ii].t);
				// tempArray.push(this._data["main"].parameters["frequency"].data[ii].value);
				// keyframes.push(tempArray);
				// //
				// tempArray = [];
				console.log("keyframes[" + ii + "] = " + keyframes[ii]);
			}
			this._initialFreqTimeVal = keyframes;

			//this._initialAmpTimeVal = JSON.parse(JSON.stringify(this._data["main"].parameters["amplitude"].data));
		}
		// print for debugging
		// for (var ii = 0; ii < keyframes.length; ii++) {
		// 	console.log("keyframes[" + ii + "] = " + keyframes[ii]);
		// }
		// keyframes only time value
		// for (var ii = 0; ii < this._initialAmpTimeVal.length; ii++) {
		// 	keyframesTime.push(this._initialAmpTimeVal[ii][0]);
		// 	console.log("keyframesTime[" + ii + "] = " + keyframesTime[ii]);
		// }

		//deltaTime
		var deltaTime = [];
		var delta;
		for (var ii = 0; ii < (this._initialFreqTimeVal.length-1); ii++) {
			delta = this._initialFreqTimeVal[ii+1] - this._initialFreqTimeVal[ii];
			deltaTime.push(delta);
			console.log("deltaTime[" + ii + "] = " + deltaTime[ii]);
		}
		//define timePrime(To be time value)
		var timePrime = [];
		for (var ii = 0; ii < this._initialFreqTimeVal.length; ii++) {
			if (currSliderVal == 0) {
				timePrime = this._initialFreqTimeVal;
			} else if (currSliderVal > 0) {
				if (ii == 0) {
					timePrime[0] = this._initialFreqTimeVal[0];
				} else {
					timePrime[ii] = timePrime[ii-1] + (deltaTime[ii-1])/currSliderVal;
				}
			} else if (currSliderVal < 0) {
				if (ii == 0) {
					timePrime[0] = this._initialFreqTimeVal[0];
				} else {
					timePrime[ii] = timePrime[ii-1] + (deltaTime[ii-1])*Math.abs(currSliderVal);
				}
			}
			this._data["main"].parameters["frequency"].data[ii].t = timePrime[ii];
			//this condition keeps timePrime in the range[0;3000]
			if (this._isValidKeyframeTimePosition(this._data["main"].parameters["frequency"].data[ii].t)) {
				console.log("timePrime[" + ii + "] = " + timePrime[ii]);
			} else {
				if (this._data["main"].parameters["frequency"].data[ii].t < 0) {
					this._data["main"].parameters["frequency"].data[ii].t = 0;
				}
				if (this._data["main"].parameters["frequency"].data[ii].t > 3000) {
					this._data["main"].parameters["frequency"].data[ii].t = 3000;
				}
			}
			
		}
		
		this.trigger(this._data);

	},



	// onTempoNew(currentAmpTimePos) {
	// 	console.log("hello New Tempo combined functions")
	// 	this._tempofreq(currentFreqTimePos);
	// 	this._tempo(currentAmpTimePos);


	// },

//Dilorom

	});

module.exports = {
	actions:vticonActions,
	store:vticonStore
};