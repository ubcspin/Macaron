import Reflux from 'reflux';

var DisplayModes = {
	NO_EXAMPLES :0,
	// LOWVIS_LOWSELECT:1,
	// HIGHVIS_LOWSELECT:2,
	// LOWVIS_HIGHSELECT:3
	HIGHVIS_HIGHSELECT:4
};

var studyActions = Reflux.createActions(
	[
		'setDisplayMode'
	]
);

var animationStore = Reflux.createStore({

	init: function() {
		this._data = {
			currentMode:DisplayModes.NO_EXAMPLES,
			modes:DisplayModes
		};
	},

	getInitialState() {
		return this._data;
	},

	onSetDisplayMode(displayMode) {
		if (displayMode in DisplayModes)
		{
			this._data.currentMode = displayMode;
			this.trigger(this._data);
		}
	}

});


module.exports = {
	store: animationStore,
	actions:studyActions
};
