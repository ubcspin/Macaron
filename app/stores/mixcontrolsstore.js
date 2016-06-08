import Reflux from 'reflux'

var VTIconStore = require('./vticonstore.js');

var MixControlActions = Reflux.createActions(

  [ 'createSlider',
    'selectAlgorithm',
    'quickMix',
    'loadWaveform1',
    'loadWaveform2',
    'triggerSlider',
    'enterWave1Value',
    'enterWave2Value' ]

);


    var slider;

var MixControlStore = Reflux.createStore({

  listenables: [MixControlActions],

  init: function() {
    this._data = {
      wave1value: 50,
      wave2value: 50,
      slider: {}
    };

  },

  onCreateSlider: function() {

    var sliderActivate = function() {
      var amt1 = Math.round(100 - this.value);
      var amt2 = Math.round(this.value);
      MixControlStore._data["wave1value"] = amt1;
      MixControlStore._data["wave2value"] = amt2;
      document.getElementById("signal-1-amount").value = amt1.toString() + "%";
      document.getElementById("signal-2-amount").value = amt2.toString() + "%";
      MixControlStore._mix();
    }

    this._data["slider"] = d3.select("#amount-slider")
      .append("p")
      .append("input")
      .datum({})
      .attr("type", "range")
      .attr("value", 50)
      .attr("min", 0)
      .attr("max", 100)
      .attr("step", 0.1)
      .on("input", sliderActivate)
      .style({"width": "99%",
              "fill": "orange",
              "stroke": "orange",
              "height": "10px",
              "padding-top": "-20px",
              "margin-top": "-20px"});

    document.getElementById("signal-1-amount").setAttribute("placeholder", "50%");
    document.getElementById("signal-2-amount").setAttribute("placeholder", "50%");

    document.addEventListener("keydown", function(event) {
      var isEnter = (event.keyCode || event.which) == 13; //keycode for "enter"
      if (isEnter) {
        if (document.activeElement.id == "signal-1-amount") {
          MixControlStore.onEnterWave1Value();
        }
        if (document.activeElement.id == "signal-2-amount") {
          MixControlStore.onEnterWave2Value();
        }
      }
    });

    this._mix(50);

    VTIconStore.actions.selectTimeRange(0, 250, "mixedWave");

  },

  onSelectAlgorithm: function() {
      var selectedAlgorithm = document.getElementById('mix-mode-drop-down').value;
      alert('you picked something: ' + selectedAlgorithm);
  },

  onQuickMix: function(mix) {
    this._data["wave1value"] = mix;
    this._data["wave2value"] = (100 - mix);
    document.getElementById("signal-1-amount").value = mix.toString() + "%";
    document.getElementById("signal-2-amount").value = (100-mix).toString() + "%";
    this._data["slider"].property("value", 100-mix);
    this._mix();
  },

  onEnterWave1Value: function() {
    var amount = document.getElementById("signal-1-amount").value;
    var isNumber = !isNaN(Number(parseInt(amount)));
    if (isNumber) {
      var a = parseInt(amount);
      var isInRange = (0 <= a) && (100 >= a);
      if (isInRange) {
        document.activeElement.blur();
        document.getElementById("signal-1-amount").value = a.toString() + "%";
        document.getElementById("signal-2-amount").value = (100-a).toString() + "%";
        this._data["slider"].property("value", 100-a);
        this._data["wave1value"] = a;
        this._data["wave2value"] = (100 - a);
        this._mix();
      }
    }
  },

  onEnterWave2Value: function() {
    var amount = document.getElementById("signal-2-amount").value;
    var isNumber = !isNaN(Number(parseInt(amount)));
    if (isNumber) {
      var a = parseInt(amount);
      var isInRange = (0 <= a) && (100 >= a);
      if (isInRange) {
        document.activeElement.blur();
        document.getElementById("signal-2-amount").value = a.toString() + "%";
        document.getElementById("signal-1-amount").value = (100-a).toString() + "%";
        this._data["slider"].property("value", a);
        this._data["wave2value"] = a;
        this._data["wave1value"] = (100 - a);
        this._mix();
      }
    }
  },

  onLoadWaveform1: function(file) {
    document.getElementById("wav-1-file").click();
    document.getElementById("wav-1-file").onchange = function() {
      alert(document.getElementById("wav-1-file").files[0].name);
    };
  },

  onLoadWaveform2: function() {
    document.getElementById("wav-2-file").click();
    document.getElementById("wav-2-file").onchange = function() {
      alert(document.getElementById("wav-2-file").files[0].name);
    };
  },

  _mix: function() {
    var nKnots = 50;
    var amt = this._data["wave1value"];
    var duration = VTIconStore.store.getInitialState()["mixedWave"].duration;
    var windowWidth = duration / nKnots;
    VTIconStore.actions.newKeyframe("frequency", 1, 400, name="mixedWave");

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
      console.log(freq1);
      console.log(freq);

      VTIconStore.actions.selectTimeRange(i*windowWidth, (i+1)*windowWidth, "mixedWave");
      VTIconStore.actions.deleteSelectedKeyframes("mixedWave");
      VTIconStore.actions.unselectKeyframes("mixedWave");

      VTIconStore.actions.newKeyframe("amplitude", t, amp, name="mixedWave");
      VTIconStore.actions.newKeyframe("frequency", t, freq, name="mixedWave");
      VTIconStore.actions.unselectKeyframes("mixedWave");
    }

    VTIconStore.actions.selectKeyframesInRange(1499,1501,1,"mixedWave");
    VTIconStore.actions.deleteSelectedKeyframes("mixedWave");

    console.log(VTIconStore._data);

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
  }

});

module.exports = {
  actions: MixControlActions,
  store: MixControlStore
}
