
import React from 'react';
import d3 from 'd3';

var PlaybackStore = require('./stores/playbackstore.js');

var TimelineMixin = require('./util/timelinemixin.js');

var PlayHead = React.createClass({

	mixins:[TimelineMixin("divWrapper")],

	propTypes: {
		duration: React.PropTypes.number.isRequired,
		currentTime: React.PropTypes.number.isRequired,
		keyframeCircleRadius: React.PropTypes.number.isRequired,
		playheadFill: React.PropTypes.string.isRequired

			},
	
	getDefaultProps: function() {
	    return {
	      height: 20,
	      width:'100%',
	      playheadWidth: 20,
	      background:'#EEEEEE'
	    }
	},


  	componentDidMount: function () {
    	this.mouseDown = false;
   	},

   	_handleMouseDown : function(e) {
   		this.mouseDown = true;
   		this._handleMouseMove(e);
   	},

   	_handleMouseMove : function(e) {
   		if (this.mouseDown) {
	   		//TODO: Put this scaleX into App somewhere, it's shared with several components
			var circleRadius = this.props.keyframeCircleRadius;
			var scaleX = d3.scale.linear()
	                    .domain([0, this.props.duration])
	                    .range([circleRadius, this.state.actualWidth-circleRadius]);
	        PlaybackStore.actions.setTime(scaleX.invert(e.clientX));
    	}
   	},

   	_handleMouseUp : function(e) {
   		this.mouseDown = false;
   	},


	render : function() {
		var circleRadius = this.props.keyframeCircleRadius;


		var divStyle = {
			height:this.props.height,
			width:this.props.width,
			background:this.props.background
		};

		//TODO: Put this scaleX into App somewhere, it's shared with several components
		var scaleX = d3.scale.linear()
                    .domain([0, this.props.duration])
                    .range([circleRadius, this.state.actualWidth-circleRadius]);


        var x = scaleX(this.props.currentTime);
        var playheadWidth = this.props.playheadWidth;
        var h = this.props.height;
		var playheadPoints = (x-playheadWidth/2) + "," + 0 + " " 
								+ (x+playheadWidth/2) + "," + 0 + " "
								+ x + "," + h;
		return (

			<div onMouseUp={this._handleMouseUp} onMouseDown={this._handleMouseDown} onMouseMove={this._handleMouseMove} ref="divWrapper" style={divStyle}>
				<svg width="100%" height="100%">
					<polygon points={playheadPoints} fill={this.props.playheadFill} />
				</svg>
			</div>
			);
	}

});

module.exports = PlayHead;