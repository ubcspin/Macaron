import Reflux from 'reflux';


var vticonActions = Reflux.createActions(
	[
		'newKeyframe',

		'selectKeyframe',
		'selectKeyframes',
		'addSelectedKeyframe',
		'addSelectedKeyframes',
		'addToggleSelectedKeyframe',
		'unselectKeyframe',
		'unselectKeyframes'
	]

);


var vticonStore = Reflux.createStore({

	listenables: [vticonActions],

	init : function() {
		this._data = {
						duration: 3000, //ms

						parameters: {
							amplitude: {
								valueScale:[0,1], //normalized
								data : [
									{ id: 0, t: 600, value:0.5, selected:true}, 
									{ id: 1, t: 1500, value:1, selected:false},
									{ id: 2, t: 3000, value:0, selected:false}]
							},

							frequency: {
								valueScale:[50,500], //Hz
								data : [
									{ id: 3, t: 0, value:250, selected:false}, 
									{ id: 4, t: 1200, value:50, selected:false},
									{ id: 5, t: 1800, value:500, selected:false}]
							}
						}
					};

		this._kfuidCount = 6;
	},

	getInitialState : function() {
		return this._data;

	},

	onNewKeyframe(parameter, t, value, addToSelection=false) {
		var new_id = this._getNewKFUID();
		this._data.parameters[parameter].data.push({
			id:new_id,
			t:t,
			value:value,
			selected:true
		});

		this._data.parameters[parameter].data.sort(this._keyframeCompare);

		if (addToSelection)
		{
			this.trigger(this._data);
		} else {
			this.onSelectKeyframe(new_id);
		}
	},

	/**
	* Selection
	*/

	onSelectKeyframe(id) {
		this._setSelectedKeyframes([id], true);
	},

	onSelectKeyframes(ids) {
		this._setSelectedKeyframes(ids, true);
	},

	onAddSelectedKeyframe(id) {
		this._setSelectedKeyframes([id], false);
	},

	onAddSelectedKeyframes(ids) {
		this._setSelectedKeyframes(ids, true);
	},

	onAddToggleSelectedKeyframe(id) {
		for (var p in this._data.parameters) {
			for (var i = 0; i < this._data.parameters[p].data.length; i++) {
				if(this._data.parameters[p].data[i].id == id)
				{
					this._data.parameters[p].data[i].selected = !this._data.parameters[p].data[i].selected;
				}
			}
		}
		this.trigger(this._data);
	},

	onUnselectKeyframe(id) {
		this._setUnselectedKeyframes([id], false);
	},

	onUnselectKeyframes() {
		for (var p in this._data.parameters) {
			for (var i = 0; i < this._data.parameters[p].data.length; i++) {
					this._data.parameters[p].data[i].selected = false;
			}
		}
		this.trigger(this._data);
	},

	//helpers
	//need to refactor into one function at some point?

	_setSelectedKeyframes(ids, setUnselected) {
		for (var p in this._data.parameters) {
			for (var i = 0; i < this._data.parameters[p].data.length; i++) {
				if (ids.indexOf(this._data.parameters[p].data[i].id) >= 0 ) {
					this._data.parameters[p].data[i].selected = true;
				} else if (setUnselected) {
					this._data.parameters[p].data[i].selected = false;
				}
			}
		}
		this.trigger(this._data);
	},

	_setUnselectedKeyframes(ids, setSelected) {
		for (var p in this._data.parameters) {
			for (var i = 0; i < this._data.parameters[p].data.length; i++) {
				if (ids.indexOf(this._data.parameters[p].data[i].id) >= 0 ) {
					this._data.parameters[p].data[i].selected = false;
				} else if (setSelected) {
					this._data.parameters[p].data[i].selected = true;
				}
			}
		}
		this.trigger(this._data);
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
	}



	});




module.exports = {
	actions:vticonActions,
	store:vticonStore
};