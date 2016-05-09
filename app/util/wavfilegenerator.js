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
     **/
    var WavBundle = function(trackLength) {
      this.channels = 1; // Standard mono-audio
      this.sampleRate = 44100; //Hz (44100 is pretty universal)
      this.bitDepth = 16; // Again, pretty standard...
      this.trackLength = trackLength; // in seconds.
      this.bitRate = this.channels * this.sampleRate * this.bitDepth;
      this.totalFrames = this.sampleRate * trackLength;
      this.buffer = new Int8Array(this.totalFrames + 44);

      /**
       * TgenerateWaveHeader makes a new headBuff with a header
       *  for the WAV file in the standard format.
       *
       *  see: http://www.topherlee.com/software/pcm-tut-wavformat.html
       *   for a reference about what the header should contain.
       **/
      this.generateWavHeader = function() {

        var headBuff = new Int8Array(this.totalFrames + 44);

        headBuff[0]  = 0x52; //R
        headBuff[1]  = 0x49; //I
        headBuff[2]  = 0x46; //F
        headBuff[3]  = 0x46; //F

        headBuff[4]  = 0x00; // We'll come back to this later!
        headBuff[5]  = 0x00;
        headBuff[6]  = 0x00;
        headBuff[7]  = 0x00;

        headBuff[8]  = 0x57; //W
        headBuff[9]  = 0x41; //A
        headBuff[10] = 0x56; //V
        headBuff[11] = 0x45; //E

        headBuff[12] = 0x00; //.
        headBuff[13] = 0x66; //f
        headBuff[14] = 0x6d; //m
        headBuff[15] = 0x74; //t

        headBuff[16] = 0x00; // This block sets the length of
        headBuff[17] = 0x01; //  the "format chunk" to 16
        headBuff[18] = 0x00;
        headBuff[19] = 0x00;

        headBuff[20] = 0x00; // Type of format (1 is PCM) - 2 byte integer
        headBuff[21] = 0x01;

        // This block sets the number of channels
        headBuff[22] = (0xff00 & this.channels) >> 8;
        headBuff[23] = 0x00ff & this.channels;

        // This block sets the sample rate
        headBuff[24] = (0xff000000 & this.sampleRate) >> 24;
        headBuff[25] = (0x00ff0000 & this.sampleRate) >> 16;
        headBuff[26] = (0x0000ff00 & this.sampleRate) >>  8;
        headBuff[27] =  0x000000ff & this.sampleRate;

        // Now to set the bitRate
        headBuff[28] = (0xff000000 & this.bitRate) >> 24;
        headBuff[29] = (0x00ff0000 & this.bitRate) >> 16;
        headBuff[30] = (0x0000ff00 & this.bitRate) >>  8;
        headBuff[31] =  0x000000ff & this.bitRate;

        // This block is equal to 4 (hard to understand why...)
        headBuff[32] = 0x01;
        headBuff[33] = 0x00;

        // This block sets the number of bits per sample
        headBuff[34] = (0xff00 & this.bitDepth) >> 8;
        headBuff[35] = 0x00ff & this.bitDepth;

        headBuff[36] =  0x64; //d
        headBuff[37] =  0x61; //a
        headBuff[38] =  0x74; //t
        headBuff[39] =  0x61; //a

        // Size of the "data" section
        headBuff[40] =  0x00;
        headBuff[41] =  0x00; //  Come back here when you know the file size!
        headBuff[42] =  0x00;
        headBuff[43] =  0x00;

        this.buffer = headBuff;
      }

      /**
        * makeWavContent will generate the actual sound-producing portion of the
        *  WAV file.
        **/
      this.generateWavContent = function() {

        // STUB

      }
    } /**  End of WavBundle Constructor  **/


    /**
     *  Here's where everything gets called in order to produce the WAV file
     **/
    var wavObj = new WavBundle(3); // a 3 second long clip
    wavObj.generateWavHeader();
    wavObj.generateWavContent();
    return wavObj.buffer;

  }
}

module.exports = WavFileGeneratorMixin;
