
import React from 'react';
import d3 from 'd3';

var DragStore = require('./stores/dragstore.js');
var TimelineMixin = require('./util/timelinemixin.js');

var PlayHead = React.createClass({

	mixins : [
		TimelineMixin("divWrapper")
		],

	propTypes: {
		name: React.PropTypes.string.isRequired,
		duration: React.PropTypes.number.isRequired,
		currentTime: React.PropTypes.number.isRequired,
		playheadFill: React.PropTypes.string.isRequired,
		displayPlayhead: React.PropTypes.bool.isRequired
			},
	
	getDefaultProps: function() {
	    return {
	      height: 20,
	      width:'100%',
	      playheadWidth: 20,
	      background:'#EEEEEE',
	      axisTickLength:7
	    }
	},

   	_handleMouseDown : function(e) {
   		var x = e.clientX-this.state.offsetLeft;
   		DragStore.actions.startPlayheadDrag(this.props.name, this.props.scaleX.invert(x));
   	},

	render : function() {
		var divStyle = {
			height:this.props.height,
			width:this.props.width,
			background:this.props.background
		};

		var scaleX = this.props.scaleX;
		var axisTickLength = this.props.axisTickLength;
        var x = this.props.scaleX(this.props.currentTime);
        var playheadWidth = this.props.playheadWidth;
        var h = this.props.height;
		var playheadPoints = (x-playheadWidth/2) + "," + 0 + " " 
								+ (x+playheadWidth/2) + "," + 0 + " "
								+ x + "," + h;

		var playheadTriangle = <polygon />;
		if (this.props.displayPlayhead) {
			playheadTriangle = <polygon points={playheadPoints} fill={this.props.playheadFill} />;
		}

		return (

			<div onMouseDown={this._handleMouseDown} ref="divWrapper" style={divStyle}>
				<svg width="100%" height="100%">
						{scaleX.ticks().map(function(tick, idx) {

								//tick line
								var lineProps = {
									stroke:'black',
									strokeWidth:0.5
								};
								lineProps['x1'] = scaleX(tick);
								lineProps['x2'] = scaleX(tick);
								lineProps['y1'] = 0;
								lineProps['y2'] = 0 + axisTickLength;
								var line = React.DOM.line(lineProps);

								//tick label
								var labelProps = {
									fontSize:10,
									textAlign:'center',
									className:'unselectable'
								};
								//hacky way of centering
								labelProps['x'] = scaleX(tick)-2.5*tick.toString().length;
								labelProps['y'] = axisTickLength+10;
								var label = React.DOM.text(labelProps, tick);


								return (<g key={idx}>
											{line}
											{label}
										</g>);


						})
						}
						{playheadTriangle}
				</svg>
			</div>
			);
	}

});

module.exports = PlayHead;