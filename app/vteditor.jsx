
import React from 'react';
import Reflux from 'reflux';
import d3 from 'd3';

var BitGen = require('./bitgen.jsx'); // must precede editor header
var EditorHeader = require('./editorheader.jsx');
var ControlBar = require('./controlbar.jsx');
var SoundGen = require('./soundgen.jsx'); //TODO
var PlayHead = require('./playhead.jsx');
var IconVis = require('./iconvis.jsx');
var AnimationWindow = require('./animationwindow.jsx');
var KeyframeEditor = require('./keyframeeditor.jsx');
var Gallery = require('./gallery.jsx');

var PlaybackStore = require('./stores/playbackstore.js');
var VTIconStore = require('./stores/vticonstore.js');
var DragStore = require('./stores/dragstore.js');
var ScaleStore = require('./stores/scalestore.js');
var SelectionStore = require('./stores/selectionstore.js');
var ClipboardStore = require('./stores/clipboardstore.js');
var AnimationStore = require('./stores/animationstore.js');
var StudyStore = require('./stores/studystore.js')

var VTEditor = React.createClass({
	mixins : [
				Reflux.connect(PlaybackStore.store, 'playback'), //emitted updates go to 'playback' key
				Reflux.connect(VTIconStore.store, 'vticons'), //emitted updates go to 'vticon' key
				Reflux.connect(ScaleStore.store, 'scales'), //emitted updates go to 'scales' key
				Reflux.connect(SelectionStore.store, 'selection'), //emitted updates go to 'selection' key
				Reflux.connect(AnimationStore.store, 'animation'), //emitted updates go to 'animation' key
				Reflux.connect(StudyStore.store, 'study') //emitted updates go to 'study' key
	],


	getInitialState : function () {
		return {
				actualWidth:10,
				actualHeight:10
		}; //handled as stores
	},


	//returns parameter value for a given time
	interpolateParameter: function(p, t, name) {
		var param = this.state.vticons[name].parameters[p];
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
	interpolateParameters: function(t, name) {
		var interpolateParameter = this.interpolateParameter;
		//map _interpolateParameter to vticon keys
		return Object.keys(this.state.vticons[name].parameters).reduce( function(obj, p)
			{
				obj[p] = interpolateParameter(p, t, name);
				return obj;
			}, {});
	} ,

	getDefaultProps: function() {

		return {
			keyframeCircleRadius:5,
			playheadFill:"red",
			timelineLeftOffset:60,
			timelineRightOffset:20,
			examplesModifiable:false,
			playbackAtEndOfVTIcon:false
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
   				//only delete in main editor
   				//TODO: should this check be somewhere else?
   				if (this.props.examplesModifiable || !this.state.vticons["example"].selected)
   				{
   					VTIconStore.actions.deleteSelectedKeyframes();
   				}
   				break;
   			case 37: //left arrow
   				PlaybackStore.actions.stepBackward();
   				break;
   			case 39: //right arrow
   				PlaybackStore.actions.stepForward();
   				break;
   			case 65: //a
   				if (e.ctrlKey || e.metaKey) {
   					if(this.state.vticons["example"].selected && (this.state.study.currentMode == this.state.study.modes.LOWVIS_HIGHSELECT))
   					{
   						VTIconStore.actions.selectAllTimeRange();
   					} else {
   						VTIconStore.actions.selectAllKeyframes();
   					}
   				}
   				break;
   			case 67: //c
   				if (e.ctrlKey || e.metaKey) {
   					if (this.state.vticons["example"].selected && (this.state.study.currentMode == this.state.study.modes.LOWVIS_HIGHSELECT))
   					{
   						ClipboardStore.actions.copyTimeRange();
   					} else {
   						ClipboardStore.actions.copy();
   					}
   				}
   				break;
   			// case 80: //p
   			case 86: //v
				if (e.ctrlKey || e.metaKey) {
					//only delete in main editor
   					//TODO: should this check be somewhere else?
   					if (this.props.examplesModifiable || !this.state.vticons["example"].selected)
   					{
	   					ClipboardStore.actions.paste();
   					}
   				}
   				break;
   			case 88: //x
   				if (e.ctrlKey || e.metaKey) {
					//only delete in main editor
   					//TODO: should this check be somewhere else?
   					if (this.props.examplesModifiable || !this.state.vticons["example"].selected)
   					{
   						ClipboardStore.actions.copy();
   						VTIconStore.actions.deleteSelectedKeyframes();
   					}
   				}
   			case 82: //r
   				if (e.ctrlKey || e.metaKey) {
   					VTIconStore.actions.redo();
   					e.preventDefault();
   				}
   				break;
   			case 85: //u
   			case 90: //z
   				if(e.ctrlKey || e.metaKey) {
   					if( e.shiftKey) {
   						VTIconStore.actions.redo();
   					} else {
   						VTIconStore.actions.undo();
   					}
   				}
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

		// TODO: sound of SELECTED icon
		var frequency = this.interpolateParameter('frequency', this.state.playback.currentTime, this.state.playback.playingIcon);
		var amplitude = this.interpolateParameter('amplitude', this.state.playback.currentTime, this.state.playback.playingIcon);

		var amplitude_for_soundgen = 0;
		if (this.props.playbackAtEndOfVTIcon)
		{
			amplitude_for_soundgen = amplitude;
		}

		var scaleXMain = this.state.scales.main.scaleTimeline;
		var scaleXExample = this.state.scales.example.scaleTimeline;

		var design_icon = this.state.vticons["main"];
		var example_icon = this.state.vticons["example"];


		var designStyle = {
			width:"44%",
			marginLeft:'auto',
			marginRight:'auto',
			display:"block",
			borderStyle:"solid",
			borderWidth:0
		};
		var exampleStyle = {
			width:"44%",
			marginLeft:'auto',
			marginRight:'auto',
			display:"block",
			borderStyle:"solid",
			borderWidth:0
		};


		var exampleEditor = <div />;
		var exampleGallery = <div />;

		if(design_icon.selected) {
			designStyle.borderColor="black";
			exampleStyle.borderColor="white";
			if (this.state.playback.currentTime < this.state.vticons.main.duration)
			{
				amplitude_for_soundgen = amplitude;
			}

		} else {
			designStyle.borderColor="white";
			exampleStyle.borderColor="black";
			if (this.state.playback.currentTime < this.state.vticons.example.duration)
			{
				amplitude_for_soundgen = amplitude;
			}
		}

		if(this.state.study.currentMode != this.state.study.modes.NO_EXAMPLES) {
			exampleStyle.float="left";
			designStyle.float="left";
			var iconVisSelectable = (this.state.study.currentMode == this.state.study.modes.LOWVIS_HIGHSELECT);
			var keyframeSelectable = (this.state.study.currentMode == this.state.study.modes.HIGHVIS_HIGHSELECT);
			var visualization = ((this.state.study.currentMode == this.state.study.modes.HIGHVIS_HIGHSELECT)
								|| ((this.state.study.currentMode == this.state.study.modes.HIGHVIS_LOWSELECT) ));
			var visualizeTicks = keyframeSelectable;
			var modifiable = this.props.examplesModifiable;
			exampleEditor = (
			<div name="example" id="exampleeditor" ref="exampleEditorRef" style={exampleStyle}>
					<ControlBar
						name="example"
						playing={this.state.playback.playing}
						mute={this.state.playback.mute}/>
					<PlayHead name="example"
						displayPlayhead={this.state.vticons["example"].selected}
						scaleX={scaleXExample}
						currentTime={this.state.playback.currentTime}
						duration={example_icon.duration}
						keyframeCircleRadius={this.props.keyframeCircleRadius}
						playheadFill={this.props.playheadFill}/>
					<IconVis name="example"
						scaleX={scaleXExample}
						vticon={example_icon}
						currentTime={this.state.playback.currentTime}
						keyframeCircleRadius={this.props.keyframeCircleRadius}
						playheadFill={this.props.playheadFill}
						interpolateParameters={this.interpolateParameters}
						interpolateParameter={this.interpolateParameter}
						selection={this.state.selection}
						selectable={iconVisSelectable} />
					{Object.keys(example_icon.parameters).map( (p) => (
							<KeyframeEditor
								name="example"
								scaleX={scaleXExample}
								currentTime={this.state.playback.currentTime}
								parameter={p}
								vticon={example_icon}
								keyframeCircleRadius={this.props.keyframeCircleRadius}
								playheadFill={this.props.playheadFill}
								selection={this.state.selection}
								selectable={keyframeSelectable}
								visualization={visualization}
								visualizeTicks={visualizeTicks}
								modifiable={modifiable} />
						))}
				</div>);
				exampleGallery =  <Gallery />;
			}

		return (
			<div id="app" ref="appRef">
				<EditorHeader />
				<SoundGen frequency={frequency} amplitude={amplitude_for_soundgen} mute={this.state.playback.mute} />
				<AnimationWindow
						name="main"
						animation={this.state.animation.animation}
						animationParameters={this.state.animation.animationParameters}
						frequency={frequency} amplitude={amplitude_for_soundgen} />
				<div name="main" id="maineditor" ref="mainEditorRef" style={designStyle}>
					<ControlBar
						name="main"
						playing={this.state.playback.playing}
						mute={this.state.playback.mute}/>
					<PlayHead name="main"
						displayPlayhead={this.state.vticons["main"].selected}
						scaleX={scaleXMain}
						currentTime={this.state.playback.currentTime}
						duration={design_icon.duration}
						keyframeCircleRadius={this.props.keyframeCircleRadius}
						playheadFill={this.props.playheadFill}/>
					<IconVis name="main"
						scaleX={scaleXMain}
						vticon={design_icon}
						currentTime={this.state.playback.currentTime}
						keyframeCircleRadius={this.props.keyframeCircleRadius}
						playheadFill={this.props.playheadFill}
						interpolateParameters={this.interpolateParameters}
						interpolateParameter={this.interpolateParameter}
						selection={this.state.selection}/>
					{Object.keys(design_icon.parameters).map( (p) => (
							<KeyframeEditor
								name="main"
								scaleX={scaleXMain}
								currentTime={this.state.playback.currentTime}
								parameter={p}
								vticon={design_icon}
								keyframeCircleRadius={this.props.keyframeCircleRadius}
								playheadFill={this.props.playheadFill}
								selection={this.state.selection}/>
						))}
				</div>
				{exampleEditor}
				{exampleGallery}

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

		this._updateScales();

   	},


   	handleResize: function(e) {
		this._updateScales();
	},

	_updateScales : function() {
		for (var n in this.state.scales)
		{
    		ScaleStore.actions.setTimelineRange(n, this._calculateTimelineRange(n));

			var actualLeft = this.refs[n+"EditorRef"].getDOMNode().offsetLeft;
	    	// var actualTop = this.refs[name+"EditorRef"].getDOMNode().clientHeight;
			ScaleStore.actions.setLeftOffset(n, actualLeft);
		}
	},

	_calculateTimelineRange(name) {
	    var actualWidth = this.refs[name+"EditorRef"].getDOMNode().clientWidth;
    	// var actualHeight = this.refs[name+"EditorRef"].getDOMNode().clientHeight;

		return [this.props.timelineLeftOffset+this.props.keyframeCircleRadius, actualWidth-this.props.keyframeCircleRadius-this.props.timelineRightOffset];

	}

	});


module.exports = VTEditor;
