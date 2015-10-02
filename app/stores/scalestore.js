import Reflux from 'reflux';
import d3 from 'd3';

var VTIconStore = require('./vticonstore.js');


var scaleActions = Reflux.createActions([
			'setTimelineRange',
			'setTrackrange',
			'setTrackrangeMultiple',
			'setLeftOffset',
			'setTopOffset',
			'setTopOffsetMultiple'
		]);

var scaleStore = Reflux.createStore({

	listenables: [scaleActions],

	init() {
		var stub_fn = d3.scale.identity();
		this._names = ["main", "example"];

		this._parameterValues = {};
		this._duration = {};
		this._trackrange = {};
		this._timelinerange = {};

		this._data = {};
		for (var i = 0; i < this._names.length; i++) {
			this._data[this._names[i]] = {
				scaleTimeline:stub_fn,
				scaleParameter:{
					amplitude:stub_fn,
					frequency:stub_fn,
					ampTex:stub_fn,
					freqTex:stub_fn,
					bias:stub_fn
				},
				leftOffset:0,
				topOffsetParameter:{
					amplitude:0,
					frequency:0,
					ampTex:0,
					freqTex:0,
					bias:0
				}			
			};

		this._parameterValues[this._names[i]] = {};
		this._duration[this._names[i]] = 0;
		this._trackrange[this._names[i]] = {}
		this._timelinerange[this._names[i]] = [];

		}
		
		this.listenTo(VTIconStore.store, this._VTIconUpdate);
	},

	getInitialState : function() {
		this._CalculateScales(VTIconStore.store.getInitialState());
		return this._data;
	},

	_update() {
		for (var i = 0; i < this._names.length; i++) {
			this._data[this._names[i]].scaleTimeline = d3.scale.linear()
                .domain([0, this._duration[this._names[i]]])
                .range(this._timelinerange[this._names[i]]);
        	for (var p in this._trackrange[this._names[i]]) {
	        	this._data[this._names[i]].scaleParameter[p] = d3.scale.linear()
	                .domain(this._parameterValues[this._names[i]][p])
	                .range(this._trackrange[this._names[i]][p]);
	        }
		}
		
		this.trigger(this._data);
	},

	_CalculateScales(vticons) {
		for (var n in vticons)
		{
			this._duration[n] = vticons[n].duration;
			for (var p in vticons[n].parameters)
			{
				this._parameterValues[n][p] = vticons[n].parameters[p].valueScale;
			}
		}
		
	},

	_VTIconUpdate(vticon) {
		this._CalculateScales(vticon);
		this._update();
	},

	onSetTimelineRange(name, range) {
		this._timelinerange[name] = range;
		this._update();
	},

	onSetTrackrange(name, parameter, range) {
		this._trackrange[name][parameter] = range;

		this._update();
	},

	onSetTrackrangeMultiple(name, parameter_range_map) {
		for (var p in parameter_range_map)
		{
			this._trackrange[name][p] = parameter_range_map[p];
		}

		this._update();
	},

	onSetLeftOffset(name, offset) {
		this._data[name].leftOffset = offset;
		this._update();
	},

	onSetTopOffset(name, parameter, offset) {
		this._data[name].topOffsetParameter[parameter] = offset;

		this._update();
	},

	onSetTopOffsetMultiple(name, parameter_offset_map) {
		for (var p in parameter_offset_map)
		{
			this._data[name].topOffsetParameter[p] = parameter_offset_map[p];
		}

		this._update();
	}


});


module.exports = {
	store:scaleStore,
	actions:scaleActions
};
