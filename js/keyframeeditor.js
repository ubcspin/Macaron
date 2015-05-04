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
	      circleColor:'blue'
	    }
	},

	render : function() {

		var circleRadius = this.props.circleRadius;
		var circleColor = this.props.circleColor;

		var scaleX = d3.scale.linear()
                    .domain([0, this.props.vticon.duration])
                    .range([circleRadius, this.props.width-circleRadius]);

        var scaleY = d3.scale.linear()
                    .domain(this.props.vticon[this.props.parameter].valueScale)
                    .range([this.props.height-circleRadius, circleRadius]);

		var divStyle = {
			height:this.props.height,
			width:this.props.width,
			background:this.props.background
		};


		return (
			<svg width={this.props.width} height={this.props.height}>
				{this.props.vticon[this.props.parameter].data.map(function(d)
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