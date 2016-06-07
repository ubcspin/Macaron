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
    this._data["slider"].property("value", mix);
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
        this._data["slider"].property("value", a);
        this._data["wave1value"] = a;
        this._data["wave2value"] = (100 - a);
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
  }


});

module.exports = {
  actions: MixControlActions,
  store: MixControlStore
}
