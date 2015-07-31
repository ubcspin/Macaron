import Reflux from 'reflux';

var VTIconStore = require('./vticonstore.js');

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
		this.clipboard = {};0
	},

	onCopy() {

	},

	onCut() {

	},

	onPaste() {
		
	}

});


module.exports = {
	actions:clipboardActions,
	store:clipboardStore
};

