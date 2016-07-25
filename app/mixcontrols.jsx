import React from 'react'
import Reflux from 'reflux'
import D3 from 'd3'

var MixControlStore = require('./stores/mixcontrolsstore.js');

var MixControls = React.createClass({

  render: function() {

    require('../css/mixcontrols.css');

    return (
      <div id="mix-controller">

        <div id="upper-mix-controls-container">
          <div id="mix-mode">
            <span id="select-mix-mode-title">Select your mixing algorithm:
            </span>
            <select id="mix-mode-drop-down"
              name="mix-mode-selector"
              onChange={MixControlStore.actions.selectAlgorithm}>
              <option value="vectorCrossfade">Vector Crossfade</option>
              <option value="direct">Direct Keyframe Combination</option>
              <option value="lameCrossfade">Lame Crossfade</option>
              <option value="dtw">Dynamic Time Warping</option>
              <option value="smartmix">SmartMix &#9786;</option>
              <option value="DTWwFreq">DTW (with frequency)</option>
            </select>
          </div>


          <div id="quick-mix">
            <span id="quick-mix-title">Quick Mix:</span>
            <div id="quick-mix-buttons-container">
              <button type="button" onClick={MixControlStore.actions.quickMix.bind(this, 0)}>0%</button>
              <button type="button" onClick={MixControlStore.actions.quickMix.bind(this, 25)}>25%</button>
              <button type="button" onClick={MixControlStore.actions.quickMix.bind(this, 50)}>50%</button>
              <button type="button" onClick={MixControlStore.actions.quickMix.bind(this, 75)}>75%</button>
              <button type="button" onClick={MixControlStore.actions.quickMix.bind(this, 100)}>100%</button>
            </div>
          </div>
        </div>


        <div id="mix-amount">
          <div id="amount-slider-container">
            <div id="load-buttons-container">
              <button
                id="load-signal-1-button"
                type="button"
                onClick={MixControlStore.actions.loadWaveform1}>load waveform 1</button>
              <input type="file" name="wav1File" id="wav-1-file" ></input>
              <button
                id="load-signal-2-button"
                type="button"
                onClick={MixControlStore.actions.loadWaveform2}>load waveform 2</button>
              <input type="file" name="wav2File" id="wav-2-file" ></input>
            </div>
            <div id="middle-slider-container">
              <span id="wave-1-title">Wave 1</span>
              <div id="amount-slider"></div>
              <span id="wave-2-title">Wave 2</span>
            </div>
            <div id="mix-value-entries-container">
              <input id="signal-1-amount" type="text" name="signal-1-precise-value"></input>
              <input id="signal-2-amount" type="text" name="signal-2-precise-value"></input>
            </div>
          </div>
        </div>


      </div>
    );
  },

  componentDidMount: function() {
    MixControlStore.actions.createSlider();
  }

});

module.exports = MixControls;
