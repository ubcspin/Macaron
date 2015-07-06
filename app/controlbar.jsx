
import React from 'react';
import d3 from 'd3';


var ControlBar = React.createClass({

	propTypes: {
		playing: React.PropTypes.bool.isRequired
			},

	getDefaultProps: function() {
	    return {
	      width:'100%',
	      background:'lightgrey',
	      fontSize: "28pt",


	    }
	},

	render : function() {

		var divStyle = {
			height:this.props.height,
			width:this.props.width,
			background:this.props.background,
			fontSize:this.props.fontSize
		};

		var timeControlStyle  = {
			marginLeft:'auto',
			marginRight:'auto',
			textAlign:'center'
		};

		var buttonStyle = {
			marginLeft:'0.5em',
			marginRight:'0.5em'
		};

		var iconText = "fa fa-play";
		if (this.props.playing) {
			iconText = "fa fa-pause";
		}

		return (
			<div className="controlbar" style={divStyle}>
				<div className="time-control" style={timeControlStyle}>
					 <i className="fa fa-step-backward" style={buttonStyle}></i>
					 <i className={iconText} style={buttonStyle}></i>
					 <i className="fa fa-step-forward" style={buttonStyle}></i>
				</div>	
			</div>
			);
	}

});

module.exports = ControlBar;