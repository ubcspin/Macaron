/** @jsx React.DOM */

var IconVis = React.createClass({

	propTypes: {
			},
	
	getDefaultProps: function() {
	    return {
	      height: '50px',
	      width:'100%',
	      background:'red'

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