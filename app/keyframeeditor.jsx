
import React from 'react';
import d3 from 'd3';

var KeyframeEditor = React.createClass({

	propTypes: {
		parameter : React.PropTypes.string.isRequired,
		vticon : React.PropTypes.object.isRequired,
		keyframeCircleRadius: React.PropTypes.number.isRequired,
		playheadFill: React.PropTypes.string.isRequired,
		currentTime: React.PropTypes.number.isRequired,
			},
	
	getDefaultProps: function() {
	    return {
	      height: 100,
	      width:"100%",
	      circleColor:'#FF8400'
	    }
	},


	handleResize: function(e) {
    	var width = this.refs.divWrapper.getDOMNode().clientWidth;
    	var height = this.refs.divWrapper.getDOMNode().clientHeight;;

    	this.setState( {actualWidth:width, actualHeight:height} );

	},


	getInitialState: function() {

		return {
			actualWidth:10,
			actualHeight:10
		}

	},


  	componentDidMount: function () {

		window.addEventListener('resize', this.handleResize);
    	
    	var width = this.refs.divWrapper.getDOMNode().clientWidth;
    	var height = this.refs.divWrapper.getDOMNode().clientHeight;;

    	this.setState( {actualWidth:width, actualHeight:height} );
   	},

	render : function() {

		var keyframeCircleRadius = this.props.keyframeCircleRadius;
		var circleColor = this.props.circleColor;

		var data = this.props.vticon.parameters[this.props.parameter].data;
		var valueScale = this.props.vticon.parameters[this.props.parameter].valueScale;


		//TODO: Put this scaleX into App somewhere, it's shared with several components
		var scaleX = d3.scale.linear()
                    .domain([0, this.props.vticon.duration])
                    .range([keyframeCircleRadius, this.state.actualWidth-keyframeCircleRadius]);

        var scaleY = d3.scale.linear()
                    .domain(valueScale)
                    .range([this.state.actualHeight-keyframeCircleRadius, keyframeCircleRadius]);

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
						[scaleX(this.props.currentTime), this.state.actualHeight]	
				]);

		return (
				<div ref="divWrapper" style={divStyle}>
					<svg  width="100%" height="100%">
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
	}

});

module.exports = KeyframeEditor;