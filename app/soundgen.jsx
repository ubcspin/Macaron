/*
	SoundGen

	A react component that wraps a sound generator,
	right now, this is Audiolet. 

*/

import React from 'react';
require('./../thirdparty/audiolet/audiolet.js');

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
			this.state.mult.value.setValue(this.props.amplitude);
		}
		return <div id="soundgen"></div>

	}

});


module.exports = SoundGen;

