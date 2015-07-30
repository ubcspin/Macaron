
import React from 'react';
import Reflux from 'reflux';
import d3 from 'd3';

var ControlBar = require('./controlbar.jsx');
var SoundGen = require('./soundgen.jsx'); //TODO
var PlayHead = require('./playhead.jsx');
var IconVis = require('./iconvis.jsx');
var KeyframeEditor = require('./keyframeeditor.jsx');
var PlaybackStore = require('./stores/playbackstore.js');
var VTIconStore = require('./stores/vticonstore.js');
var DragStore = require('./stores/dragstore.js');
var ScaleStore = require('./stores/scalestore.js');
var SelectionStore = require('./stores/selectionstore.js');



var VTEditor = React.createClass({
	mixins : [
				Reflux.connect(PlaybackStore.store, 'playback'), //emitted updates go to 'playback' key
				Reflux.connect(VTIconStore.store, 'vticon'), //emitted updates go to 'vticon' key			
				Reflux.connect(ScaleStore.store, 'scales'), //emitted updates go to 'scales' key			
				Reflux.connect(SelectionStore.store, 'selection') //emitted updates go to 'selection' key			
	],


	getInitialState : function () {
		return {
				actualWidth:10,
				actualHeight:10
		}; //handled as stores
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
			playheadFill:"red",
			timelineLeftOffset:60,
			timelineRightOffset:20
		}

	},

	/**
	* Event handlers for interactions
	*/

	_handleMouseMove(e) {
		DragStore.actions.handleMouseMove(e.clientX, e.clientY);
	},

	_handleMouseUp : function(e) {
		DragStore.actions.stopDrag();
   	},

   	_handleKeyboard : function(e) {

   		//use keyCode because it's supported by more browsers
   		//especially Safari, which has best performance so far
   		//look for deprecations in future versions
   		var keyCode = e.keyCode || e.which;
   		switch(keyCode) {
   			case 32: //space bar
   				PlaybackStore.actions.togglePlaying();
   				break;
   			case 8: //backspace
   			case 46: //delete
   				VTIconStore.actions.deleteSelectedKeyframes();
   				break;
   			case 37: //left arrow
   				PlaybackStore.actions.stepBackward();
   				break;
   			case 39: //right arrow
   				PlaybackStore.actions.stepForward();
   				break;
   			case 65: //a
   				if (e.ctrlKey) {
   					VTIconStore.actions.selectAllKeyframes();
   				}
   				break;
   			case 27: //esc
   				VTIconStore.actions.unselectKeyframes();
   				break;
   		}

   		return false;
   	},


	/**
	* Render
	*/
	render : function() {

		var frequency = this.interpolateParameter('frequency', this.state.playback.currentTime);
		var amplitude = this.interpolateParameter('amplitude', this.state.playback.currentTime);
		var scaleX = this.state.scales.scaleTimeline;


		return (
			<div id="app" ref="appRef">
				<ControlBar playing={this.state.playback.playing} mute={this.state.playback.mute}/>
				<SoundGen frequency={frequency} amplitude={amplitude} mute={this.state.playback.mute} />
				<PlayHead scaleX={scaleX} currentTime={this.state.playback.currentTime} duration={this.state.vticon.duration} keyframeCircleRadius={this.props.keyframeCircleRadius} playheadFill={this.props.playheadFill}/>
				<IconVis scaleX={scaleX} vticon={this.state.vticon} currentTime={this.state.playback.currentTime} keyframeCircleRadius={this.props.keyframeCircleRadius} playheadFill={this.props.playheadFill} interpolateParameters={this.interpolateParameters} interpolateParameter={this.interpolateParameter}/>
				{Object.keys(this.state.vticon.parameters).map( (p) => (
						<KeyframeEditor scaleX={scaleX} currentTime={this.state.playback.currentTime} parameter={p} vticon={this.state.vticon} keyframeCircleRadius={this.props.keyframeCircleRadius} playheadFill={this.props.playheadFill} selection={this.state.selection}/>
					))}
			</div>);
		},


	/**
	*Resizing functions
	*/
				
	componentDidMount: function () {

		window.addEventListener('resize', this.handleResize);
		window.addEventListener('mousemove', this._handleMouseMove);
		window.addEventListener('mouseup', this._handleMouseUp);
		window.addEventListener('keydown', this._handleKeyboard);

    	ScaleStore.actions.setTimelineRange(this._calculateTimelineRange());
   	},


   	handleResize: function(e) {
    	ScaleStore.actions.setTimelineRange(this._calculateTimelineRange());
	},

	_calculateTimelineRange() {
	    var actualWidth = this.refs.appRef.getDOMNode().clientWidth;
    	var actualHeight = this.refs.appRef.getDOMNode().clientHeight;
		return [this.props.timelineLeftOffset+this.props.keyframeCircleRadius, actualWidth-this.props.keyframeCircleRadius-this.props.timelineRightOffset];

	}

	});


module.exports = VTEditor;
