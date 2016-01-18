import Reflux from 'reflux';

var VTIconStore = require('./vticonstore.js');
var LogStore = require('./logstore.js');

var saveLoadActions = Reflux.createActions(
	[
		'save',
		'loadMacaronFile'
	]
);


var saveLoadStore = Reflux.createStore({

	listenables: [saveLoadActions],

	onSave() {
		var data_json = JSON.stringify(VTIconStore.store.getInitialState()["main"], null, 2);
		LogStore.actions.log("SAVE_"+data_json);
		var data = 'data:text/json;charset=utf8,' + encodeURIComponent(data_json);
		// window.location.assign(url);
   		// window.open(url, '_blank');
   		// window.focus();

   		var a = document.createElement('a');
		a.setAttribute('href', data);
  		a.setAttribute('download', "icon.crumb");
		// a.innerHTML = 'download JSON';
	
		document.body.appendChild(a);
  		a.click();
  		document.body.removeChild(a);
	},

	onLoadMacaronFile(file) {
		var reader = new FileReader();

		reader.onload = function(e) {
			var data = reader.result;
			LogStore.actions.log("LOAD_"+data);
			VTIconStore.actions.setVTIcon(JSON.parse(data), "main");
		};

		reader.readAsText(file); //assumes 'utf8'
	}

});


module.exports  = {
	actions:saveLoadActions,
	store:saveLoadStore
};