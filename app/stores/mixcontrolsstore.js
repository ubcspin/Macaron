import Reflux from 'reflux'

var MixControlActions = Reflux.createActions(
  [ 'createSlider' ]
);

var MixControlStore = Reflux.createStore({

  listenables: [MixControlActions],

  onCreateSlider: function() {

    var sliderActivate = function() {
      console.log('slidering');
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

  }


});

module.exports = {
  actions: MixControlActions,
  store: MixControlStore
}
