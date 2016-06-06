import React from 'react';
import Reflux from 'reflux';

var ControlBar = require('./controlbar.jsx');
var PlayHead = require('./playhead.jsx');
var IconVis = require('./iconvis.jsx');
var AnimationWindow = require('./animationwindow.jsx');
var KeyframeEditor = require('./keyframeeditor.jsx');
var Gallery = require('./gallery.jsx');
var SoundGen = require('./soundgen.jsx');
var MixControls = require('./mixcontrols.jsx');

var PlaybackStore = require('./stores/playbackstore.js');
var VTIconStore = require('./stores/vticonstore.js');
var DragStore = require('./stores/dragstore.js');
var ScaleStore = require('./stores/scalestore.js');
var SelectionStore = require('./stores/selectionstore.js');
var ClipboardStore = require('./stores/clipboardstore.js');
var AnimationStore = require('./stores/animationstore.js');
var StudyStore = require('./stores/studystore.js');



var MixMode = React.createClass({

  mixins : [
				Reflux.connect(PlaybackStore.store, 'playback'), //emitted updates go to 'playback' key
				Reflux.connect(VTIconStore.store, 'vticons'), //emitted updates go to 'vticon' key
				Reflux.connect(ScaleStore.store, 'scales'), //emitted updates go to 'scales' key
				Reflux.connect(SelectionStore.store, 'selection'), //emitted updates go to 'selection' key
				Reflux.connect(AnimationStore.store, 'animation'), //emitted updates go to 'animation' key
				Reflux.connect(StudyStore.store, 'study') //emitted updates go to 'study' key
	],

  propTypes: {
    isMixMode: React.PropTypes.bool,
  },

	getDefaultProps: function() {
		return {
			keyframeCircleRadius:5,
			playheadFill:"red",
			timelineLeftOffset:60,
			timelineRightOffset:20,
			examplesModifiable:false,
			playbackAtEndOfVTIcon:false,
			isMixMode:false
		};
	},

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

		for(var i = 0; i < data.length; i++) {

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
				}
			}

		}

		return rv;

	},

	//returns parameter values as a dictionary for a given time
	interpolateParameters: function(t, name) {
		var interpolateParameter = this.interpolateParameter;
		//map _interpolateParameter to vticon keys
		return Object.keys(this.state.vticons[name].parameters).reduce( function(obj, p)
			{
				obj[p] = interpolateParameter(p, t, name);
				return obj;
			}, {});
	},

	/**
	* Event handlers for interactions
	*/

	_handleMouseMove : function(e) {
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

  render : function () {

    var scaleXMain = this.state.scales.main.scaleTimeline;
    var scaleXExample = this.state.scales.example.scaleTimeline;

    var design_icon = this.state.vticons["main"];
    var example_icon = this.state.vticons["example"];


    var designStyle = {
      display:"block",
      position:"relative",
      float:"left",
      width:"30%",
      marginLeft:"3%",
      marginTop:"25px",
      display:"block",
      borderStyle:"solid",
      borderWidth:0
    };

    if (this.props.isMixMode) {

      var frequency = this.interpolateParameter('frequency', this.state.playback.currentTime, this.state.playback.playingIcon);
      var amplitude = this.interpolateParameter('amplitude', this.state.playback.currentTime, this.state.playback.playingIcon);

      var amplitude_for_soundgen = 0;
      if (this.props.playbackAtEndOfVTIcon){amplitude_for_soundgen = amplitude;}

      // return (
      //   <div id="mixer" >
      //     <SoundGen frequency={frequency} amplitude={amplitude_for_soundgen} mute={this.state.playback.mute} />
      //     <AnimationWindow
      //       name="main"
      //       animation={this.state.animation.animation}
      //       animationParameters={this.state.animation.animationParameters} />
      //     <MixControls />
      //
      //     <div id="wave-previews">
      //
      //       <div name="wave1" id="wave-previewer-1" ref="wave1EditorRef" style={designStyle}>
      //         <ControlBar
    	// 					name="wave1"
    	// 					playing={this.state.playback.playing}
    	// 					mute={this.state.playback.mute}/>
      //         <PlayHead name="wave1"
    	// 					displayPlayhead={this.state.vticons["main"].selected}
    	// 					scaleX={scaleXMain}
    	// 					currentTime={this.state.playback.currentTime}
    	// 					duration={design_icon.duration}
    	// 					keyframeCircleRadius={this.props.keyframeCircleRadius}
    	// 					playheadFill={this.props.playheadFill}/>
      //         <IconVis name="wave1"
    	// 					scaleX={scaleXMain}
    	// 					vticon={design_icon}
    	// 					currentTime={this.state.playback.currentTime}
    	// 					keyframeCircleRadius={this.props.keyframeCircleRadius}
    	// 					playheadFill={this.props.playheadFill}
    	// 					interpolateParameters={this.interpolateParameters}
    	// 					interpolateParameter={this.interpolateParameter}
    	// 					selection={this.state.selection}/>
    	// 				{Object.keys(design_icon.parameters).map( (p) => (
    	// 						<KeyframeEditor
    	// 							name="example"
    	// 							scaleX={scaleXMain}
    	// 							currentTime={this.state.playback.currentTime}
    	// 							parameter={p}
    	// 							vticon={design_icon}
    	// 							keyframeCircleRadius={this.props.keyframeCircleRadius}
    	// 							playheadFill={this.props.playheadFill}
    	// 							selection={this.state.selection}/>
    	// 					))}
      //
      //       </div>
      //     </div>
      //   </div>
      // );


      return (
        <div id="mixer" >
          <SoundGen frequency={frequency} amplitude={amplitude_for_soundgen} mute={this.state.playback.mute} />
          <AnimationWindow
            name="main"
            animation={this.state.animation.animation}
            animationParameters={this.state.animation.animationParameters} />
          <MixControls />
        </div>
      );
    }

    else { return(<div id="mixer" />); }
  }


});

module.exports = MixMode;
