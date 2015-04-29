/** @jsx React.DOM */
/*
	SoundGen

	A react component that wraps a sound generator,
	right now, this is Flocking. 

*/

var SoundGen = React.createClass({

	propTypes: {
		frequency: React.PropTypes.number.isRequired
			},

	getInitialState : function() {
		return {
			audiolet: null,
			sine: null
		}

	},

	componentWillMount: function() {

		var audiolet = new Audiolet();
		var sine = new Sine(audiolet, this.props.frequency);
		sine.connect(audiolet.output);

		this.setState( {
			audiolet: audiolet,
			sine: sine
		});
	},


	componentWillUnmount: function()
	{
		//Clean up for Audiolet, none for now

	},

	render: function() {
		this.state.sine.frequency.setValue(this.props.frequency);
		return <div id="soundgen"></div>

	}

});



