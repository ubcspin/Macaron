import Reflux from 'reflux'

var VTIconStore = require('./vticonstore.js');
import {transform} from './../../thirdparty/fft.js';

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
      slider: {},
      algorithm: 'vectorCrossfade',
      nSamples: 40
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
      //MixControlStore._mix();
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
      .on("mouseup", function(){MixControlStore._mix();})
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
      this._data.algorithm = selectedAlgorithm;
      this._mix();
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

  onLoadWaveform1: function() {
    document.getElementById("wav-1-file").click();
    document.getElementById("wav-1-file").onchange = function(){
      var file = document.getElementById("wav-1-file").files[0];
      var reader = new FileReader();
  		reader.filename = file.name;
      // Case 1: It's a WAV file...
  		if (reader.filename.indexOf('.wav') >= 0) {
  			reader.onload = function(e) {
  				var waveData = reader.result;
  				if(MixControlStore._isWAVFile(reader, reader.filename)) {
  					MixControlStore._loadWAVFile(reader, "wave1");
  				}	else {
  					alert('The selected file wasnt one that Macaron recognizes');
  				}
  			}
  			reader.readAsArrayBuffer(file);
  		}

  		// Case 2: It's a JSON File or something else...
  		else {
  			reader.onload = function(e) {
  				var waveData = reader.result;
  				if (MixControlStore._isJSONFile(reader, reader.filename)) {
  					VTIconStore.actions.setVTIcon(JSON.parse(waveData.slice(29)), "wave1");
  				} else {
  					alert('The selected file wasnt one that Macaron recognizes. Please upload an appropriate WAV or JSON file.');
  				}
  			}
        reader.readAsText(file);
      }
    };
    this._mix();
  },

  onLoadWaveform2: function() {
    document.getElementById("wav-2-file").click();
    document.getElementById("wav-2-file").onchange = function(){
      var file = document.getElementById("wav-2-file").files[0];
      var reader = new FileReader();
  		reader.filename = file.name;
      // Case 1: It's a WAV file...
  		if (reader.filename.indexOf('.wav') >= 0) {
  			reader.onload = function(e) {
  				var waveData = reader.result;
  				if(MixControlStore._isWAVFile(reader, reader.filename)) {
  					MixControlStore._loadWAVFile(reader, "wave2");
  				}	else {
  					alert('The selected file wasnt one that Macaron recognizes');
  				}
  			}
  			reader.readAsArrayBuffer(file);
  		}

  		// Case 2: It's a JSON File or something else...
  		else {
  			reader.onload = function(e) {
  				var waveData = reader.result;
  				if (MixControlStore._isJSONFile(reader, reader.filename)) {
  					VTIconStore.actions.setVTIcon(JSON.parse(waveData.slice(29)), "wave2");
  				} else {
  					alert('The selected file wasnt one that Macaron recognizes. Please upload an appropriate WAV or JSON file.');
  				}
  			}
        reader.readAsText(file);
      }
    };
    this._mix();
  },

  _mix: function() {
    if (this._data.algorithm == "lameCrossfade") {
      this._lameCrossfade();
    } else if(this._data.algorithm == "vectorCrossfade") {
      this._vectorCrossfade();
    } else if (this._data.algorithm == "dtw") {
      this._properDynamicTimeWarp();
    } else if (this._data.algorithm == "direct") {
      this._directKeyframeMix();
    }
    this.trigger(this._data);
  },

  _vectorCrossfade() {
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
        var v1 = (this._data.wave1value/100) * wave1Amps[spot1-1].value;
        var v2 = (this._data.wave2value/100) * wave2Amps[spot2].value;
        var newValue = v1 + v2;
        VTIconStore.actions.newKeyframe("amplitude", newT, newValue, "mixedWave");
        spot2++;
      } // Case 0.2: We're past the last green keyframe
      else if (!wave2Amps[spot2]) {
        var newT = wave1Amps[spot1].t;
        var v1 = (this._data.wave1value/100) * wave1Amps[spot1].value;
        var v2 = (this._data.wave2value/100) * wave2Amps[spot2-1].value;
        var newValue = v1 + v2;
        VTIconStore.actions.newKeyframe("amplitude", newT, newValue, "mixedWave");
        spot1++;
      }

      // Case 1: key-red1 and key-green1 share the same time
      else if (wave1Amps[spot1].t == wave2Amps[spot2].t) {
        var newT = wave1Amps[spot1].t;
        var v1 = (this._data.wave1value/100) * wave1Amps[spot1].value;
        var v2 = (this._data.wave2value/100) * wave2Amps[spot2].value;
        var newValue = v1 + v2;
        VTIconStore.actions.newKeyframe("amplitude", newT, newValue, "mixedWave");
        spot1++; spot2++;

      } // Case 2: key-red1 comes before the next green keyframe
      else if (wave1Amps[spot1].t < wave2Amps[spot2].t) {
        // Sub-case 1: we're before the green keyframe, and it's the first one.
        if (spot2 <= 0) {
          var newT = wave1Amps[spot1].t;
          var v1 = (this._data.wave1value/100) * wave1Amps[spot1].value;
          var v2 = (this._data.wave2value/100) * wave2Amps[spot2].value;
          var newValue = v1 + v2;
          VTIconStore.actions.newKeyframe("amplitude", newT, newValue, "mixedWave");
        }  //Sub-case 2: we're between 2 green keyframes.
        else {
          var newT = wave1Amps[spot1].t;
          var v1 = (this._data.wave1value/100) * wave1Amps[spot1].value;
          var rise = wave2Amps[spot2].value - wave2Amps[spot2-1].value;
          var run  = wave2Amps[spot2].t - wave2Amps[spot2-1].t;
          var slope = rise/run;
          var diffT = newT - wave2Amps[spot2-1].t;
          var idealValue = (slope * diffT) + wave2Amps[spot2-1].value;
          var v2 = (this._data.wave2value/100) * idealValue;
          var newValue = v1 + v2;
          VTIconStore.actions.newKeyframe("amplitude", newT, newValue, "mixedWave");
        }
        spot1++;

      } // Case 3: key-green1 comes before the next red keyframe
      else if (wave1Amps[spot1].t > wave2Amps[spot2].t) {
        //Sub-case 1: the next red keyframe is the first one
        if (spot1 <= 0) {
          var newT = wave2Amps[spot2].t;
          var v1 = (this._data.wave1value/100) * wave1Amps[spot1].value;
          var v2 = (this._data.wave2value/100) * wave2Amps[spot2].value;
          var newValue = v1 + v2;
          VTIconStore.actions.newKeyframe("amplitude", newT, newValue, "mixedWave");
        } //Sub-case 2: we're between two red keyframes
        else {
          var newT = wave2Amps[spot2].t;
          var v2 = (this._data.wave2value/100) * wave2Amps[spot2].value;
          var rise = wave1Amps[spot1].value - wave1Amps[spot1-1].value;
          var run = wave1Amps[spot1].t - wave1Amps[spot1-1].t;
          var slope = rise/run;
          var diffT = newT - wave1Amps[spot1-1].t;
          var idealValue = (slope * diffT) + wave1Amps[spot1-1].value;
          var v1 = (this._data.wave1value/100) * idealValue;
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
    var newF = ((this._data.wave1value/100)*avg1)+((this._data.wave2value/100)*avg2);
    VTIconStore.actions.newKeyframe("frequency", 0, newF, "mixedWave");
    VTIconStore.actions.newKeyframe("frequency", 3000, newF, "mixedWave");
    VTIconStore.actions.removeDefaultKeyframes("mixedWave");
    VTIconStore.actions.unselectKeyframes("mixedWave");
  },

  _lameCrossfade: function() {
    var nKnots = 50;
    var amt = this._data["wave1value"];
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

  _directKeyframeMix: function() {
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
  },

  _scrappyDynamicTimeWarp: function() {
    alert('sorry, this algorithm isnt ready yet :(');

    var wave1Amps = VTIconStore.store.getInitialState()["wave1"].parameters.amplitude.data;
    var wave2Amps = VTIconStore.store.getInitialState()["wave2"].parameters.amplitude.data;
    var n1 = wave1Amps.length; var n2 = wave2Amps.length;
    var costMatrix = new Array(n1 * n2);
    for (var i=0; i<n1; i++) {
      for (var j=0; j<n2; j++) {
        var ind = this._indexFunction(i, j);
        var val = Math.abs(wave1Amps[i].value - wave2Amps[j].value);
        costMatrix[ind] = val;
      }
    }
    console.log(costMatrix);
  },

  _properDynamicTimeWarp: function() {

    /** Setting up the variables I'll need farther down **/
    var wave1Amps = VTIconStore.store.getInitialState()["wave1"].parameters.amplitude.data;
    var wave2Amps = VTIconStore.store.getInitialState()["wave2"].parameters.amplitude.data;
    var duration1 = VTIconStore.store.getInitialState()["wave1"].duration;
    var duration2 = VTIconStore.store.getInitialState()["wave2"].duration;
    var partitionedAmps1 = new Array(this._data.nSamples);
    var partitionedAmps2 = new Array(this._data.nSamples);
    var partitionWidth = Math.round(Math.min(duration1/this._data.nSamples, duration2/this._data.nSamples));
    var n1 = Math.round(duration1 / partitionWidth);
    var n2 = Math.round(duration2 / partitionWidth);

    var i1 = 0;  var i2 = 0;
    var t1 = 0;  var t2 = 0;
    var j1 = 0;  var j2 = 0;

    /** Partitioning the waveforms **/
    while(t1 <= duration1) {
      if (wave1Amps[i1]) {
        if (t1 >= wave1Amps[i1].t) { i1++; }
      }

      if (!wave1Amps[i1]) {
        partitionedAmps1[j1] = wave1Amps[wave1Amps.length-1].value;
      } else if (i1 == 0) {
        partitionedAmps1[j1] = wave1Amps[i1].value;
      } else {
        var rise = wave1Amps[i1].value - wave1Amps[i1-1].value;
        var run = wave1Amps[i1].t - wave1Amps[i1-1].t;
        var slope = rise / run;
        var diffT = t1 - wave1Amps[i1-1].t;
        var sampledValue = wave1Amps[i1-1].value + (slope * diffT);
        partitionedAmps1[j1] = +sampledValue.toFixed(3);
      }

      t1 += partitionWidth; j1++;
    }

    while (t2 <= duration2) {
      if (wave2Amps[i2]) {
        if (t2 >= wave2Amps[i2].t) { i2++; }
      }

      if (!wave2Amps[i2]) {
        partitionedAmps2[j2] = wave2Amps[wave2Amps.length-1].value;
      } else if (i2 == 0) {
        partitionedAmps2[j2] = wave2Amps[i2].value;
      } else {
        var rise = wave2Amps[i2].value - wave2Amps[i2-1].value;
        var run = wave2Amps[i2].t - wave2Amps[i2-1].t;
        var slope = rise / run;
        var diffT = t2 - wave2Amps[i2-1].t;
        var sampledValue = wave2Amps[i2-1].value + (slope * diffT);
        partitionedAmps2[j2] = +sampledValue.toFixed(3);
      }

      t2 += partitionWidth; j2++;
    }
    var max1 = Math.max.apply(null, partitionedAmps1);
    var max2 = Math.max.apply(null, partitionedAmps2);
    console.log(max1, max2);

    /** Computing the Cost Matrix **/
    var costMatrix = new Array(n1 * n2);

    for (var i=0; i<=n1; i++) {
      for (var j=0; j<=n2; j++) {
        var costIndex = this._indexFunction(i,j);
        var scaledV1 = partitionedAmps1[i] / max1;
        var scaledV2 = partitionedAmps2[j] / max2;
        var cost = this._localCost(scaledV1, scaledV2);
        cost = +cost.toFixed(3);
        costMatrix[costIndex] = cost;
      }
    }

    /** Finding the optimal path through the cost matrix **/
    var i = 0; var j = 0;
    var costSize = n1 + n2;
    var costNodes = new Array(costSize);
    costNodes[0] = {i:0, j:0, cost:costMatrix[this._indexFunction(0,0)]};
    var nNodes = 1;

    while ((partitionedAmps1[i+1] != null) || (partitionedAmps2[j+1] != null)) {

      // Case 1: We're at the top of the Cost Matrix
      if (partitionedAmps1[i+1] == null) {
        var newNode = {i:i, j:j+1, cost:costMatrix[this._indexFunction(i,j+1)]};
        costNodes[nNodes] = newNode;
        j++; nNodes++;
      }

      // Case 2: We're on the far right of the Cost Matrix
      else if (partitionedAmps2[j+1] == null) {
        var newNode = {i:i+1, j:j, cost:costMatrix[this._indexFunction(i+1,j)]};
        costNodes[nNodes] = newNode;
        i++; nNodes++;
      }

      // Case 3: We're somewhere in the middle and need to choose a next step!
      else {
        var up    = costMatrix[this._indexFunction(i+1, j)];
        var right = costMatrix[this._indexFunction(i, j+1)];
        var diag  = costMatrix[this._indexFunction(i+1, j+1)];
        var minCost = Math.min(up, right, diag);
        console.log({u:up, r:right, d:diag});

        if (up == minCost) {
          costNodes[nNodes] = {i:i+1, j:j, cost:up}
          i++; nNodes++
        }

        else if (right == minCost) {
          costNodes[nNodes] = {i:i, j:j+1, cost: right}
          j++; nNodes++;
        }

        else if (diag == minCost) {
          costNodes[nNodes] = {i:i+1, j:j+1, cost: diag};
          j++; i++; nNodes++;
        }

        else {
          alert('uh oh... cost Matrix problems :(');
          break;
        }
      }
    }
    console.log(costNodes);

    /** Find all edges to form keyframe pairings **/
    var k = 0;
    var outputNodes = new Array(nNodes);
    var nOutNodes = 0;

    while (costNodes[k+1]) {

      // Case 1: there are a few repeat I indices
      if (costNodes[k].i == costNodes[k+1].i) {
        var newK = k; var done = false;
        while (costNodes[newK+1] && !done) {
          if (costNodes[newK+1].i == costNodes[newK].i) { newK++; }
          else {done = true;}
        }
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[k].j};
        nOutNodes++;
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[newK].j};
        nOutNodes++;
        k = newK;
      }

      // Case 2: there are a few repeat J indices
      else if (costNodes[k].j == costNodes[k+1].j) {
        var newK = k; var done = false;
        while (costNodes[newK+1] && !done) {
          if (costNodes[newK+1].j == costNodes[newK].j) { newK++; }
          else {done = true;}
        }
        //var newI = Math.round((costNodes[k].i+costNodes[newK].i)/2);
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[k].j};
        nOutNodes++;
        outputNodes[nOutNodes] = {i:costNodes[newK].i, j:costNodes[k].j};
        nOutNodes++;
        k = newK;
      }

      // Case 3: No repeats
      else {
        outputNodes[nOutNodes] = {i:costNodes[k].i, j:costNodes[k].j};
        nOutNodes++;
      }

      k++;
    }

    console.log(outputNodes);

    /** Use that path through the cost matrix to mix the waves! **/
    VTIconStore.actions.selectAllKeyframes("mixedWave");
    VTIconStore.actions.deleteSelectedKeyframes("mixedWave");
    for (var k=0; k<nOutNodes; k++) {
      var i = outputNodes[k].i;
      var j = outputNodes[k].j;
      var iT = i * partitionWidth;
      var jT = j * partitionWidth;
      var iV = partitionedAmps1[i];
      var jV = partitionedAmps2[j];
      var newT = (this._data["wave1value"]*iT*0.01) + (this._data["wave2value"]*jT*0.01);
      var newV = (this._data["wave1value"]*iV*0.01) + (this._data["wave2value"]*jV*0.01);
      VTIconStore.actions.newKeyframe("amplitude", newT, newV, "mixedWave");
    }

    /** Then just average the frequency data... **/
    var wave1Freq = VTIconStore.store.getInitialState()["wave1"].parameters.frequency.data;
    var wave2Freq = VTIconStore.store.getInitialState()["wave2"].parameters.frequency.data;
    var n1 = wave1Freq.length; var n2 = wave2Freq.length;
    var avg1 = 0; var avg2 = 0;
    for (var i=0; i<n1; i++) { avg1 += (1/n1) * wave1Freq[i].value; }
    for (var i=0; i<n2; i++) { avg2 += (1/n2) * wave2Freq[i].value; }
    var newF = ((this._data.wave1value/100)*avg1)+((this._data.wave2value/100)*avg2);
    VTIconStore.actions.newKeyframe("frequency", 0, newF, "mixedWave");
    VTIconStore.actions.newKeyframe("frequency", 3000, newF, "mixedWave");
    VTIconStore.actions.removeDefaultKeyframes("mixedWave");
    VTIconStore.actions.unselectKeyframes("mixedWave");

  },

  _indexFunction: function(i, j) {
    return (this._data.nSamples * i) + j;
  },

  _localCost: function(x, y) {
    return Math.abs(x - y);
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

  /**
   *  isJSONFile determines if the provided file is, in fact, a JSON file
   *   that can be understood by the Macaron app.
   *
   * @param r a JS Reader produced by the Filereader API when a file is loaded.
   * @param fn a string representing the name of the uploaded file.
   *
   * @return a boolean, True if file is useable JSON, False otherwise.
   **/
  _isJSONFile: function(r, fn) {

  	var fileExtOK = (fn.indexOf('.json') >= 0);
  	try {
  		var test = JSON.parse(r.result.slice(29));
  		var fileContentOK = true;
  	}
  	catch(err) {
  		var fileContentOK = false;
  	}

  	var fileOK = fileExtOK && fileContentOK;

  	return(fileOK);
  },



  /**
   * isWavFile determines whether or not a provided file is actually an
   *  appropriate WAV file (with readable bit-depth, correct file format,
   *   useful number of channels, etc.)
   *
   * @param r a JS Reader produced by the Filereader API with a file is loaded.
   * @param fn a string representing the name of the uploaded file.
   *
   * @return a boolean, True if the file is a WAV file, False otherwise.
   **/
  _isWAVFile: function(r, fn) {

  	var result = false;
  	var wavedata = new DataView(r.result);

  	var header = String.fromCharCode(wavedata.getInt8(0));  //R
  	header +=    String.fromCharCode(wavedata.getInt8(1));  //I
  	header +=    String.fromCharCode(wavedata.getInt8(2));  //F
  	header +=    String.fromCharCode(wavedata.getInt8(3));  //F
  	header +=    String.fromCharCode(wavedata.getInt8(8));  //W
  	header +=    String.fromCharCode(wavedata.getInt8(9));  //A
  	header +=    String.fromCharCode(wavedata.getInt8(10)); //V
  	header +=    String.fromCharCode(wavedata.getInt8(11)); //E

  	// Make sure we're actually looking at a WAV file.
  	var headerOK = (header == "RIFFWAVE");
  	var fileExOK = (fn.indexOf('.wav') >= 0);

  	if (headerOK && fileExOK) {
  		result = true;
  	}

  	return result;
  },



  /**
   *  loadWAVFile takes the contents of a WAV file and loads an approximation
   *   of that file's waveform into the Macaron editor. This function relies
   *    heavily on the code written by the amazing Benson!
   *
   * @param r a JS Reader created by the Filereader API when a file is loaded.
   **/
  _loadWAVFile: function(r, editor) {

  	var y;  // speaker displacement at time = t

  	var sampleRate;
  	var duration;
  	var nChannels;
  	var nFrames;
  	var wavedata = r.result;

  	var AudioCtx = new (window.AudioContext || window.webkitAudioContext)();

  	AudioCtx.decodeAudioData(wavedata, function(buff) {
  		sampleRate = buff.sampleRate;
  		duration = buff.duration;
  		nChannels = buff.numberOfChannels;
  		nFrames = buff.length;

  		var waveBuffer = new Array(nFrames);
  		waveBuffer = buff.getChannelData(0); // Yup, just one channel...

  		var nPannels = 40; // The number of points at which the input is to
  											 // be estimated. (MUST BE DIVISIBLE BY 20).
  		var pannelDuration = (duration * 1000) / nPannels; // in ms
  		var pannelWidth = Math.round(nFrames / nPannels); // in number of frames

  		for (var i=0; i<nPannels; i++) {

  			var jMin = Math.round(pannelWidth * i);
  			var jMax = Math.round(pannelWidth * (i + 1));

  			var tMid = ((i*1000*duration)/nPannels)+((500*duration)/nPannels);

  			var waveChunk = waveBuffer.slice(jMin, jMax);

  			var aVal = Math.max.apply(null, waveChunk);

  			var fVal = MixControlStore._findFFTRoot(waveChunk, sampleRate);


  			VTIconStore.actions.newKeyframe("amplitude", tMid, aVal, false, editor);
  			VTIconStore.actions.newKeyframe("frequency", tMid, fVal, false, editor);
  		}

  		VTIconStore.actions.unselectKeyframes(editor);
  		VTIconStore.actions.addSelectedKeyframes([0,1], editor);
  		VTIconStore.actions.deleteSelectedKeyframes(editor);
  	});
  },

  /**
   *  findFFTRoot computes the Discrete Fourier Transform of the audio data,
   *   and takes the frequency with the largest weight to be the approximated
   *    frequency of the entire data chunk. This function relies on the "fft"
   *     javascript functions found in the Third Party directory.
   *
   * @param data an array of y values decoded from a WAV file.
   * @param sampleRate a number representing the sample rate of the wave data.
   *
   * @return a number reresenting a best guess at the frequency
   *          of the wave in the data.
   **/
  _findFFTRoot: function(data, sampleRate) {
  	var real = new Array(data.length);
  	var imag = new Array(data.length);

  	for (var i=0; i<data.length; i++){
  		real[i] = data[i]; imag[i] = 0;
  	}

  	transform(real, imag);
  	// "transform" comes from the fft utility in the thirdparty directory.

  	for (var i=0; i<data.length; i++) {
  		real[i] = Math.abs(real[i]);
  	}

  	var halfReal = new Array(Math.round(data.length / 2));
  	for (var i=0; i<data.length/2; i++) {
  		halfReal[i] = real[i];
  	}

  	var fftRootLocation = real.indexOf(Math.max.apply(null, halfReal));

  	var Fs = new Array(data.length);
  	for (var i=1; i<=data.length; i++) {
  		Fs[i] = i * sampleRate/data.length;
  	}

  	return Math.round(Fs[fftRootLocation]); //stub
  },


});

module.exports = {
  actions: MixControlActions,
  store: MixControlStore
}
