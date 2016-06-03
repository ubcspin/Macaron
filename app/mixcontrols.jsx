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
            <span id="select-mix-mode-title">Here's the mix mode drop down menu:
              <select id="mix-mode-drop-down" name="mix-mode-selector">
                <option value="crossfade">Crossfade</option>
                <option value="dtw">Dynamic Time Warping</option>
                <option value="other">Something Else</option>
              </select>
            </span>
          </div>


          <div id="quick-mix">
            <span id="quick-mix-title">Quick Mix</span>
            <div id="quick-mix-buttons-container">
              <button type="button">0%</button>
              <button type="button">25%</button>
              <button type="button">50%</button>
              <button type="button">75%</button>
              <button type="button">100%</button>
            </div>
          </div>
        </div>


        <div id="mix-amount">
          <div id="amount-slider-container">
            <div id="load-buttons-container">
              <button id="load-signal-1-button" type="button">load waveform 1</button>
              <button id="load-signal-2-button" type="button">load waveform 2</button>
            </div>
            <div id="middle-slider-container">
              <span id="wave-1-title">Signal 1</span>
              <div id="amount-slider"></div>
              <span id="wave-2-title">Signal 2</span>
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
