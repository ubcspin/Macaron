/** @jsx React.DOM */

var PlayHead = React.createClass({

	propTypes: {
			},
	
	getDefaultProps: function() {
	    return {
	      height: '50px',
	      width:'100%',
	      background:'blue'

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