
import React from 'react';
import Reflux from 'reflux';
import d3 from 'd3';

var TimelineMixin = require('./util/timelinemixin.js');
var WaveformPathMixin = require('./util/waveformpathmixin.js');

var VTIconStore = require('./stores/vticonstore.js');

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
		name : React.PropTypes.string.isRequired
			},
	
	getDefaultProps: function() {
	    return {
	      height: 50,
	      width:'100%',
	      visColor:'#FFDDAD',
	      background:"#FAFAFA",
	      resolution:3000,
	      maxFrequencyRendered:125,
	      limitFrequencies:true
	    }
	},

	onVTIconChange: function(vticon) {
	 	var scaleY = d3.scale.linear()
                    .domain( [-1, 1]) // return value from sine
                    .range([0, this.props.height]);

        var scaleX = this.props.scaleX;

		this._visPath = this.computeWaveformPath(this.props.vticon,
			scaleX, scaleY,
			this.props.resolution, this.props.maxFrequencyRendered, this.props.limitFrequencies);
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

		return (
			<div ref="divWrapper" style={divStyle}>
				<svg height="100%" width="100%">
					<path stroke={this.props.visColor} strokeWidth="0.5" fill="none" d={this._visPath} />
					{playheadLine}
				</svg>

			</div>
			);
	}

});

module.exports = IconVis;