import Reflux from 'reflux';

var VTIconStore = require('./vticonstore.js');
var LogStore = require('./logstore.js');

import {transform} from './../../thirdparty/fft.js';

var saveLoadActions = Reflux.createActions(
	[
		'save',
		'loadMacaronFile'
	]
);


var saveLoadStore = Reflux.createStore({

	listenables: [saveLoadActions],

	onSave(editor) {


		// Here you can specify how you'd like the files to be named
		var jsonFileName = "my_waveform.json";
		var wavFileName = "my_waveform.wav";

		var closeSaveWindow = function() {
			document.body.removeChild(linksContainer);
			document.body.removeChild(shadow);
		}

		/**
		 * Creating the Pop-Up Style Container for Download Links
		 */
		var linksContainer = document.createElement("div");
		linksContainer.id = "save-links-container";
		linksContainer.classList.add("save-link-container");

		var closeLink = document.createElement("a");
		closeLink.id = "save-link-close-button";
		closeLink.classList.add("close");
		closeLink.innerHTML = "X";
		closeLink.addEventListener("click", function() {closeSaveWindow();});

		var linksHeader = document.createElement("H2");
		linksHeader.id = "save-link-header";
		linksHeader.classList.add("links-header");
		linksHeader.innerHTML = "Save Your Macaron Waveform";

		var shadow = document.createElement("div");
		shadow.id = "links-box-shadow";
		shadow.classList.add("link-box-shadow");


		/**
		 *  Creating the JSON file for download
		 */
		var dataJSON = JSON.stringify(VTIconStore.store.getInitialState()[editor], null, 2);
		var fullDataJSON = "data:text/json;charset=utf8, " + dataJSON;
		var dataBlob = new Blob([fullDataJSON], {type: "text/JSON"});
		dataBlob.name = jsonFileName;
		var dataURL = URL.createObjectURL(dataBlob);

		var jsonDownloadLink = document.createElement("a");
		jsonDownloadLink.id = "json-download-link";
		jsonDownloadLink.classList.add("download-link");
		jsonDownloadLink.setAttribute("value", "Download");
		jsonDownloadLink.setAttribute("href", dataURL);
		jsonDownloadLink.setAttribute("download", jsonFileName);
		jsonDownloadLink.innerHTML = "download Macaron file (JSON)";

		var wavBuffer = this.generateWavFile(editor);

		var wavBlob = new Blob([wavBuffer], {type: "audio/wav"});
		wavBlob.name = wavFileName;
		var wavURL = URL.createObjectURL(wavBlob);

		var wavDownloadLink = document.createElement("a");
		wavDownloadLink.id = "wav-download-link";
		wavDownloadLink.classList.add("download-link");
		wavDownloadLink.setAttribute("value", "Download");
		wavDownloadLink.setAttribute("href", wavURL);
		wavDownloadLink.setAttribute("download", wavFileName);
		wavDownloadLink.innerHTML = "download Waveform File (WAV)";

		/**
		 * And add the Safari note (hopefully this will be resolved soon...)
		 */
		var safariNote = document.createElement("p");
		safariNote.id = "safari-note";
		safariNote.classList.add("download-link");
		safariNote.innerHTML = "* Note: The download links will open in a new tab if you are using the Safari web browser. To download directly, please try again in the Chrome, Firefox, or IE web browsers.";

		/**
		 * Now just append it all together!
		 */
		linksContainer.appendChild(closeLink);
		linksContainer.appendChild(linksHeader);

		var spacer = document.createElement("br");
		var linksText = document.createElement("p");
		linksText.id = "links-text";
		linksText.appendChild(jsonDownloadLink);
		linksText.appendChild(spacer);
		linksText.appendChild(wavDownloadLink);
		linksText.appendChild(safariNote);

		linksContainer.appendChild(linksText);
		document.body.appendChild(linksContainer);
		document.body.appendChild(shadow);

	},




	generateWavFile(editor) {

		/**
		 * Here's a constructor for a WavBundle object I've made. This object
		 *  will contain all the info necessary to create a WAV file. Most of the
		 *   data is currently hard-coded, but making it as an object will leave
		 *    some wiggle-room for future improvements.
		 *
		 * Remember! It's little-endian!
		 * @constructor
		 **/
		var WavBundle = function(trackLength) {
			this.trackLength = trackLength; // in seconds.
			this.channels = 1; // Standard mono-audio
			this.sampleRate = 44100; //Hz (44100 is pretty universal)
			this.bitDepth = 8; // Low-fi...
			this.bitRate = this.channels * this.sampleRate * this.bitDepth;
			this.sampleSize = (this.bitDepth * this.channels) / (8); //bytes
			this.nSamples = this.sampleRate * this.trackLength;
			this.totalSize = (this.nSamples * this.sampleSize) + 44;
			this.buffer = new Int8Array(this.totalSize);

			/**
			 * generateWaveHeader makes a new this.buffer with a header
			 *  for the WAV file in the standard format.
			 *
			 *  see: http://www.topherlee.com/software/pcm-tut-wavformat.html
			 *   for a reference about what the header should contain.
			 **/
			this.generateWavHeader = function() {
				this.buffer[0]  = 0x52; //R
				this.buffer[1]  = 0x49; //I
				this.buffer[2]  = 0x46; //F
				this.buffer[3]  = 0x46; //F

				// This block records the total file size
				this.buffer[4]  = (0x000000ff & this.totalSize);
				this.buffer[5]  = (0x0000ff00 & this.totalSize) >>  8;
				this.buffer[6]  = (0x00ff0000 & this.totalSize) >> 16;
				this.buffer[7]  = (0xff000000 & this.totalSize) >> 24;

				this.buffer[8]  = 0x57; //W
				this.buffer[9]  = 0x41; //A
				this.buffer[10] = 0x56; //V
				this.buffer[11] = 0x45; //E

				this.buffer[12] = 0x66; //f
				this.buffer[13] = 0x6d; //m
				this.buffer[14] = 0x74; //t
				this.buffer[15] = 0x20; //

				this.buffer[16] = 0x10; // This block sets the length of
				this.buffer[17] = 0x00; //  the "format chunk" to 16
				this.buffer[18] = 0x00;
				this.buffer[19] = 0x00;

				this.buffer[20] = 0x01; // Type of format (1 is PCM) - 2 byte integer
				this.buffer[21] = 0x00;

				// This block sets the number of channels
				this.buffer[22] = (0x00ff & this.channels);
				this.buffer[23] = (0xff00 & this.channels) >> 8;

				// This block sets the sample rate
				this.buffer[24] = (0x000000ff & this.sampleRate);
				this.buffer[25] = (0x0000ff00 & this.sampleRate) >>  8;
				this.buffer[26] = (0x00ff0000 & this.sampleRate) >> 16;
				this.buffer[27] = (0xff000000 & this.sampleRate) >> 24;

				// Now to set the bitRate
				this.buffer[28] = (0x000000ff & this.bitRate);
				this.buffer[29] = (0x0000ff00 & this.bitRate) >>  8;
				this.buffer[30] = (0x00ff0000 & this.bitRate) >> 16;
				this.buffer[31] = (0xff000000 & this.bitRate) >> 24;

				// Set block align equal to 4
				this.buffer[32] = 0x04;
				this.buffer[33] = 0x00;

				// This block sets the number of bits per sample
				this.buffer[34] = (0x00ff & this.bitDepth);
				this.buffer[35] = (0xff00 & this.bitDepth) >> 8;

				this.buffer[36] =  0x64; //d
				this.buffer[37] =  0x61; //a
				this.buffer[38] =  0x74; //t
				this.buffer[39] =  0x61; //a

				// Size of the "data" section
				var dSize = (this.nSamples * this.sampleSize); // too long!
				this.buffer[40] =  (0x000000ff & dSize);
				this.buffer[41] =  (0x0000ff00 & dSize) >>  8;
				this.buffer[42] =  (0x00ff0000 & dSize) >> 16;
				this.buffer[43] =  (0xff000000 & dSize) >> 24;
			}




			/**
				* generateWavContent will generate the actual sound-producing
				*  portion of the WAV file.
				**/
			this.generateWavContent = function(editor) {

				var iconStore = VTIconStore.store.getInitialState()[editor];
				var ampParams = iconStore.parameters.amplitude.data;
				var freqParams = iconStore.parameters.frequency.data;

				var range = Math.pow(2, this.bitDepth - 1) - 2;
									// subtract 2 to avoid any clipping.

				// calculate the speaker displacement at each frame
				//  emulating a sinewave here...
				for (var i=0; i<=this.nSamples; i=(i+this.sampleSize)) {

					var t = ((i * 1000) / this.sampleRate);

					var amp = getCurrentAmplitude(t, ampParams);
					var ft = getCurrentFT(t, freqParams); // Integral of freq over t

					var vol = range * amp;
					//vol = equalize(t, freqParams, vol);
					var angle = Math.sin(2 * Math.PI * ft);
					var oscOffset = Math.round(vol * angle);

					if (oscOffset < 0) {
						oscOffset = ~(Math.abs(oscOffset));
					}

					// Range - Offset = WAV encoding of Offset... Weird!
					this.buffer[(i*this.sampleSize)+44] = range - oscOffset;
				}
			}
		} /**  End of WavBundle Constructor  **/


		/**
		 *  Heres where everything gets called in order to produce the WAV file
		 **/
		var duration = VTIconStore.store.getInitialState()[editor].duration / 1000;

		var wavObj = new WavBundle(duration); // a 3 second long clip
		wavObj.generateWavHeader();
		wavObj.generateWavContent(editor); // volume = 1, frequency = 350
		return wavObj.buffer;

	},





	onLoadMacaronFile(file) {
		var reader = new FileReader();
		reader.filename = file.name;

		// Case 1: It's a WAV file...
		if (reader.filename.indexOf('.wav') >= 0) {
			reader.onload = function(e) {
				var waveData = reader.result;
				if(isWAVFile(reader, reader.filename)) {
					loadWAVFile(reader);
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
				if (isJSONFile(reader, reader.filename)) {
					VTIconStore.actions.setVTIcon(JSON.parse(waveData.slice(29)), "main");
				} else {
					alert('The selected file wasnt one that Macaron recognizes. Please upload an appropriate WAV or JSON file.');
				}
			}

			reader.readAsText(file); //assumes 'utf8'
		}
	}
});




/**
 *  getCurrentAmplitude computes what the amplitude should be at
 *   time = t based on the keyframes created by the user in the
 *    "Amplitude" pane of the Macaron editor.
 *
 * @param t a number representing current time in miliseconds.
 * @param ampData a JSON object created by the VTIconStore file representing
 *          amplitude keyframes in the Macaron editor.
 *
 * @return a number between 0 and 1 representing current, max amplitude.
 **/
 var getCurrentAmplitude = function(t, ampData) {

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
 }




 /**
  *  getCurrentFrequency computes what the current frequency should be at
	*   time t based on the users keyframes created in the "Frequency"
	*    pane of the Macaron editor.
	*
	* @param t a number representing current time in miliseconds
	* @param freqData a JSON object created by the VTIconStore for
	*          frequency keyframes.
	*
	* @return a number representing the intended frequency at time t
	**/
var getCurrentFrequency = function(t, freqData) {

	// First find the frequency at time t...
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


/**
 *  getCurrentFT computes the integral of frequency over time from the
 *   previous keyframe out to the current time.
 *
 *  This integral is needed to exactly compute the displacement of a speaker
 *   that is generating a soundwave of changing frequency.
 *
 * @param t a number representing current time in miliseconds
 * @param freqData a JSON object created by the VTIconStore for
 *          frequency keyframes.
 *
 * @return a number representing the integral of frequency over time on the
 *           interval from the last frequency keyframe to time t.
 **/
var getCurrentFT = function(t, freqData) {

	var ft = 0; // default

	for (var j=0; j<freqData.length; j++) {

		// Case 1: t is before the first keyframes
		if ((t <= freqData[0].t) && (j==0)) {
			ft = freqData[0].value * (t/1000);
		}

		// Case 2: t is between two keyframes
		else if ((t < freqData[j].t) && (t >= freqData[j-1].t)) {

			var dfTotal = freqData[j].value - freqData[j-1].value;
			var dtTotal = freqData[j].t - freqData[j-1].t;
			var slope = dfTotal/dtTotal;
			var dt = t - freqData[j-1].t;
			var df = slope * dt;
			var intP1 = (dt/1000) * freqData[j-1].value;
			var intP2 = (dt/1000) * df * 0.5;
			var ft = intP1 + intP2;
		}

		// Case 3: t is beyond the last keyframe
		else if ((j == (freqData.length-1)) && (t > freqData[j].t)) {
			 ft = freqData[j].value * (t/1000);
		 }

	} // End of the frequency calculations

	var previousFT = 0;

	for (var j=0; j<freqData.length; j++) {

		if (j == 0) {
			previousFT += freqData[0].t * freqData[0].value;
		}

		else if (t >= freqData[j].t) {
			break;
		}

		else {
			var dt = freqData[j].t - freqData[j-1].t;
			var freqSum = freqData[j].value + freqData[j-1].value;
			previousFT += 0.5 * dt * freqSum;
		}


	}

	return ft + previousFT;
}



/**
 *  the Equalize function will scale the volume to adjust for "sweet-spots"
 *   in a given actuator. This code exactly emulates the algorithm in
 *    soundgen.jsx written by Oliver.
 *
 * @param t a number representing current time in miliseconds
 * @param freqData a JSON object created by the VTIconStore for
 *          frequency keyframes.
 * @param volume a number representing the current volume (y range * amplitude)
 *
 * @return a number representing the adjusted volume.
 **/
var equalize = function(t, freqData, volume) {

	// First find the frequency at time t...
	var frequency = getCurrentFrequency(t, freqData);

	// Now scale it...
	var pf = 0;
	var scaleFactor = 1;
	if (frequency < 300) {
		pf = (frequency - 50) / 250; // proportion of way btwn 50 and 300
		scaleFactor = pf * 4 + 1; // proportion of gain difference, here 24
	} else {
		pf = (frequency - 300) / 200; // proportion of way btwn 300 and 550
		scaleFactor = ((1 - pf) * 3) + 2; // proportion of gain difference
	}

	var equalizedVolume = volume / scaleFactor;

	return equalizedVolume;
}


/**
 *  isJSONFile determines if the provided file is, in fact, a JSON file
 *   that can be understood by the Macaron app.
 *
 * @param r a JS Reader produced by the Filereader API when a file is loaded.
 * @param fn a string representing the name of the uploaded file.
 *
 * @return a boolean, True if file is useable JSON, False otherwise.
 **/
var isJSONFile = function(r, fn) {

	var fileExtOK = (fn.indexOf('.json') >= 0);

	try {
		var test = JSON.parse(r.result.slice(29));
		var fileContentOK = true;
	}
	catch(err) {
		var fileContentOK = false;
	}

	console.log(fileExtOK); console.log(fileContentOK);

	var fileOK = fileExtOK && fileContentOK;

	return(fileOK);
}



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
var isWAVFile = function(r, fn) {

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
}



/**
 *  loadWAVFile takes the contents of a WAV file and loads an approximation
 *   of that file's waveform into the Macaron editor. This function relies
 *    heavily on the code written by the amazing Benson!
 *
 * @param r a JS Reader created by the Filereader API when a file is loaded.
 **/
var loadWAVFile = function(r) {

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

		var nPannels = 80; // The number of points at which the input is to
											 // be estimated. (MUST BE DIVISIBLE BY 20).
		var pannelDuration = (duration * 1000) / nPannels; // in ms
		var pannelWidth = Math.round(nFrames / nPannels); // in number of frames

		for (var i=0; i<nPannels; i++) {

			var jMin = Math.round(pannelWidth * i);
			var jMax = Math.round(pannelWidth * (i + 1));

			var tMid = ((i*1000*duration)/nPannels)+((500*duration)/nPannels);

			var waveChunk = waveBuffer.slice(jMin, jMax);

			var aVal = Math.max.apply(null, waveChunk);

			var fVal = findFFTRoot(waveChunk, sampleRate);


			VTIconStore.actions.newKeyframe("amplitude", tMid, aVal, false, "main");
			VTIconStore.actions.newKeyframe("frequency", tMid, fVal, false, "main");
		}

		VTIconStore.actions.unselectKeyframes("main");
		VTIconStore.actions.addSelectedKeyframes([0,1], "main");
		VTIconStore.actions.deleteSelectedKeyframes("main");
	});
}

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
var findFFTRoot = function(data, sampleRate) {
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
}




module.exports = {
	actions:saveLoadActions,
	store:saveLoadStore
};
