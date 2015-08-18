import Reflux from 'reflux';

var exampleActions = Reflux.createActions(
	[
	]);


var exampleStore = Reflux.createStore({

	listenables: [exampleActions],

	init() {
		this._data = {};
	},

	getInitialState() {
		return this._data;
	};

});


module.exports = {
	actions:exampleActions;
	store:exampleStore;
};

