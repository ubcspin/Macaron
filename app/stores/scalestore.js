import Reflux from 'reflux';
import d3 from 'd3';

var VTIconStore = require('./vticonstore.js');


var scaleActions = Reflux.createActions([
			'setTimelineRange',
			'setTrackrange',
			'setTrackrangeMultiple',
			'setTopOffset',
			'setTopOffsetMultiple'
		]);

var scaleStore = Reflux.createStore({

	listenables: [scaleActions],

	init() {
		var stub_fn = d3.scale.identity();
		this._data = {
			scaleTimeline:stub_fn,
			scaleParameter:{
				amplitude:stub_fn,
				frequency:stub_fn
			},
			topOffsetParameter:{
				amplitude:0,
				frequency:0
			}
		};

		this._parameterValues = {}
		this._duration = 0;
		this.listenTo(VTIconStore.store, this._VTIconUpdate);

		this._trackrange = {}
		this._timelinerange = [];

	},

	getInitialState : function() {
		this._CalculateScales(VTIconStore.store.getInitialState());
		return this._data;
	},

	_update() {
		this._data.scaleTimeline = d3.scale.linear()
                .domain([0, this._duration])
                .range(this._timelinerange);
        for (var p in this._trackrange) {
        	this._data.scaleParameter[p] = d3.scale.linear()
                .domain(this._parameterValues[p])
                .range(this._trackrange[p]);
        }
		this.trigger(this._data);
	},

	_CalculateScales(vticon) {
		this._duration = vticon.duration;
		for (var p in vticon.parameters)
		{
			this._parameterValues[p] = vticon.parameters[p].valueScale;
		}
	},

	_VTIconUpdate(vticon) {
		this._CalculateScales(vticon);
		this._update();
	},

	onSetTimelineRange(range) {
		this._timelinerange = range;
		this._update();
	},

	onSetTrackrange(parameter, range) {
		this._trackrange[parameter] = range;

		this._update();
	},

	onSetTrackrangeMultiple(parameter_range_map) {
		for (var p in parameter_range_map)
		{
			this._trackrange[p] = parameter_range_map[p];
		}

		this._update();
	},

	onSetTopOffset(parameter, offset) {
		this._data.topOffsetParameter[parameter] = offset;

		this._update();
	},

	onSetTopOffsetMultiple(parameter_offset_map) {
		for (var p in parameter_offset_map)
		{
			this._data.topOffsetParameter[p] = parameter_offset_map[p];
		}

		this._update();
	}


});


module.exports = {
	store:scaleStore,
	actions:scaleActions
};
