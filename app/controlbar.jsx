
import React from 'react';
import d3 from 'd3';

var PlaybackStore = require('./stores/playbackstore.js');


var ControlBar = React.createClass({

	propTypes: {
		playing: React.PropTypes.bool.isRequired,
		mute: React.PropTypes.bool.isRequired
			},

	getDefaultProps: function() {
	    return {
	      width:'100%',
	      background:'lightgrey',
	      fontSize: "28pt",


	    }
	},


	/**
	* Event handlers
	* 
	*/
	_onMuteClick : function (event) {
		PlaybackStore.actions.toggleMute();
	},

	_onPlayClick : function (event) {
		PlaybackStore.actions.togglePlaying();
	},

	_onStepBackwardClick : function (event) {
		PlaybackStore.actions.stepBackward();
	},

	_onStepForwardClick : function (event) {
		PlaybackStore.actions.stepForward();
	},

	/**
	* Rendering
	* 
	*/

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
					 <i onClick={this._onStepBackwardClick} className="fa fa-step-backward" style={buttonStyle}></i>
					 <i onClick={this._onPlayClick} className={iconText} style={buttonStyle}></i>
					 <i onClick={this._onStepForwardClick} className="fa fa-step-forward" style={buttonStyle}></i>
					 <span onClick={this._onMuteClick}><input type="checkbox" checked={this.props.mute}/>Mute</span>
				</div>	
			</div>
			);
	}

});

module.exports = ControlBar;