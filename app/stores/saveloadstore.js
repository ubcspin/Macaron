import Reflux from 'reflux';

var VTIconStore = require('./vticonstore.js');
var LogStore = require('./logstore.js');

var saveLoadActions = Reflux.createActions(
	[
		'save'
	]
);


var saveLoadStore = Reflux.createStore({

	listenables: [saveLoadActions],

	onSave() {
		var data = JSON.stringify(VTIconStore.store.getInitialState()["main"], null, 2);
		LogStore.actions.log("SAVE_"+data);
		var url = 'data:text/json;charset=utf8,' + encodeURIComponent(data);
   		window.open(url, '_blank');
   		window.focus();
	}

});


module.exports  = {
	actions:saveLoadActions,
	store:saveLoadStore
};