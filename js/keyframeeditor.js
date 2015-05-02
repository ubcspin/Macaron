/** @jsx React.DOM */

var KeyframeEditor = React.createClass({

	propTypes: {
		parameter : React.PropTypes.string.isrequired
			},
	
	getDefaultProps: function() {
	    return {
	      height: '50px',
	      width:'100%',
	      background:'yellow'
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