
import React from 'react';
import d3 from 'd3';

var VTIconStore = require('./stores/vticonstore.js');
var TimelineMixin = require('./util/timelinemixin.js');

var KeyframeEditor = React.createClass({

	mixins : [TimelineMixin("divWrapper")],

	propTypes: {
		parameter : React.PropTypes.string.isRequired,
		vticon : React.PropTypes.object.isRequired,
		keyframeCircleRadius: React.PropTypes.number.isRequired,
		playheadFill: React.PropTypes.string.isRequired,
		currentTime: React.PropTypes.number.isRequired
			},
	
	getDefaultProps: function() {
	    return {
	      height: 100,
	      width:"100%",
	      circleColor:'#FF8400'
	    }
	},


	render : function() {

		var keyframeCircleRadius = this.props.keyframeCircleRadius;
		var circleColor = this.props.circleColor;

		var data = this.props.vticon.parameters[this.props.parameter].data;

		var valueScale = this.props.vticon.parameters[this.props.parameter].valueScale;


        var scaleY = d3.scale.linear()
                    .domain(valueScale)
                    .range([this.props.height-keyframeCircleRadius, keyframeCircleRadius]);

        var scaleX = this.props.scaleX;
        var height = this.props.height;

        console.log("here1");


        var lineGen = d3.svg.line()
                            .x(function(d)
                            {
                                return scaleX(d.t);
                            })
                            .y(function(d)
                            {
                                return scaleY(d.value);
                            });

		var divStyle = {
			height:this.props.height,
			width:this.props.width,
			background:this.props.background
		};


		var firstValue = data[0].value;
		var lastValue = data[data.length-1].value;

		var fillPath =lineGen(
				[{t:0, value:valueScale[0]}]
				.concat([{t:0, value:firstValue}])
				.concat(data)
				.concat([{t:this.props.vticon.duration, value:lastValue}])
				.concat([{t:this.props.vticon.duration, value:valueScale[0]}]));


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
						[scaleX(this.props.currentTime), height]	
				]);

		return (
				<div ref="divWrapper" style={divStyle}>
					<svg  width="100%" height="100%" onClick={this._onClick}>
						<path
							d={fillPath}
							fill="#FFDDAD"
							stroke="#FFDDAD">
						</path>

						{data.map(function(d)
							{
								return (
									<circle cx={scaleX(d.t)} cy={scaleY(d.value)} r={keyframeCircleRadius} fill={circleColor}>
									</circle>
									);

							})
						}
						<path stroke={this.props.playheadFill} strokeWidth="2" fill="none" d={currentTimePath} />

					</svg>
				</div>
			);
	},


	/**
	* UI Callbacks
	*/
	_onClick(e) {
		var keyframeCircleRadius = this.props.keyframeCircleRadius;

		var valueScale = this.props.vticon.parameters[this.props.parameter].valueScale;

        var scaleY = d3.scale.linear()
                    .domain(valueScale)
                    .range([this.props.height-keyframeCircleRadius, keyframeCircleRadius]);

        var x = e.clientX - this.state.offsetLeft;
        var y = e.clientY - this.state.offsetTop;

        VTIconStore.actions.newKeyframe(this.props.parameter, this.props.scaleX.invert(x), scaleY.invert(y));

	}



});

module.exports = KeyframeEditor;