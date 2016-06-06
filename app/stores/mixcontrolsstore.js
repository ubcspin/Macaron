import Reflux from 'reflux'

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

var MixControlStore = Reflux.createStore({

  listenables: [MixControlActions],

  init: function() {

    this._data = {
      wave1value: 50,
      wave2value: 50
    };

  },

  onCreateSlider: function() {

    var sliderActivate = function() {
      var amt1 = Math.round(100 - this.value).toString() + "%";
      var amt2 = Math.round(this.value).toString() + "%";
      document.getElementById("signal-1-amount").setAttribute("placeholder", amt1);
      document.getElementById("signal-2-amount").setAttribute("placeholder", amt2);
    }

    var slider = d3.select("#amount-slider")
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

  },

  onSelectAlgorithm: function() {
      var selectedAlgorithm = document.getElementById('mix-mode-drop-down').value;
      alert('you picked something: ' + selectedAlgorithm);
  },

  onQuickMix: function(mix) {
    alert('mix ' + mix.toString());
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
  }


});

module.exports = {
  actions: MixControlActions,
  store: MixControlStore
}
