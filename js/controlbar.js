/** @jsx React.DOM */

var ControlBar = React.createClass({

	propTypes: {
			},

	getDefaultProps: function() {
	    return {
	      height: '50px',
	      width:'100%',
	      background:'black'

	    }
	},

	render : function() {

		var divStyle = {
			height:this.props.height,
			width:this.props.width,
			background:this.props.background
		};

		return (
			<div style={divStyle}></div>
			);
	}

});