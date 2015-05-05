/** @jsx React.DOM */

var IconVis = React.createClass({

	propTypes: {
		vticon : React.PropTypes.object.isRequired,
		currentTime: React.PropTypes.number.isRequired,
		keyframeCircleRadius: React.PropTypes.number.isRequired,
		playheadFill: React.PropTypes.string.isRequired
			},
	
	getDefaultProps: function() {
	    return {
	      height: '50px',
	      width:'100%'
	    }
	},

	//TODO: put this in a mixin or something
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

		var divStyle = {
			height:this.props.height,
			width:this.props.width
		};


		//TODO: Put this scaleX into App somewhere, it's shared with several components
		var scaleX = d3.scale.linear()
                    .domain([0, this.props.vticon.duration])
                    .range([this.props.keyframeCircleRadius, this.state.actualWidth-this.props.keyframeCircleRadius]);


        var vticonline = d3.svg.line()
								.x(function(d) {
									return scaleX(d.x)
								})
								.y(function(d) {
									return d[1]
								});           

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
					<path stroke={this.props.playheadFill} strokeWidth="2" fill="none" d={currentTimePath} />

				</svg>

			</div>
			);
	}

});