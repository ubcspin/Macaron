/** @jsx React.DOM */

var App = React.createClass({
	getInitialState : function () {
		return {
					playing: false,
					currentTime: 450,
					loop : {
						enabled:false,
						start:0, //ms
						end:0 //ms
					},
					playStaticOutput : false,
					vticon: {
						duration: 1000, //ms

						parameters: {
							amplitude: {
								valueScale:[0,1], //normalized
								data : [
									{ t: 200, value:0.5}, 
									{ t: 500, value:1},
									{ t: 1000, value:0}]
							},

							frequency: {
								valueScale:[50,500], //Hz
								data : [
									{ t: 0, value:250}, 
									{ t: 200, value:50},
									{ t: 600, value:500}]
							}
						}
					}
					/* TODO: Selection, key frames, etc. */
		}
	},


	//returns parameter value for a given time
	interpolateParameter: function(p, t) {
		var param = this.state.vticon.parameters[p];
		var data = param.data;
		var prev = null;
		var next = null;

		var rv = null;

		for(var i = 0; i < data.length; i++)
		{
			
			if (data[i].t == t)
			{
				rv = data[i];
			}
			else if (data[i].t < t) 
			{
				if (prev == null || prev.t < data[i].t) {
					prev = data[i];
				}
			} else {
				if (next == null || next.t > data[i].t) {
					next = data[i];
				}
			}

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
			} else if (prev == null || prev.t == next.t) {
				//use next
				rv = next.value;
			} else {
				//TODO: not just linear interpolation
				rv = ((t - prev.t)*prev.value + (next.t-t)*next.value)/(next.t-prev.t);
			}

			return rv;
		}

	} ,

	//returns parameter values as a dictionary for a given time
	interpolateParameters: function(t) {
		var interpolateParameter = this.interpolateParameter;
		//map _interpolateParameter to vticon keys
		return Object.keys(this.state.vticon.parameters).reduce( function(obj, p) 
			{
				obj[p] = interpolateParameter(p, t);
				return obj;
			}, {});
	} ,

	getDefaultProps: function() {

		return {
			keyframeCircleRadius:5,
			playheadFill:"red"
		}

	},
	
	render : function() {

		return (
			<div id="app">
				<ControlBar playing={this.state.playing}/>
				<PlayHead currentTime={this.state.currentTime} duration={this.state.vticon.duration} keyframeCircleRadius={this.props.keyframeCircleRadius} playheadFill={this.props.playheadFill}/>
				<IconVis vticon={this.state.vticon} currentTime={this.state.currentTime} keyframeCircleRadius={this.props.keyframeCircleRadius} playheadFill={this.props.playheadFill} interpolateParameters={this.interpolateParameters}/>
				{Object.keys(this.state.vticon.parameters).map( (p) => (
						<KeyframeEditor currentTime={this.state.currentTime} parameter={p} vticon={this.state.vticon} keyframeCircleRadius={this.props.keyframeCircleRadius} playheadFill={this.props.playheadFill}/>
					))}
			</div>);
		}

	});


		React.render(<App width="100%" height="100%" />, document.body);