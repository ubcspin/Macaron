import Reflux from 'reflux';

var VTIconStore = require('./vticonstore.js');
var PlaybackStore = require('./playbackstore.js');

var clipboardActions = Reflux.createActions(
	[
		'copy',
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
		this._vticon = {};
		this.listenTo(VTIconStore.store, this._VTIconUpdate);

		//setup playback observation
		this._currentTime = 0;
		this.listenTo(PlaybackStore.store, this._playbackUpdate);
	},

	_VTIconUpdate(vticon) {
		this._vticon = vticon;
	},

	_playbackUpdate(playback) {
		this._currentTime = playback.currentTime;
	},

	onCopy() {
		this._clipboard = {};
		this._lowest_time = this._vticon.duration;
		for (var p in this._vticon.parameters)
		{
			var keyframes_to_add = [];
			for (var i = 0; i < this._vticon.parameters[p].data.length; i++) {
				var d = this._vticon.parameters[p].data[i];
				if (d.selected) {
					this._lowest_time = Math.min(this._lowest_time, d.t);
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
				this._clipboard[p] = keyframes_to_add;
			}
		}
		this.trigger(this._clipboard);
	},

	onCut() {
		console.log("Error: Cut is not implemented!");
	},

	onPaste(overwrite=true) {
		var to_paste = {};
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
			}
		}
		VTIconStore.actions.newMultipleKeyframes(to_paste, overwrite=overwrite);
	}

});


module.exports = {
	actions:clipboardActions,
	store:clipboardStore
};

