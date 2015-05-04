/** @jsx React.DOM */

var KeyframeEditor = React.createClass({

	propTypes: {
		parameter : React.PropTypes.string.isRequired,
		vticon : React.PropTypes.object.isRequired
			},
	
	getDefaultProps: function() {
	    return {
	      height: 50,
	      width:500,
	      background:'yellow',
	      circleRadius:5,
	      circleColor:'#FF8400'
	    }
	},

	render : function() {

		var circleRadius = this.props.circleRadius;
		var circleColor = this.props.circleColor;

		var data = this.props.vticon[this.props.parameter].data;
		var valueScale = this.props.vticon[this.props.parameter].valueScale;


		var scaleX = d3.scale.linear()
                    .domain([0, this.props.vticon.duration])
                    .range([circleRadius, this.props.width-circleRadius]);

        var scaleY = d3.scale.linear()
                    .domain(valueScale)
                    .range([this.props.height-circleRadius, circleRadius]);

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

		return (
			<svg width={this.props.width} height={this.props.height}>
				<path
					d={fillPath}
					fill="#FFDDAD"
					stroke="#FFDDAD">
				</path>

				{data.map(function(d)
					{
						return (
							<circle cx={scaleX(d.t)} cy={scaleY(d.value)} r={circleRadius} fill={circleColor}>
							</circle>
							);

					})
				}
			</svg>
			);
	}

});