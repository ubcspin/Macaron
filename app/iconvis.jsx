
import React from 'react';
import Reflux from 'reflux';
import d3 from 'd3';

var TimelineMixin = require('./util/timelinemixin.js');
var WaveformPathMixin = require('./util/waveformpathmixin.js');

var VTIconStore = require('./stores/vticonstore.js');
var DragStore = require('./stores/dragstore.js');

var IconVis = React.createClass({

	mixins : [
		TimelineMixin("divWrapper"),
		WaveformPathMixin,
		Reflux.listenTo(VTIconStore.store,"onVTIconChange")],

	propTypes: {
		vticon : React.PropTypes.object.isRequired,
		currentTime: React.PropTypes.number.isRequired,
		keyframeCircleRadius: React.PropTypes.number.isRequired,
		playheadFill: React.PropTypes.string.isRequired,
		interpolateParameters: React.PropTypes.func.isRequired,
		name : React.PropTypes.string.isRequired,
		selection : React.PropTypes.object.isRequired			},

	getDefaultProps: function() {
	    return {
	      height: 25,
	      width:'100%',
	      visColor:'#FFDDAD',
	      background:"#FAFAFA",
	      resolution:3000,
	      maxFrequencyRendered:125,
	      limitFrequencies:true,
  	      selectionColor:'#676767',
	      selectionOpacity:0.2,
  	      selectable:false
	    }
	},

	onVTIconChange: function(vticon) {
		var socket = io();
	 	var scaleY = d3.scale.linear()
                    .domain( [-1, 1]) // return value from sine
                    .range([0, this.props.height]);

        var scaleX = this.props.scaleX;

		this._visPath = this.computeWaveformPath(this.props.vticon,
			scaleX, scaleY,
			this.props.resolution, this.props.maxFrequencyRendered, this.props.limitFrequencies);
		console.log('changing vticon');
		socket.emit('path',this._visPath);

	},

	onMouseDown: function(e) {
		VTIconStore.actions.selectVTIcon(this.props.name);
		if(this.props.selectable) {
			DragStore.actions.startTimeSelectDrag(this.props.name);
		}
	},

	render : function() {


		var divStyle = {
			height:this.props.height,
			width:this.props.width,
			background:this.props.background
		};

        var scaleY = d3.scale.linear()
                    .domain( [-1, 1]) // return value from sine
                    .range([0, this.props.height]);

        var scaleX = this.props.scaleX;

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
						[scaleX(this.props.currentTime), this.props.height]
				]);

		var playheadLine = <path />;
		if(this.props.vticon.selected) {
			playheadLine = <path stroke={this.props.playheadFill} strokeWidth="2" fill="none" d={currentTimePath} />;
		}


		var selectable = this.props.selectable;
		//selection square
		var selectionSquare = <rect />;
		if(selectable && this.props.vticon.selectedTimeRange.active) {
			var tLeft = this.props.vticon.selectedTimeRange.time1;
			var tRight = this.props.vticon.selectedTimeRange.time2;
			if(tLeft > tRight) {
				tLeft = this.props.vticon.selectedTimeRange.time2;
				tRight = this.props.vticon.selectedTimeRange.time1;
			}

			var x = scaleX(tLeft);
			var y = 0;
			var width = scaleX(tRight) - x;
			var height = this.props.height;

			selectionSquare = <rect
				x={x}
				y={y}
				width={width}
				height={height}
				fill={this.props.selectionColor}
				opacity={this.props.selectionOpacity} />
		}

		return (
			<div ref="divWrapper" style={divStyle} onMouseDown={this.onMouseDown}>
				<svg height="100%" width="100%">
					<path stroke={this.props.visColor} strokeWidth="0.5" fill="none" d={this._visPath} />
					{playheadLine}
					{selectionSquare}
				</svg>

			</div>
			);
	}

});

module.exports = IconVis;
