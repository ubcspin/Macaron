import Reflux from 'reflux'

var VTIconStore = require('./vticonstore.js');
var DTWMixin = require('./../util/DTWmixin.js');
var CrossfadeMixin = require('./../util/CrossfadeMixin.js');
var DirectKeyframeComboMixin = require('./../util/DirectKeyframeCombineMixin.js');
var SmartMix = require('./../util/smartMix.js');

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

  mixins: [DTWMixin,
           CrossfadeMixin,
           DirectKeyframeComboMixin],

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
            // TODO Comment this conditional out to read only JSON files with the header!
  				} else if (reader.filename.indexOf('.json') >= 0) {
            VTIconStore.actions.setVTIcon(JSON.parse(waveData), "wave1");
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
            // TODO Comment this conditional out to read only JSON files with the header!
  				} else if (reader.filename.indexOf('.json') >= 0) {
            VTIconStore.actions.setVTIcon(JSON.parse(waveData), "wave2");
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
      CrossfadeMixin.lameCrossfade(this._data["wave1value"], this._data["wave2value"], this._data["nSamples"]);
    } else if(this._data.algorithm == "vectorCrossfade") {
      CrossfadeMixin.vectorCrossfade(this._data["wave1value"], this._data["wave2value"], this._data["nSamples"]);
    } else if (this._data.algorithm == "dtw") {
      DTWMixin.properDynamicTimeWarp(this._data["wave1value"], this._data["wave2value"], this._data["nSamples"]);
    } else if (this._data.algorithm == "direct") {
      DirectKeyframeComboMixin.directKeyframeMix();
    } else if (this._data.algorithm == "smartmix") {
      SmartMix.smartMix(this._data["wave1value"], this._data["wave2value"], this._data["nSamples"]);
    } else if (this._data.algorithm == "DTWwFreq") {
      DTWMixin.dtwWithFreq(this._data["wave1value"], this._data["wave2value"], this._data["nSamples"]);
    }
    this.trigger(this._data);
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
