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
					vtIcon: {
						duration: 1000, //ms

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
					/* TODO: Selection, key frames, etc. */
		}
	},

	getDefaultProps: function() {

		return {
			keyframeCircleRadius:5
		}

	},
	
	render : function() {

		return (
			<div id="app">
				<ControlBar playing={this.state.playing} />
				<PlayHead currentTime={this.state.currentTime} duration={this.state.vtIcon.duration} keyframeCircleRadius={this.props.keyframeCircleRadius}/>
				<IconVis />
				<KeyframeEditor parameter="amplitude" vticon={this.state.vtIcon} keyframeCircleRadius={this.props.keyframeCircleRadius}/>
				<KeyframeEditor  parameter="frequency" vticon={this.state.vtIcon} keyframeCircleRadius={this.props.keyframeCircleRadius}/>
			</div>);
		}

	});


		React.render(<App width="100%" height="100%" />, document.body);