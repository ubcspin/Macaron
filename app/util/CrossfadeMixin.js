import React from 'react'

var VTIconStore = require('./../stores/vticonstore.js');

var VectorCrossfadeMixin = {

  vectorCrossfade(wave1value, wave2value, nSamples) {
    VTIconStore.actions.selectAllKeyframes("mixedWave");
    VTIconStore.actions.deleteSelectedKeyframes("mixedWave");

    /** First, we'll mix the amplitude patterns with "vector crossfade" **/
    var wave1Amps = VTIconStore.store.getInitialState()["wave1"].parameters.amplitude.data;
    var wave2Amps = VTIconStore.store.getInitialState()["wave2"].parameters.amplitude.data;
    var spot1 = 0;
    var spot2 = 0;
    while (wave1Amps[spot1] || wave2Amps[spot2]) {

      // Case 0.1: We're past the last red keyframe
      if (!wave1Amps[spot1]) {
        var newT = wave2Amps[spot2].t;
        var v1 = (wave1value/100) * wave1Amps[spot1-1].value;
        var v2 = (wave2value/100) * wave2Amps[spot2].value;
        var newValue = v1 + v2;
        VTIconStore.actions.newKeyframe("amplitude", newT, newValue, "mixedWave");
        spot2++;
      } // Case 0.2: We're past the last green keyframe
      else if (!wave2Amps[spot2]) {
        var newT = wave1Amps[spot1].t;
        var v1 = (wave1value/100) * wave1Amps[spot1].value;
        var v2 = (wave2value/100) * wave2Amps[spot2-1].value;
        var newValue = v1 + v2;
        VTIconStore.actions.newKeyframe("amplitude", newT, newValue, "mixedWave");
        spot1++;
      }

      // Case 1: key-red1 and key-green1 share the same time
      else if (wave1Amps[spot1].t == wave2Amps[spot2].t) {
        var newT = wave1Amps[spot1].t;
        var v1 = (wave1value/100) * wave1Amps[spot1].value;
        var v2 = (wave2value/100) * wave2Amps[spot2].value;
        var newValue = v1 + v2;
        VTIconStore.actions.newKeyframe("amplitude", newT, newValue, "mixedWave");
        spot1++; spot2++;

      } // Case 2: key-red1 comes before the next green keyframe
      else if (wave1Amps[spot1].t < wave2Amps[spot2].t) {
        // Sub-case 1: we're before the green keyframe, and it's the first one.
        if (spot2 <= 0) {
          var newT = wave1Amps[spot1].t;
          var v1 = (wave1value/100) * wave1Amps[spot1].value;
          var v2 = (wave2value/100) * wave2Amps[spot2].value;
          var newValue = v1 + v2;
          VTIconStore.actions.newKeyframe("amplitude", newT, newValue, "mixedWave");
        }  //Sub-case 2: we're between 2 green keyframes.
        else {
          var newT = wave1Amps[spot1].t;
          var v1 = (wave1value/100) * wave1Amps[spot1].value;
          var rise = wave2Amps[spot2].value - wave2Amps[spot2-1].value;
          var run  = wave2Amps[spot2].t - wave2Amps[spot2-1].t;
          var slope = rise/run;
          var diffT = newT - wave2Amps[spot2-1].t;
          var idealValue = (slope * diffT) + wave2Amps[spot2-1].value;
          var v2 = (wave2value/100) * idealValue;
          var newValue = v1 + v2;
          VTIconStore.actions.newKeyframe("amplitude", newT, newValue, "mixedWave");
        }
        spot1++;

      } // Case 3: key-green1 comes before the next red keyframe
      else if (wave1Amps[spot1].t > wave2Amps[spot2].t) {
        //Sub-case 1: the next red keyframe is the first one
        if (spot1 <= 0) {
          var newT = wave2Amps[spot2].t;
          var v1 = (wave1value/100) * wave1Amps[spot1].value;
          var v2 = (wave2value/100) * wave2Amps[spot2].value;
          var newValue = v1 + v2;
          VTIconStore.actions.newKeyframe("amplitude", newT, newValue, "mixedWave");
        } //Sub-case 2: we're between two red keyframes
        else {
          var newT = wave2Amps[spot2].t;
          var v2 = (wave2value/100) * wave2Amps[spot2].value;
          var rise = wave1Amps[spot1].value - wave1Amps[spot1-1].value;
          var run = wave1Amps[spot1].t - wave1Amps[spot1-1].t;
          var slope = rise/run;
          var diffT = newT - wave1Amps[spot1-1].t;
          var idealValue = (slope * diffT) + wave1Amps[spot1-1].value;
          var v1 = (wave1value/100) * idealValue;
          var newValue = v1 + v2;
          VTIconStore.actions.newKeyframe("amplitude", newT, newValue, "mixedWave");
        }
        spot2++;
      }
    }

    /** Then just average the frequency data... **/
    var wave1Freq = VTIconStore.store.getInitialState()["wave1"].parameters.frequency.data;
    var wave2Freq = VTIconStore.store.getInitialState()["wave2"].parameters.frequency.data;
    var n1 = wave1Freq.length; var n2 = wave2Freq.length;
    var avg1 = 0; var avg2 = 0;
    for (var i=0; i<n1; i++) { avg1 += (1/n1) * wave1Freq[i].value; }
    for (var i=0; i<n2; i++) { avg2 += (1/n2) * wave2Freq[i].value; }
    var newF = ((wave1value/100)*avg1)+((wave2value/100)*avg2);
    VTIconStore.actions.newKeyframe("frequency", 0, newF, "mixedWave");
    VTIconStore.actions.newKeyframe("frequency", 3000, newF, "mixedWave");
    VTIconStore.actions.removeDefaultKeyframes("mixedWave");
    VTIconStore.actions.unselectKeyframes("mixedWave");
  },

  lameCrossfade: function(wave1value, wave2value, nSamples) {
    var nKnots = 50;
    var amt = wave1value;
    var duration = VTIconStore.store.getInitialState()["mixedWave"].duration;
    var windowWidth = duration / nKnots;
    VTIconStore.actions.selectAllKeyframes("mixedWave");
    VTIconStore.actions.deleteSelectedKeyframes("mixedWave");
    for (var i=0; i<nKnots; i++) {
      var t = (i * windowWidth) + (windowWidth / 2);
      var amp1 = this._getCurrentAmplitude(t, "wave1");
      var amp2 = this._getCurrentAmplitude(t, "wave2");
      var amp = ((0.01*amt) * amp1) + ((0.01*(100-amt)) * amp2);
      var freq1 = this._getCurrentFrequency(t, "wave1");
      var freq2 = this._getCurrentFrequency(t, "wave2");
      var freq = ((0.01*amt) * freq1) + ((0.01*(100-amt)) * freq2);
      VTIconStore.actions.newKeyframe("amplitude", t, amp, name="mixedWave");
      VTIconStore.actions.newKeyframe("frequency", t, freq, name="mixedWave");
      VTIconStore.actions.unselectKeyframes("mixedWave");
    }
    VTIconStore.actions.removeDefaultKeyframes(name="mixedWave");
  },


  _getCurrentAmplitude: function(t, name) {

    var iconStore = VTIconStore.store.getInitialState()[name];
		var ampData = iconStore.parameters.amplitude.data;

  	var amp = 0.1; // default
  	for (var j=0; j<ampData.length; j++) {
  		 // Case 1: t is less than first keyframe
		  if ((j==0) && (t <= ampData[j].t)) {
			  amp = ampData[j].value;
		  }
  	  	 // Case 2: t is between two keyframes
		  else if ((t < ampData[j].t) && (t > ampData[j-1].t)) {
			  var rise = ampData[j].value - ampData[j-1].value;
			  var run  = ampData[j].t - ampData[j-1].t;
			  var slope = rise/run;
			  amp = (slope * (t - ampData[j-1].t)) + ampData[j-1].value;
		  }
  		  // Case 3: t is beyond final keyframe
		  else if ((j == (ampData.length-1)) && (t > ampData[j].t)) {
			  amp = ampData[j].value;
		  }
	  } // End of the amplitude search
    return amp;
  },


  _getCurrentFrequency: function(t, name) {

    var iconStore = VTIconStore.store.getInitialState()[name];
		var freqData = iconStore.parameters.frequency.data;

    var frequency = 0;

  	for (var j=0; j<freqData.length; j++) {

  		if ((t <= freqData[0].t) && (j == 0)) {
  			frequency = freqData[j].value;

  		} else if ((t < freqData[j].t) && (t >= freqData[j-1].t)) {
  			var df = freqData[j].value - freqData[j-1].value;
  			var dt = freqData[j].t - freqData[j-1].t;
  			frequency = freqData[j-1].value + ((t - freqData[j-1].t)*(df/dt));

  		} else {
  			frequency = freqData[j].value;
  		}

  	}

	   return frequency;
  },


}

module.exports = VectorCrossfadeMixin;
