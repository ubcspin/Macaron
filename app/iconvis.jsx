
import React from 'react';
import d3 from 'd3';

var TimelineMixin = require('./util/timelinemixin.js');


var IconVis = React.createClass({

	mixins : [TimelineMixin("divWrapper")],

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
	      resolution:4000,
	      maxFrequencyRendered:250,
	      limitFrequencies:true
	    }
	},

	_iconChanged : function () {
		//TODO: this was copied and changed from VTEditor
		//need to move this comparator to a VTIcon @ next refactoring
		var vticon = this.props.vticon;
		var prev = this._last_updated_vticon;

		if (prev == undefined)
		{
			return true;
		}

		var rv = false;

		if (vticon.duration != prev.duration)
 		{
 			rv = true;
 		}

	 	for (var p in vticon.parameters)
	 	{
	 		if (vticon.parameters[p].valueScale != prev.parameters[p].valueScale)
	 		{
	 			rv = true;
	 		}

	 		if (vticon.parameters[p].data.length != prev.parameters[p].data.length)
	 		{
	 			rv = true;
	 		} else {
	 			for (var i = 0; i < vticon.parameters[p].data.length; i++)
		 		{
		 			var d = vticon.parameters[p].data[i];
		 			var pd = prev.parameters[p].data[i];
		 			if (d.t != pd.t || d.value != pd.value || d.id != pd.id)
		 			{
		 				rv = true;
		 			}
		 		}
	 		}
	 	}

	 	return rv;

	},


	_copyIcon: function(vticon) {
		//TODO: also put this into a vticon object when refactoring
		var state = {};
		state.duration = vticon.duration;
	 	state.parameters = {};
	 	for (var p in vticon.parameters)
	 	{
	 		state.parameters[p] = {};
	 		state.parameters[p].valueScale = vticon.parameters[p].valueScale;
	 		state.parameters[p].data = [];
	 		for (var i = 0; i < vticon.parameters[p].data.length; i++)
	 		{
	 			var d = vticon.parameters[p].data[i];
	 			state.parameters[p].data.push({
	 				t:d.t,
	 				value:d.value,
	 				id:d.id
	 			});
	 		}
	 	}

	 	return state;

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

        var vticonline = d3.svg.line()
								.x(function(d) {
									return scaleX(d[0])
								})
								.y(function(d) {
									return scaleY(d[1])
								});


		//do icon visualization
		var visPoints = [];
		var lastFrequency = 0;
		var dt_in_s = this.props.vticon.duration/1000/this.props.resolution;
		var phaseIntegral = 0;

		//only update if the icon has changed
		if (this._iconChanged())
		{
			for (var i = 0; i < this.props.resolution; i++) {
				var t_in_ms = i/this.props.resolution*this.props.vticon.duration;
				var t_in_s = t_in_ms/1000;

				//var paramValues = this.props.interpolateParameters(t_in_ms, name=this.props.name);
				var amplitude = this.props.interpolateParameter("amplitude", t_in_ms, this.props.name);//paramValues.amplitude;
				var frequency = this.props.interpolateParameter("frequency", t_in_ms, this.props.name); //paramValues.frequency;
				if (this.props.limitFrequencies) {
					frequency = Math.min(this.props.maxFrequencyRendered, frequency/2);
				}
				//console.log("Frequency for ", i, " at time", t_in_ms, "is", frequency);
				//var frequency = this.props.interpolateParameter("frequency", t_in_ms);

				if (i == 0) {
					// phaseIntegral = frequency;
				} else { 
					phaseIntegral += (frequency)*dt_in_s;
				};
				var v = amplitude * Math.sin(2*Math.PI*phaseIntegral);
				visPoints.push ( [t_in_ms, v]);
				lastFrequency = frequency;

			}

			this._last_updated_vticon = this._copyIcon(this.props.vticon);
		
		
			var visPath = vticonline(visPoints);

			this._rendered_path = (<path stroke={this.props.visColor} strokeWidth="0.5" fill="none" d={visPath} />);
		}

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
					{this._rendered_path}
					{playheadLine}
				</svg>

			</div>
			);
	}

});

module.exports = IconVis;