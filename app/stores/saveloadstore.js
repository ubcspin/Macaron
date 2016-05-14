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

		// Here you can specify how you'd like the files to be named
		var jsonFileName = "my_waveform.json";
		var wavFileName = "my_waveform.wav";

		// This function closes the Save window when the "close" button is clicked.
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
		var dataJSON = JSON.stringify(VTIconStore.store.getInitialState()["main"], null, 2);
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

		/**
		 * TODO: Implement WAV download
		 */
		var wavBuffer = this.generateWavFile();

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

	generateWavFile: function(trackLength) {
    /**
     * Here's a constructor for a WavBundle object I've made. This object
     *  will contain all the info necessary to create a WAV file. Most of the
     *   data is currently hard-coded, but making it as an object will leave
     *    some wiggle-room for future improvements.
     *
     * Remember! It's little-endian!
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
        * makeWavContent will generate the actual sound-producing
        *  portion of the WAV file.
        **/
      this.generateWavContent = function() {

				var iconStore = VTIconStore.store.getInitialState()["main"];
				var ampParams = iconStore.parameters.amplitude.data;
				var freqParams = iconStore.parameters.frequency.data;

        var range = Math.pow(2, this.bitDepth - 1) - 2;
									// minus 2 to avoid any clipping.

				var phaseShift = 0;

        // calculate the speaker displacement at each frame
        //  emulating a sinewave here...
        for (var i=0; i<=this.nSamples; i=(i+this.sampleSize)) {

          var t = ((i * 1000) / this.sampleRate);

					var amp = getCurrentAmplitude(t, ampParams);
					var ft = getCurrentFT(t, freqParams); // Integral of freq over t
					var needsShift = needsPhaseShift(t, freqParams);
					if (needsShift) {
						//phaseShift = computePhaseShift(t, freqParams, phaseShift);
				  }

					var vol = range * amp;
					var angle = Math.sin((2 * Math.PI * ft) + phaseShift);
          var oscOffset = parseInt(Math.round(vol * angle));

          // Now if the value being written is negative, convert it to signed.
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
		var duration = VTIconStore.store.getInitialState()["main"].duration / 1000;

    var wavObj = new WavBundle(duration); // a 3 second long clip
    wavObj.generateWavHeader();
    wavObj.generateWavContent(); // volume = 1, frequency = 350
    return wavObj.buffer;

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



/**
 *  getCurrentAmplitude computes what the amplitude should be at
 *   time = t based on the keyframes created by the user in the
 *    "Amplitude" pane of the Macaron editor.
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
	**/
var getCurrentFT = function(t, freqData) {

	var ft = 0; // default

	for (var j=0; j<freqData.length; j++) {

		// Case 1: t is before the first keyframes
		if ((t <= freqData[0].t) && (j ==0)) {
			ft = freqData[0].value * (t/1000);
		}

		// Case 2: t is between two keyframes
		else if ((t < freqData[j].t) && (t >= freqData[j-1].t)) {

			// var fc = freqData[j-1].value; // Carrier frequency
			// var Df = freqData[j].value - freqData[j-1].value; // Max change in frequency
			// var Vm0 = (freqData[j].t - freqData[j-1].t) / fc; // Initial V mod
			// var Vm = t; // mod function of time
			// var freq = (fc + ((Df/Vm0) * Vm));

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

	return ft;
}





/**
 *  needsPhaseShift returns a boolean indicating whether or not the outputted
 *   waveform has a discontinuity large enough to require some sort of
 *    transformation. This occurs when there is a change in frequency over time
 **/
var needsPhaseShift = function(t, freqData) {

	var needsShift = false; //stub

	for (var j=0; j<freqData.length; j++) {
		if (freqData[j].t == t) {
			needsShift = true;
			alert('it happened...');
		}
	}

	return needsShift;
}





/**
 *  computePhaseShift is only called when the outputted waveform changes
 *   frequency, and the speaker displacement before and after the frequency
 *    change do not align. This function will return the value of offset
 *     that will realign the waveform after a change in frequency.
 **/
var computePhaseShift = function(t, freqData, oldPhaseShift) {

	var tOld = t - (1/44100); // Assuming sampleRate = 44100
	var ftOld = getCurrentFT(tOld, freqData);
	var ftNew = getCurrentFT(t, freqData);
	var phaseShift = (ftOld + oldPhaseShift) / ftNew;

	return phaseShift;
}


module.exports  = {
	actions:saveLoadActions,
	store:saveLoadStore
};
