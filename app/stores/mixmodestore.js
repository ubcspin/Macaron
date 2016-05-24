/**
 * Here's all the code that manages the Macaron Mix Mode which will allow
 *  users to combine a pair of haptic waveforms into 1 signal using one of
 *   the provided "interpolation" methods.
 **/
import Reflux from 'reflux';

var mixModeActions = Reflux.createActions(
    [
      'enterMixMode'
    ]

);

var mixModeStore = Reflux.createStore({

  listenables: [mixModeActions],

  onEnterMixMode() {
    alert('Connected!'); // Currently working!
  },

});

module.exports = {
  actions:mixModeActions,
  store:mixModeStore
};
