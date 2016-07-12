import React from 'react'

var VTIconStore = require('./../stores/vticonstore.js');

var DirectKeyframeComboMixin = {

  directKeyframeMix: function() {
    var nA1 = VTIconStore.store.getInitialState()["wave1"].parameters.amplitude.data.length;
    var nA2 = VTIconStore.store.getInitialState()["wave2"].parameters.amplitude.data.length;
    var nF1 = VTIconStore.store.getInitialState()["wave1"].parameters.frequency.data.length;
    var nF2 = VTIconStore.store.getInitialState()["wave2"].parameters.frequency.data.length;
    VTIconStore.actions.selectAllKeyframes("mixedWave");
    VTIconStore.actions.deleteSelectedKeyframes("mixedWave");
    for (var i=0; i<nA1; i++) {
      var newTime = VTIconStore.store.getInitialState()["wave1"].parameters.amplitude.data[i].t;
      var newVal  = VTIconStore.store.getInitialState()["wave1"].parameters.amplitude.data[i].value;
      VTIconStore.actions.newKeyframe("amplitude", newTime, newVal, false, "mixedWave");
    }
    for (var i=0; i<nA2; i++) {
      var newTime = VTIconStore.store.getInitialState()["wave2"].parameters.amplitude.data[i].t;
      var newVal  = VTIconStore.store.getInitialState()["wave2"].parameters.amplitude.data[i].value;
      VTIconStore.actions.newKeyframe("amplitude", newTime, newVal, false, "mixedWave");
    }
    for (var i=0; i<nF1; i++) {
      var newTime = VTIconStore.store.getInitialState()["wave1"].parameters.frequency.data[i].t;
      var newVal  = VTIconStore.store.getInitialState()["wave1"].parameters.frequency.data[i].value;
      VTIconStore.actions.newKeyframe("frequency", newTime, newVal, false, "mixedWave");
    }
    for (var i=0; i<nF1; i++) {
      var newTime = VTIconStore.store.getInitialState()["wave2"].parameters.frequency.data[i].t;
      var newVal  = VTIconStore.store.getInitialState()["wave2"].parameters.frequency.data[i].value;
      VTIconStore.actions.newKeyframe("frequency", newTime, newVal, false, "mixedWave");
    }
    VTIconStore.actions.removeDefaultKeyframes("mixedWave");
  }
}

module.exports = DirectKeyframeComboMixin;
