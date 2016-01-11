import Reflux from 'reflux';

var VTIconStore = require('./vticonstore.js');
var PlaybackStore = require('./playbackstore.js');
var LogStore = require('./logstore.js');

var clipboardActions = Reflux.createActions(
	[
		'copy',
		'copyTimeRange',
		'cut',
		'paste'
	]
);


var clipboardStore = Reflux.createStore({

	listenables: [clipboardActions],

	init: function() {
		//init data
		this._clipboard = {};
		this._lowest_time = 0;

		//setup vticon observation
		this._vticons = {};
		this.listenTo(VTIconStore.store, this._VTIconUpdate);

		//setup playback observation
		this._currentTime = 0;
		this.listenTo(PlaybackStore.store, this._playbackUpdate);
	},

	_VTIconUpdate(vticons) {
		this._vticons = vticons;
	},

	_playbackUpdate(playback) {
		this._currentTime = playback.currentTime;
	},

	onCopy() {
		this._clipboard = {};
		for (var n in this._vticons)
		{
			if (this._vticons[n].selected)
			{
				this._lowest_time = this._vticons[n].duration;
				this._highest_time = 0;
				for (var p in this._vticons[n].parameters)
				{
					var keyframes_to_add = [];
					for (var i = 0; i < this._vticons[n].parameters[p].data.length; i++) {
						var d = this._vticons[n].parameters[p].data[i];
						if (d.selected) {
							this._lowest_time = Math.min(this._lowest_time, d.t);
							this._highest_time = Math.max(this._highest_time, d.t);
							keyframes_to_add.push(
							{
								t:d.t,
								value:d.value,
								selected:true
							}
								);
						}
					}

					if (keyframes_to_add.length > 0)
					{
						LogStore.actions.log("COPY_"+n+"_"+keyframes_to_add.length+"_"+this._lowest_time+"_"+this._highest_time);
						this._clipboard[p] = keyframes_to_add;
					}
				}
				this.trigger(this._clipboard);

			}
		}
		
	},

	onCopyTimeRange(addEndPoints=true) {
		this._clipboard = {};
		for (var n in this._vticons)
		{
			if (this._vticons[n].selected && this._vticons[n].selectedTimeRange.active)
			{
				this._lowest_time = Math.min(this._vticons[n].selectedTimeRange.time1,
											this._vticons[n].selectedTimeRange.time2);
				this._highest_time = Math.max(this._vticons[n].selectedTimeRange.time1,
											this._vticons[n].selectedTimeRange.time2);

				for (var p in this._vticons[n].parameters)
				{
					var keyframes_to_add = [];
					for (var i = 0; i < this._vticons[n].parameters[p].data.length; i++) {
						var d = this._vticons[n].parameters[p].data[i];
						if (d.t >= this._lowest_time && d.t <= this._highest_time) {
							keyframes_to_add.push(
							{
								t:d.t,
								value:d.value,
								selected:true
							}
								);
						}
					}

					if(addEndPoints) {
						keyframes_to_add.push(
							{
								t:this._lowest_time,
								value:this.interpolateParameter(p, this._lowest_time, this._vticons[n]),
								selected:true
							}
								);

						keyframes_to_add.push(
							{
								t:this._highest_time,
								value:this.interpolateParameter(p, this._highest_time, this._vticons[n]),
								selected:true
							}
								);
					}

					if (keyframes_to_add.length > 0)
					{
						LogStore.actions.log("COPYTIME_"+n+"_"+keyframes_to_add.length+"_"+this._lowest_time+"_"+this._highest_time);
						this._clipboard[p] = keyframes_to_add;
					}
				}
				this.trigger(this._clipboard);

			}
		}

	},

	onCut() {
		console.log("Error: Cut is not implemented!");
	},

	onPaste(overwrite=true) {
		var to_paste = {};
		var pasteCount=0;
		for (var p in this._clipboard)
		{
			to_paste[p] = [];
			for(var i = 0; i < this._clipboard[p].length; i++) 
			{
				var d = this._clipboard[p][i];
				to_paste[p].push({
					t:d.t-this._lowest_time + this._currentTime,
					value:d.value,
					selected:true
				});
				pasteCount+=1;
			}
		}
		LogStore.actions.log("PASTE_"+pasteCount);
		VTIconStore.actions.newMultipleKeyframes(to_paste, overwrite=overwrite);
	},



	//returns parameter value for a given time
	//TODO: Copy+Pasted from VTEditor and waveformpathmixin; needs to be unified 
	// during next refactoring
	interpolateParameter: function(p, t, vticon) {
		var data = vticon.parameters[p].data;
		var prev = null;
		var next = null;

		var rv = null;

		for(var i = 0; i < data.length; i++)
		{
			
			if (data[i].t == t)
			{
				rv = data[i].value;
			}
			else if (data[i].t < t) 
			{
				if (prev == null || prev.t <= data[i].t) {
					prev = data[i];
				}
			} else {
				if (next == null || next.t >= data[i].t) {
					next = data[i];
				}
			}
		}

		if (rv == null)
		{

			if (next == null && prev == null) {
			//if no exact match was found
			if (rv == null)
			{
				//error
				throw "No keyframes found in parameter " + p;
			}
			//if an exact match was found, we already stored rv
				
			} else if (next == null) {
				//use prev
				rv = prev.value;
			} else if (prev == null) {
				//use next
				rv = next.value;
			} else {
				//TODO: not just linear interpolation
				if (prev.t == next.t) 
				{
					rv = prev.value;
				} else {
					var dt = next.t-prev.t;
					var proportionPrev = (t-prev.t)/dt;
					var dvalue = next.value - prev.value;
					rv = proportionPrev*dvalue + prev.value;
					/*
					console.log("INTERPOLATE");
					console.log(t);
					console.log(prev.t, prev.value);
					console.log(next.t, next.value);
					console.log(dt, dvalue);
					console.log(proportionPrev);
					console.log(rv);*/
				}
			}

		}
	
		return rv;

	}

});


module.exports = {
	actions:clipboardActions,
	store:clipboardStore
};

