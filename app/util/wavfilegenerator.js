/**
 * The generateWavFile function creates the contents of a WAV file that will
 *  be ready to be downloaded by a user when the "save" button is clicked.
 *    Author: Ben Clark
 **/
import React from 'react';
import d3 from 'd3';

var WavFileGeneratorMixin = {

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

        // For testing purposes only...
        console.log(this.bitRate);
        console.log(this.sampleSize);
        console.log(this.nSamples);
        console.log(this.totalSize);

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
      this.generateWavContent = function(amp, freq) {

        var range = Math.pow(2, this.bitDepth - 1)
        var vol = range * amp;

        // calculate the speaker displacement at each frame
        //  emulating a sinewave here...
        for (var i=0; i<=this.nSamples; i=(i+this.sampleSize)) {

          var t = (i / this.sampleRate);

          if ((t % 1) == 0) {console.log(t);}

          var oscOffset = Math.round(vol * Math.sin(2 * Math.PI * t * freq));

          // Now if the value being written is negative, convert it to signed.
          if (oscOffset < 0) {
            oscOffset = ~(Math.abs(oscOffset));
          }

          this.buffer[(i*this.sampleSize)+44] = oscOffset;
        }
      }


    } /**  End of WavBundle Constructor  **/


    /**
     *  Heres where everything gets called in order to produce the WAV file
     **/
    var wavObj = new WavBundle(3); // a 3 second long clip
    wavObj.generateWavHeader();
    wavObj.generateWavContent(1, 350); // volume = 1, frequency = 350
    console.log(wavObj.buffer.length);
    console.log(wavObj.buffer.byteLength);
    return wavObj.buffer;

  }
}

module.exports = WavFileGeneratorMixin;
