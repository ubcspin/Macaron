/** @jsx React.DOM */
/*
	SoundGen

	A react component that wraps a sound generator,
	right now, this is Flocking. 

*/

var SoundGen = React.createClass({

	propTypes: {
		frequency: React.PropTypes.number.isRequired,
		amplitude: React.PropTypes.number.isRequired
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
		this.state.mult.value.setValue(this.props.amplitude);
		return <div id="soundgen"></div>

	}

});



