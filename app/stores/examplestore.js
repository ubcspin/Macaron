import Reflux from 'reflux';

var VTIconStore = require('./vticonstore.js');
var EXAMPLE_KEY = "example"; //TODO: More general?

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
		},

	test2: {
			selected:false,
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
						{ t: 200, value:300}, 
						{ t: 1200, value:500}, 
						{ t: 2400, value:100}]
				}
			}
		},

	test3: {
			selected:false,
			duration: 3000, //ms

			parameters: {
				amplitude: {
					valueScale:[0,1], //normalized
					data : [
						{ t: 600, value:0.5}, 
						{ t: 1500, value:0.75 },
						{ t: 2100, value:0.5}, 
						{ t: 2900, value:0.25 }]
				},

				frequency: {
					valueScale:[50,500], //Hz
					data : [
						{ t: 0, value:250}, 
						{ t: 1500, value:400}]
				}
			}
		},
};

var exampleActions = Reflux.createActions(
	[
		'selectExample'
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
	},

	onSelectExample(newName) {
		var foundName = "";
		for (var ex in this._data.examples) {
			if (ex === newName)
			{
				foundName = ex;
			}
		}

		if (foundName != "")
		{
			this._data.selected=foundName;
			for (var ex in this._data.examples) {
				this._data.examples[ex].selected = (ex === foundName);
			}
			VTIconStore.actions.setVTIcon(this._data.examples[foundName], name=EXAMPLE_KEY);
		}

		this.trigger(this._data);
	}

});


module.exports = {
	actions:exampleActions,
	store:exampleStore
};

