import Reflux from 'reflux';


var vticonActions = Reflux.createActions(
	[
		'newKeyframe'
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
									{ id: 0, t: 600, value:0.5}, 
									{ id: 1, t: 1500, value:1},
									{ id: 2, t: 3000, value:0}]
							},

							frequency: {
								valueScale:[50,500], //Hz
								data : [
									{ id: 3, t: 0, value:250}, 
									{ id: 4, t: 1200, value:50},
									{ id: 5, t: 1800, value:500}]
							}
						}
					};

		this._kfuidCount = 6;
	},

	getInitialState : function() {
		return this._data;

	},

	onNewKeyframe(parameter, t, value) {
		this._data.parameters[parameter].data.append({
			id:this._getNewKFUID(),
			t:t,
			value:value
		});
	},


	/**
	* KFUID helper functions
	*/

	//returns a new, unique, kfid
	_getNewKFUID(parameter) {
		this._kfuidCount  += 1;
		return this._kfuidCount;
	}



	});




module.exports = {
	actions:vticonActions,
	store:vticonStore
};