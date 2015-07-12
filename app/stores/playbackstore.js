import Reflux from 'reflux';


var timeActions = Reflux.createActions(
	['setTime']

);


var timeStore = Reflux.createStore({
	listenables: [timeActions],

	onSetTime(newtime){
		this.trigger(newtime);
	}

	// getInitialState: function () {

	// }

	});




module.exports = {
	timeActions:timeActions,
	timeStore:timeStore
};