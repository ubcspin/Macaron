/** @jsx React.DOM */

var ClickDrag = React.createClass({
	getInitialState : function () {
		return {
					x: 0.5,
					y: 0.5,
					r: 50,
					dragging: false
		}
	},

	handleMouseUp : function(event) {
		this.setState({dragging:false});
	},

	handleMouseDown : function(event) {
		this.setState({dragging:true});
		this.handleMouseMove(event);
	},


	handleMouseMove : function(event) {

		if (this.state.dragging) {
			var xScale = d3.scale.linear()
						.domain([0, 1])
						.range([0, this.props.width]);
			var yScale = d3.scale.linear()
						.domain([0,1])
						.range([0,this.props.height]);

			var newX = xScale.invert(event.clientX);
			var newY = xScale.invert(event.clientY);

	 		this.setState({x:newX, y:newY});
		}
			
	},

	render : function() {

			var xScale = d3.scale.linear()
						.domain([0, 1])
						.range([0, this.props.width]);
			var yScale = d3.scale.linear()
						.domain([0,1])
						.range([0,this.props.height]);

		return (
			<div id="app">
				<SoundGen frequency={this.state.x*400+50}/>
				<svg id="chart" width={this.props.width} height={this.props.height} onMouseDown={this.handleMouseDown} onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp}>
					<circle cx={xScale(this.state.x)} cy={yScale(this.state.y)} fill="black" r={this.state.r}></circle>
				</svg>
			</div>);
		}

	});


		React.render(<ClickDrag width="500" height="500" />, document.getElementById('mount-point'));