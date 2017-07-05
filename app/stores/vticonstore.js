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
		'tempoNew',
		'irregularity'

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
		this._globalSilenceArray = [];
		//declare keyframes as global var
		this._keyframes = [];
		this._initialAmpTimeVal = [];
		this._initialFreqTimeVal = [];
		//irregularity global variable to save initial keyframes value
		this._initialKeyframesVal = [];
		
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
		var T1, T2, middleResult;
		var currDiscontVal = parseFloat(currentDiscontPos);
		console.log("currDiscontVal = %d", currDiscontVal)
		// TODO(dilorom): explain meaning/purpose/intention (what do they do) of these two variables.
		var PulsestartT = [];
		var PulseEndT = [];
		var currKfTime = 0, pulseStartKfIndex = 0, pulseEndKfIndex = 0;
		if (this._initialKfValues.length == 0) {
			console.log("this._initialKfValues = 0")
			var tempArray = [];
			var keyframes = [];
			for (var ii = 0; ii < this._data["main"].parameters["amplitude"].data.length; ii++) {
				tempArray.push(this._data["main"].parameters["amplitude"].data[ii].t);
				tempArray.push(this._data["main"].parameters["amplitude"].data[ii].value);
				keyframes.push(tempArray)
				tempArray = [];
			}
			// print for debugging
			// for (var ii = 0; ii < keyframes.length; ii++) {
			// 	console.log("keyframes[" + ii + "] = " + keyframes[ii]);
			// }
			this._print2DArray("keyframes", keyframes)

			if (keyframes.length <= 1) {
				return
			}
			// deep copy keyframes array's content to middleResult as we will 
			// modify middleResult at runtime, while keeping keyframes content constant.
			middleResult = JSON.parse(JSON.stringify(keyframes));

			var pulseArray = [];
			var t1 = 0; // t1 is pulse start
			var t2 = 0; // t2 is pulse end
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
				tempArray.push(t1);
				tempArray.push(t2);
				pulseArray.push(tempArray);
				tempArray = [];
				kfIndex = t2;
			}
			//these variables are global and they keep initial value of keyframes without changing
			this._initialKfValues = keyframes;
			this._globalPulseArray = pulseArray;
			
		} else {
			console.log("this._initialKfValues != 0")
		}
		//TvaluesArray is a array and it is keeping all T1 and T2 values, I use this array to adding newkeyframes 
		var TvaluesArray = [];
		for (var ii = 0; ii < this._globalPulseArray.length; ii++) {
			PulsestartT = this._initialKfValues[this._globalPulseArray[ii][0]][0];
			PulseEndT = this._initialKfValues[this._globalPulseArray[ii][1]][0];
			T1 = PulsestartT + (PulseEndT - PulsestartT)/3;
			T2 = PulsestartT + (currDiscontVal)*(PulseEndT - PulsestartT)/3;
			console.log("T1 time slot = ", T1, "T2 time slot = ", T2);
			TvaluesArray.push(T1);
			TvaluesArray.push(T2);
			console.log("TvaluesArray = ", TvaluesArray);

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
					// this._data["main"].parameters["amplitude"].data[intervalIndex].value = 0
					middleResult[intervalIndex][1] = 0;
				} else {
					middleResult[intervalIndex][1] = this._initialKfValues[intervalIndex][1];
					// this._data["main"].parameters["amplitude"].data[intervalIndex].value = this._initialKfValues[intervalIndex][1]
				}
			}
		}
		//original keyframes  [[0,0], [10, 0], [20, 0], [30, 0], [40,0], [50, 0], [60, 0], [70, 0], [80,0], [90, 0]]
		// t1 and t2 values in additional array: [[25, 0], [45, 0], [65, 0], [85, 0]]
		//final keyframes must be like this: [[0,0], [10, 0], [20, 0], [25, 0] [30, 0], [40,0], [45, 0], [50, 0], [60, 0], [65, 0], [70, 0], [80,0], [85, 0], [90, 0]]

		// this._print2DArray("keyframes", keyframes)
		// this._print2DArray("middleResult", middleResult)


		// console.log("pre-length = %d", this._data["main"].parameters["amplitude"].data.length)
		// if (currDiscontVal == 2) {
		// 	this._addNewKeyframe("amplitude", T1, 0, false, "main");
		// 	this._addNewKeyframe("amplitude", T2, 0, false, "main");

		// 	// // this._addNewKeyframe("amplitude", 1500, 0.5, false, "main");

		// 	// var lastIndex = intervalIndex-1
		// 	// // this._data["main"].parameters["amplitude"].data.push(this._data["main"].parameters["amplitude"].data[lastIndex])
		// 	// var newLength = this._data["main"].parameters["amplitude"].data.length
		// 	// this._data["main"].parameters["amplitude"].data[newLength-1].t = 1500
		// 	// this._data["main"].parameters["amplitude"].data[newLength-1].value = 0.5
		// }
		// console.log("post-length = %d", this._data["main"].parameters["amplitude"].data.length)

		// redraw keyframes with updated values
		
		//this adds a newkeyframes at T1 and T2 point
		for (var ii = 0; ii < TvaluesArray.length; ii++) {
			//console.log("TvaluesArray[0]", TvaluesArray[0]);
			if ((currDiscontVal == 2) || (currDiscontVal == 3)) {
				this._addNewKeyframe("amplitude", TvaluesArray[ii], 0, false, "main");
				// this._addNewKeyframe("amplitude", TvaluesArray[ii][1], 0, false, "main");
			}
		}

		// go through the modified this._data and synchronize middleResult values
		// with this._data. As an example, it works like this
		// initial this._data = [[10, 5], [20, 6], [30, 7], [40, 8]]
		// which has 3 keyframes. First element of each keyframe is 'time' and the
		// second element is 'value'.
		
		// middleResult = [[10, 5], [20, 0], [30, 0], [40, 8]
		// note the updated 'value' for the second and the third keyframes (t=20,t=30)

		// modified this._data = [[10, 5], [15, 0], [20, 6], [30, 7], [35, 0], [40, 8]]
		// note added [15, 0] and [35, 0] keyframes by this._addNewKeyframe function

		// the following loop will go through modified this._data and whenever 
		// a keyframe has the same 'time' (for middleResult and 'modified this._data')
		// middleResult's 'value' is assigned to the modified this._data. 
		// In other words, whenever 'time' value (the first element of the keyframe)
		// of the modified this._data is equal to 'time' value of the middleResult,
		// modified this._data gets assigned middleResult's 'value'. Conversely,
		// when 'time' values are not equal, this means that particular keyframe 
		// was added to this._data by this._addNewKeyframe function, and
		// this particular keyframe did not exist in initial this._data 
		// (hence, middleResult does not have this keyframe either). These 
		// keyframes will be skipped (will not get assigned middleResult's value)
		// by the following loop, which is exactly what we want. I.e., the final 
		// this._data (to be drawn) will have all keyframes which consists of
		// the union of middleResult keyframes and modified this._data keyframe.
		
		// after the loop the final this._data will look like following
		// final this._data = [[10, 5], [15, 0], [20, 0], [30, 0], [35, 0], [40, 8]]

		var modifiedDataLength = this._data["main"].parameters["amplitude"].data.length;
		var middleResultIndex = 0;
		for (var ii = 0; ii < modifiedDataLength; ii++) {
			if (this._data["main"].parameters["amplitude"].data[ii].t == middleResult[middleResultIndex][0]) {
				this._data["main"].parameters["amplitude"].data[ii].value = middleResult[middleResultIndex][1];
				console.log("assigned new value=%f to this._data on t=%d", 
					middleResult[middleResultIndex][1],
					this._data["main"].parameters["amplitude"].data[ii].t);
				middleResultIndex += 1
			} else {
				console.log("keeping value=%f for this._data on t=%d", 
					this._data["main"].parameters["amplitude"].data[ii].value,
					this._data["main"].parameters["amplitude"].data[ii].t);
			}
		}

		// note that the loop above assumes data is sorted by 'time' for 
		// middleResult and modified this._data array. This is true by design,
		// i.e., our middleResult is sorted since our 'keyframes' were sorted,
		// and modified this._data is also sorted since _addNewKeyframe sorted
		// array after inserting a new keyframe.
		// This also assumes modified this._data is a superset of the middleResult,
		// which is also true by design. I.e., modified this._data contains all
		// keyframes middleResult has, since modified this._data was constructed
		// by adding more keyframes with _addNewKeyframe function.
		
		// restore keyframes content on middleResult for the next round,
		// when another discontinuety value is selected.
		middleResult = JSON.parse(JSON.stringify(keyframes));

		console.log("this._data =", this._data);
		this.trigger(this._data);

	},

	_print2DArray(arr_name, arr_content) {
		const util = require('util');
		var result = "[", temp = "";
		for (var ii = 0; ii < arr_content.length; ii++) {
			temp = util.format("[%d, %d], ", arr_content[ii][0].toFixed(2), arr_content[ii][1].toFixed(4));
			result = util.format("%s%s", result, temp)
		}
		result = util.format("%s]", result)
		console.log("%s = %s", arr_name, result);
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

	//this function to creates 'Tempo parameter' for the amplitude
	//positive value of the slider decreases Time and negative value increases time
	//T0 =t0
	//T1 = t0+(t1-t0)/2
	//T2 = T1 + (t2-t1)/2

	onTempo(currentAmpTimePos) {
		var currSliderVal = parseFloat(currentAmpTimePos);
		console.log('currSliderVal = ' , currSliderVal);
		var keyframes = [];
		var keyframesTime = [];
		if (this._initialAmpTimeVal.length == 0) {
			for (var ii = 0; ii < this._data["main"].parameters["amplitude"].data.length; ii++) {
				keyframes.push(this._data["main"].parameters["amplitude"].data[ii].t);
				console.log("keyframes[" + ii + "] = " + keyframes[ii]);
			}
			this._initialAmpTimeVal = keyframes;
		}
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
	//this function to creates 'Tempo parameter' for the frequency
	//positive value of the slider decreases Time and negative value increases time
	//T0 =t0
	//T1 = t0+(t1-t0)/2
	//T2 = T1 + (t2-t1)/2
	onTempoNew(currentFreqTimePos) {
		var currSliderVal = parseFloat(currentFreqTimePos);
		console.log('currSliderVal = ' , currSliderVal);
		var keyframes = [];
		var keyframesTime = [];
		if (this._initialFreqTimeVal.length == 0) {
			//this loop is pushing each keyframe Time value to keyframes variable
			for (var ii = 0; ii < this._data["main"].parameters["frequency"].data.length; ii++) {
				keyframes.push(this._data["main"].parameters["frequency"].data[ii].t);
				console.log("keyframes[" + ii + "] = " + keyframes[ii]);
			}
			this._initialFreqTimeVal = keyframes;
		}
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
			
			//this condition keeps timePrime in the Time range[0;3000]
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


	//This function creates irregularity parameter
	onIrregularity(currentIrregPos) {
		// var T1, T2;
		var currSliderVal = parseFloat(currentIrregPos);
		console.log("currSliderVal =", currSliderVal);
		
		 if (this._initialKeyframesVal.length == 0) {
			console.log("this._initialKfValues = 0")
			var tempArray = [];
			var keyframes = [];
			for (var ii = 0; ii < this._data["main"].parameters["amplitude"].data.length; ii++) {
				tempArray.push(this._data["main"].parameters["amplitude"].data[ii].t);
				tempArray.push(this._data["main"].parameters["amplitude"].data[ii].value);
				keyframes.push(tempArray)
				tempArray = [];
			}
			// print for debugging
			// for (var ii = 0; ii < keyframes.length; ii++) {
			// 	console.log("keyframes[" + ii + "] = " + keyframes[ii]);
			// }
			if (keyframes.length <= 1) {
				return
			}

			var silenceArray = [];
			var s1 = 0; // s1 is silence start
			var s2 = 0; // s2 is silence end
			//SilenceStart never starts from the first keyframe
			var kfIndex = 1;
			
			while (kfIndex < keyframes.length) {
				s1 = this._silenceStart(kfIndex, keyframes);
				if (s1 == -1) {
					console.log("got -1 from _silenceStart. This means no more silence")
					break;
				} else {
					console.log("returned from _silenceStart = %d", s1)
				}
				s2 = this._silenceEnd(s1, keyframes);
				tempArray.push(s1);
				tempArray.push(s2);
				silenceArray.push(tempArray);
				tempArray = [];
				kfIndex = s2;
			}
			//these variables are global and they keep initial value of keyframes without changing
			this._initialKeyframesVal = keyframes;
			this._globalSilenceArray = silenceArray;
			console.log(this._globalSilenceArray);
			//console.log("this._initialKeyframesVal = ", this._initialKeyframesVal);
			
		} else {
			console.log("this._initialKeyframesVal != 0")
		}
		//1232
		var silenceStartT =[];
		var silenceEndT =[];
		var deltaT = 0;
		var ranT;
		for (var ii = 0; ii < this._globalSilenceArray.length; ii++) {
			silenceStartT = this._initialKeyframesVal[this._globalSilenceArray[ii][0]][0];
			silenceEndT = this._initialKeyframesVal[this._globalSilenceArray[ii][1]][0];
			deltaT = silenceEndT - silenceStartT;
			//randT = myArray[Math.floor(Math.random() * this._globalSilenceArray.length)];
			console.log('silenceStartT =', silenceStartT, 'silenceEndT =', silenceEndT);
			console.log("deltaT =", deltaT);

		}
		
		



// for (var ii = 0; ii < this._globalPulseArray.length; ii++) {
// 			PulsestartT = this._initialKfValues[this._globalPulseArray[ii][0]][0];
// 			PulseEndT = this._initialKfValues[this._globalPulseArray[ii][1]][0];
// 			T1 = PulsestartT + (PulseEndT - PulsestartT)/3;
// 			T2 = PulsestartT + (currDiscontVal)*(PulseEndT - PulsestartT)/3;
// 			console.log("T1 time slot = ", T1, "T2 time slot = ", T2);
// //deltaT/4; 2*deltaT/4; 3*deltaT/4

		// var currSliderVal = parseFloat(currentIrregPos);
		// console.log("currSliderVal =", currSliderVal);
		// var keyframes = [];
		// var keyframesVal = [];
		// if (this._initialKeyframesVal.length == 0) {
		// 	//this loop is pushing each keyframe Time value to keyframes variable
		// 	for (var ii = 0; ii < this._data["main"].parameters["amplitude"].data.length; ii++) {
		// 		keyframesVal.push(this._data["main"].parameters["amplitude"].data[ii].value);
		// 		console.log("keyframesVal[" + ii + "] = " + keyframesVal[ii]);
		// 	}
		// 	this._initialKeyframesVal = keyframesVal;
		// }

		// var thres = 0.01; // threshold to decide equality of two coordinates
		// var delta = 0;
		// // pulseArray = [[1,3], [5,7], [9,11]]
		// //slots = [[1,2,3], [5,6,7], [9,10,11]]
		// //slot = [[1,3], [5,7], [9, 11]] this correct!
		// // var tempArray = [];
		// // 	var keyframes = [];
		// // 	for (var ii = 0; ii < this._data["main"].parameters["amplitude"].data.length; ii++) {
		// // 		tempArray.push(this._data["main"].parameters["amplitude"].data[ii].t);
		// // 		tempArray.push(this._data["main"].parameters["amplitude"].data[ii].value);
		// // 		keyframes.push(tempArray)
		// // 		tempArray = [];
		// // 	}



		// var tempArray = [];
		// var silence = []; // [1,2,3, 5,6,7, 9, 10, 11]
		// for (var ii = 1; ii < this._initialKeyframesVal.length-1; ii++) {
		// 	if ((this._initialKeyframesVal[ii] < 0.01) && (this._initialKeyframesVal[ii+1] < 0.01)) {
		// 		//delta = Math.abs(this._initialKeyframesVal[ii] - this._initialKeyframesVal[ii+1]) 
		// 		console.log("this._initialKeyframesVal[" + ii + "] = " + this._initialKeyframesVal[ii], "this._initialKeyframesVal[" + (ii + 1) +"] = " + this._initialKeyframesVal[ii+1]);
		// 		tempArray.push(this._initialKeyframesVal[ii]);
		// 		tempArray.push(this._initialKeyframesVal[ii+1]);
		// 		silence.push(tempArray);

		// 		//console.log("silence[" + ii + "] = " + silence);
		// 	}

		// }
		// //print for debugging
		// for (var ii = 0; ii < silence.length; ii++) {
		// 		console.log("silence[" + ii + "] = " + silence[ii]);
		// 	}
		// 	if (silence.length <= 1) {
		// 		return`
		// 	}

		// // var rand = myArray[Math.floor(Math.random() * myArray.length)];
		// //AddTime = currSliderVal*(t1-t2)/4;


	},



	_silenceStart(currIndex, keyframes) {
		// //the first keyframe is always t1
	 // 	if (currIndex == 0) {
		// 	return currIndex;
		// }
		// // t1 can never be the last keyframe. Return error if called with the last keyframe
	 	if (currIndex > keyframes.length) {
	 		console.log("_silenceStart is called for the last keyframe (index=%d). Returning -1 to indicate there is no more silence.", currIndex);
	 		return -1;
	 	}

		var thres = 0.01; // threshold to decide equality of two coordinates
		var s1 = currIndex;
		var delta = 0;
		for (var ii = currIndex; ii < keyframes.length-1; ii++) {
			if ((keyframes[ii][1] < thres) && (keyframes[ii+1][1] < thres)) {
				// delta = Math.abs(keyframes[ii][1] - keyframes[ii+1][1]) 
				// if (delta <= thres) {
				// 	return(ii);
				// } else {
				// 	console.log("delta = %f, moving on to the next keyframe", delta)
				// }
				return ii;
			}
		}
		return -1;
	},

	//this function detects pulse end
	_silenceEnd(currIndex, keyframes) {
		var thres = 0.01; // threshold to decide equality of two coordinates
		var delta = 0;
		var ii = 0;
		for (ii = currIndex; ii < keyframes.length-1; ii++) {
			if ((keyframes[ii][1] < thres) && (keyframes[ii+1][1] > thres)) {
				// //console.log("endpulse keyframes[ii][1]= %.8f, keyframes[ii+1][1]= %.8f", keyframes[ii][1], keyframes[ii+1][1]);
				// delta = Math.abs(keyframes[ii][1] - keyframes[ii+1][1])
				// //console.log("delta = %f", delta)
				// if (delta <= thres) {
				// 	return(ii);
				// } else {
				// 	console.log("delta = %f, moving on to the next keyframe", delta)
				// }
				return ii;

			}
		}
		console.log("no conditions matched, therefore the last keyframe (index=%d) is s2", ii)
		return -1;
	},

//Coding Dilorom//

	});

module.exports = {
	actions:vticonActions,
	store:vticonStore
};