
import React from 'react';
import d3 from 'd3';

var TimelineMixin = require('./util/timelinemixin.js')


var IconVis = React.createClass({

	mixins : [TimelineMixin],

	propTypes: {
		vticon : React.PropTypes.object.isRequired,
		currentTime: React.PropTypes.number.isRequired,
		keyframeCircleRadius: React.PropTypes.number.isRequired,
		playheadFill: React.PropTypes.string.isRequired,
		interpolateParameters: React.PropTypes.func.isRequired
			},
	
	getDefaultProps: function() {
	    return {
	      height: '50px',
	      width:'100%',
	      visColor:'#FFDDAD',
	      resolution:2000
	    }
	},

	render : function() {

		var divStyle = {
			height:this.props.height,
			width:this.props.width
		};


		//TODO: Put this scaleX into App somewhere, it's shared with several components
		var scaleX = d3.scale.linear()
                    .domain([0, this.props.vticon.duration])
                    .range([this.props.keyframeCircleRadius, this.state.actualWidth-this.props.keyframeCircleRadius]);

        var scaleY = d3.scale.linear()
                    .domain( [-1, 1]) // return value from sine
                    .range([this.state.actualHeight, 0]);

        var vticonline = d3.svg.line()
								.x(function(d) {
									return scaleX(d[0])
								})
								.y(function(d) {
									return scaleY(d[1])
								});

		//do icon visualization
		var visPoints = [];
		for (var i = 0; i < this.props.resolution; i++) {
			var t_in_ms = i/this.props.resolution*this.props.vticon.duration;
			var t_in_s = t_in_ms/1000;

			//var paramValues = this.props.interpolateParameters(t_in_ms);
			var amplitude = this.props.interpolateParameter("amplitude", t_in_ms);//paramValues.amplitude;
			var frequency = this.props.interpolateParameter("frequency", t_in_ms); //paramValues.frequency;
			//console.log("Frequency for ", i, " at time", t_in_ms, "is", frequency);
			//var frequency = this.props.interpolateParameter("frequency", t_in_ms);
			var v = amplitude * Math.sin(t_in_s*frequency*2*Math.PI);
			visPoints.push ( [t_in_ms, v]);
		}

		var visPath = vticonline(visPoints);


		//current time vis
		//TODO: put this in a seperate location
		var currentTimeLineFunc = d3.svg.line()
								.x(function(d) {
									return d[0]
								})
								.y(function(d) {
									return d[1]
								});
		var currentTimePath = currentTimeLineFunc([
						[scaleX(this.props.currentTime), 0],
						[scaleX(this.props.currentTime), this.state.actualHeight]	
				]);

		

		

		return (
			<div ref="divWrapper" style={divStyle}>
				<svg height="100%" width="100%">
					<path stroke={this.props.visColor} strokeWidth="1" fill="none" d={visPath} />
					<path stroke={this.props.playheadFill} strokeWidth="2" fill="none" d={currentTimePath} />
				</svg>

			</div>
			);
	}

});

module.exports = IconVis;