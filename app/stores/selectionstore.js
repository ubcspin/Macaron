import Reflux from 'reflux';
var VTIconStore = require('./vticonstore.js');


var selectActions = Reflux.createActions([
			'startSelecting',
			'changeSelecting',

			'startSelectingTimeRange',
			'changeSelectingTimeRange',


			'stopSelecting'
		]);

var selectStore = Reflux.createStore({

	listenables: [selectActions],

	init() {
		this._data = {
			active:false,
			adding:false,
			targetName:"",
			time1:0,
			time2:0,
			parameters: {
				frequency: {
					value1: 0,
					value2: 0
				},
				amplitude: {
					value1: 0,
					value2: 0
				}
			}

		};
	},

	getInitialState() {
		return this._data;
	},


	/*
	* Standard selection (of keyframes)
	*/

	onStartSelecting(targetName, time, parameter_value_map, adding=false) {
		this._data.targetName = targetName;
		this._data.active = true;
		this._data.time1 = time;
		this._data.time2 = time;
		this._data.adding = adding;
		for (var p in parameter_value_map) {
			this._data.parameters[p].value1 = parameter_value_map[p];
			this._data.parameters[p].value2 = parameter_value_map[p];
		}
		this._updateSelectedKeyframes();
		this.trigger(this._data);
	},

	onChangeSelecting(time, parameter_value_map) {
		this._data.time2 = time;
		for (var p in parameter_value_map) {
			this._data.parameters[p].value2 = parameter_value_map[p];
		}
		this._updateSelectedKeyframes();
		this.trigger(this._data);
	},


	/**
	* Time Range Selection
	*/
	onStartSelectingTimeRange(targetName, time) {
		this._data.targetName = targetName;
		this._data.active = true;
		this._data.time1 = time;
		this._data.time2 = time;
		this._updateSelectedTimeRange();
		this.trigger(this._data);
	},

	onChangeSelectingTimeRange(time) {
		this._data.time2 = time;
		this._updateSelectedTimeRange();
		this.trigger(this._data);
	},


	onStopSelecting() {
		this._data.targetName="";
		this._data.active = false;
		this.trigger(this._data);
	},

	_updateSelectedKeyframes() {
		if (this._data.adding) {
			VTIconStore.actions.addSelectedKeyframesInRange(this._data.time1, this._data.time2, this._data.parameters);	
		} else {
			VTIconStore.actions.selectKeyframesInRange(this._data.time1, this._data.time2, this._data.parameters);	
		}
	},

	_updateSelectedTimeRange() {
		VTIconStore.actions.selectTimeRange(this._data.time1, this._data.time2);	
	}

});


module.exports = {
	actions: selectActions,
	store: selectStore
};