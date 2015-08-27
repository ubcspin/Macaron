/*
	SoundGen

	A react component that wraps a sound generator,
	right now, this is Audiolet. 

*/

import React from 'react';
require('./../thirdparty/audiolet/audiolet.js');

var SCALE_FUNCTION = function(in_gain, in_freq) {
	var rv = in_gain;
	var pf = 0;
	var scaleFactor = 1;
	if (in_freq < 300) {
		pf = (in_freq-50)/250; //proportion of way btwn 50 and 300
		scaleFactor = pf*4+1; // proportion of gain difference, here 24
	} else {
		pf = (in_freq-300)/200; //proportion of way btwn 300 and 550
		scaleFactor = (1-pf)*3+2; // proportion of gain difference, here 24
	}
	rv = in_gain / scaleFactor;

	return rv;

};

//TODO: import Audiolet

var SoundGen = React.createClass({

	propTypes: {
		frequency: React.PropTypes.number.isRequired,
		amplitude: React.PropTypes.number.isRequired,
		mute: React.PropTypes.bool
			},

	getInitialState : function() {
		return {
			audiolet: null,
			sine: null,
			mult: null
		}

	},

	getDefaultProps: function() {
	    return {
	      perceptuallyScaleOutput:true
	    }
	},

	componentWillMount: function() {

		var audiolet = new Audiolet();
		var sine = new Sine(audiolet, this.props.frequency);
		var mult = new Multiply(audiolet, this.props.amplitude);
		sine.connect(mult);
		mult.connect(audiolet.output);


		this.setState( {
			audiolet: audiolet,
			sine: sine,
			mult: mult
		});
	},


	componentWillUnmount: function()
	{
		//Clean up for Audiolet, none for now

	},

	render: function() {
		this.state.sine.frequency.setValue(this.props.frequency);
		if(this.props.mute) {
			this.state.mult.value.setValue(0);
		} else {
			var amplitude = this.props.amplitude;
			if (this.props.perceptuallyScaleOutput)
			{
				amplitude = SCALE_FUNCTION(amplitude, this.props.frequency);
			}
			this.state.mult.value.setValue(amplitude);
		}
		return <div id="soundgen"></div>

	}

});


module.exports = SoundGen;

