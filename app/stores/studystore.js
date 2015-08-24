import Reflux from 'reflux';

var LogStore = require('./logstore.js');


var DisplayModes = {
	NO_EXAMPLES:0,
	 LOWVIS_LOWSELECT:1,
	 HIGHVIS_LOWSELECT:2,
	 LOWVIS_HIGHSELECT:3,
	HIGHVIS_HIGHSELECT:4
};

var studyActions = Reflux.createActions(
	[
		'setDisplayMode'
	]
);

var studyStore = Reflux.createStore({

	listenables:[studyActions],

	init: function() {
		this._data = {
			currentMode:LogStore.store.getInitialState().currentMode,
			// currentMode:DisplayModes.HIGHVIS_HIGHSELECT,
			modes:DisplayModes
		};
	},

	getInitialState() {
		return this._data;
	},

	onSetDisplayMode(displayMode) {
		// console.log("displayMode", displayMode);
		if (displayMode in DisplayModes)
		{
			this._data.currentMode = displayMode;
			this.trigger(this._data);
		}
	}

});


module.exports = {
	store: studyStore,
	actions:studyActions
};
