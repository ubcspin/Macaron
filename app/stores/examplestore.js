import Reflux from 'reflux';


var examples = {
	test1: {
			selected:true,
			duration: 3000, //ms

			parameters: {
				amplitude: {
					valueScale:[0,1], //normalized
					data : [
						{ t: 600, value:0.5}, 
						{ t: 1500, value:1 }]
				},

				frequency: {
					valueScale:[50,500], //Hz
					data : [
						{ t: 0, value:250}, 
						{ t: 1800, value:500}]
				}
			}
		}
};

var exampleActions = Reflux.createActions(
	[
	]);


var exampleStore = Reflux.createStore({

	listenables: [exampleActions],

	init() {
		this._data = {
			selected:"test1",
			examples:examples
		};
	},

	getInitialState() {
		return this._data;
	}

});


module.exports = {
	actions:exampleActions,
	store:exampleStore
};

