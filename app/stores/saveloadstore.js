import Reflux from 'reflux';

var saveLoadActions = Reflux.createActions(
	[
		'save'
	]
);


var saveLoadStore = Reflux.createStore({

	listenables: [saveLoadActions],

	onSave(vticon) {
		var data = JSON.stringify(vticon);
		var url = 'data:text/json;charset=utf8,' + encodeURIComponent(data);
    	window.open(url, '_blank');
    	window.focus();
	}

});


module.exports  = {
	actions:saveLoadActions,
	store:saveLoadStore
};