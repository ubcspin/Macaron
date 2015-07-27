import Reflux from 'reflux';


var selectActions = Reflux.createActions([
			'startSelecting',
			'changeSelecting',
			'stopSelecting'
		]);

var selectStore = Reflux.createStore({

	listenables: [selectActions],

	init() {
		this._data = {
			active:false,
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


	onStartSelecting(time, parameter_value_map) {
		this._data.active = true;
		this._data.time1 = time;
		this._data.time2 = time;
		for (var p in parameter_value_map) {
			this._data.parameters[p].value1 = parameter_value_map[p];
			this._data.parameters[p].value2 = parameter_value_map[p];
		}
		this.trigger(this._data);
	},

	onChangeSelecting(time, parameter_value_map) {
		this._data.time2 = time;
		for (var p in parameter_value_map) {
			this._data.parameters[p].value2 = parameter_value_map[p];
		}
		this.trigger(this._data);
	},

	onStopSelecting() {
		this._data.active = false;
		this.trigger(this._data);
	}
});


module.exports = {
	actions: selectActions,
	store: selectStore
};