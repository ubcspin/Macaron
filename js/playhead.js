/** @jsx React.DOM */

var PlayHead = React.createClass({

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

	//TODO: move this resizing stuff into a mixin

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

			<div ref="divWrapper" style={divStyle}>
				<svg width="100%" height="100%">
					<polygon points={playheadPoints} fill={this.props.playheadFill} />
				</svg>
			</div>
			);
	}

});