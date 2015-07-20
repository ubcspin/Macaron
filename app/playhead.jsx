
import React from 'react';
import d3 from 'd3';

var DragStore = require('./stores/dragstore.js');
var TimelineMixin = require('./util/timelinemixin.js');

var PlayHead = React.createClass({

	propTypes: {
		duration: React.PropTypes.number.isRequired,
		currentTime: React.PropTypes.number.isRequired,
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

   	_handleMouseDown : function(e) {
   		DragStore.actions.startPlayheadDrag(this.props.scaleX.invert(e.clientX));
   	},

	render : function() {
		var divStyle = {
			height:this.props.height,
			width:this.props.width,
			background:this.props.background
		};


        var x = this.props.scaleX(this.props.currentTime);
        var playheadWidth = this.props.playheadWidth;
        var h = this.props.height;
		var playheadPoints = (x-playheadWidth/2) + "," + 0 + " " 
								+ (x+playheadWidth/2) + "," + 0 + " "
								+ x + "," + h;

		return (

			<div onMouseDown={this._handleMouseDown} ref="divWrapper" style={divStyle}>
				<svg width="100%" height="100%">
					<polygon points={playheadPoints} fill={this.props.playheadFill} />
				</svg>
			</div>
			);
	}

});

module.exports = PlayHead;