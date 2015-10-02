import React from 'react';
import d3 from 'd3';

var WaveformPathMixin = {

	_iconChanged : function (vticon) {
		//TODO: this was copied and changed from VTEditor
		//need to move this comparator to a VTIcon class @ next refactoring
		//or make it a separate mixin

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

	//returns parameter value for a given time
	//TODO: Copy+Pasted from VTEditor; needs to be unified 
	// during next refactoring
	interpolateParameter: function(p, t, vticon) {
		var data = vticon.parameters[p].data;
		var prev = null;
		var next = null;

		var rv = null;

		for(var i = 0; i < data.length; i++)
		{
			
			if (data[i].t == t)
			{
				rv = data[i].value;
			}
			else if (data[i].t < t) 
			{
				if (prev == null || prev.t <= data[i].t) {
					prev = data[i];
				}
			} else {
				if (next == null || next.t >= data[i].t) {
					next = data[i];
				}
			}
		}

		if (rv == null)
		{

			if (next == null && prev == null) {
			//if no exact match was found
			if (rv == null)
			{
				//error
				throw "No keyframes found in parameter " + p;
			}
			//if an exact match was found, we already stored rv
				
			} else if (next == null) {
				//use prev
				rv = prev.value;
			} else if (prev == null) {
				//use next
				rv = next.value;
			} else {
				//TODO: not just linear interpolation
				if (prev.t == next.t) 
				{
					rv = prev.value;
				} else {
					var dt = next.t-prev.t;
					var proportionPrev = (t-prev.t)/dt;
					var dvalue = next.value - prev.value;
					rv = proportionPrev*dvalue + prev.value;
					/*
					console.log("INTERPOLATE");
					console.log(t);
					console.log(prev.t, prev.value);
					console.log(next.t, next.value);
					console.log(dt, dvalue);
					console.log(proportionPrev);
					console.log(rv);*/
				}
			}

		}
	
		return rv;

	} ,

	//returns parameter values as a dictionary for a given time
	//TODO: Copy+Pasted from VTEditor; needs to be unified 
	// during next refactoring
	interpolateParameters: function(t, vticon) {
		var interpolateParameter = this.interpolateParameter;
		//map _interpolateParameter to vticon keys
		return Object.keys(vticon.parameters).reduce( function(obj, p) 
			{
				obj[p] = interpolateParameter(p, t, vticon);
				return obj;
			}, {});
	} ,


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


	computeWaveformPath(vticon, scaleX, scaleY, resolution, maxFrequencyRendered, limitFrequencies) {
		if (this._iconChanged(vticon))
		{

			var vticonline = d3.svg.line()
								.x(function(d) {
									return scaleX(d[0])
								})
								.y(function(d) {
									return scaleY(d[1])
								});

			limitFrequencies = false;

			//do icon visualization
			var visPoints = [];
			var lastFrequency = 0;
			var dt_in_s = vticon.duration/1000/resolution;
			var phaseIntegral = 0;
			var phaseIntegralTexture = 0;
			var frequencyScaleFactor = Math.max(vticon.parameters.frequency.valueScale[0], vticon.parameters.frequency.valueScale[1])/maxFrequencyRendered;
			for (var i = 0; i < resolution; i++) {
				var t_in_ms = i/resolution*vticon.duration;
				var t_in_s = t_in_ms/1000;

				var amplitude = this.interpolateParameter("amplitude", t_in_ms, vticon);//paramValues.amplitude;
				var frequency = this.interpolateParameter("frequency", t_in_ms, vticon); //paramValues.frequency;
				var ampTex = 0;
				if ("ampTex" in vticon.parameters)
				{
					ampTex = this.interpolateParameter("ampTex", t_in_ms, vticon); //paramValues.bias;	
				}
				var freqTex = 10;
				if ("freqTex" in vticon.parameters)
				{
					freqTex = this.interpolateParameter("freqTex", t_in_ms, vticon); //paramValues.bias;	
				}
				var bias = 0.5;
				if ("bias" in vticon.parameters)
				{
					bias = this.interpolateParameter("bias", t_in_ms, vticon); //paramValues.bias;	
				}

				if (limitFrequencies) {
					frequency = Math.min(maxFrequencyRendered, frequency/frequencyScaleFactor);
				}
				//console.log("Frequency for ", i, " at time", t_in_ms, "is", frequency);
				//var frequency = interpolateParameter("frequency", t_in_ms);

				if (i == 0) {
					// phaseIntegral = frequency;
				} else { 
					// console.log(phaseIntegral);
					var biasedFrequency = frequency/bias;
					if ( phaseIntegral-Math.floor(phaseIntegral) > 0.25
						&& phaseIntegral-Math.floor(phaseIntegral) <= 0.75) 
					{
						biasedFrequency = frequency/(1-bias);
					}
					phaseIntegral += biasedFrequency*dt_in_s;
					phaseIntegralTexture += freqTex*dt_in_s
				};
				var v = amplitude * Math.sin(2*Math.PI*phaseIntegral) + ampTex*Math.sin(2*Math.PI*phaseIntegralTexture);
				visPoints.push ( [t_in_ms, v]);
				lastFrequency = frequency;
			}

			this._last_updated_vticon = this._copyIcon(vticon);
			this._waveformpath =  vticonline(visPoints);
		}

		return this._waveformpath;
	}



	};


module.exports = WaveformPathMixin;