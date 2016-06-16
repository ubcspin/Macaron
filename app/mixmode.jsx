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
    //console.log(name);
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

    var scaleXwave1 = this.state.scales.wave1.scaleTimeline;
    var scaleXwave2 = this.state.scales.wave2.scaleTimeline;
    var scaleXmixedWave = this.state.scales.mixedWave.scaleTimeline;

    var wave1_icon = this.state.vticons["wave1"];
    var wave2_icon = this.state.vticons["wave2"];
    var mixedWave_icon = this.state.vticons["mixedWave"];


    var designStyle = {
      display:"block",
      position:"relative",
      float:"left",
      width:"30%",
      height:"200px",
      marginLeft:"30px",
      display:"block",
      borderStyle:"solid",
      borderWidth:0
    };

    var titlesStyles = {
      position:"relative",
      width:"1000px",
      marginLeft:"120px",
      padding:"10px",
      fontSize:"14pt",
      wordSpacing:"350px"
    };

    if (this.props.isMixMode) {

      var frequency = this.interpolateParameter('frequency', this.state.playback.currentTime, this.state.playback.playingIcon);
      var amplitude = this.interpolateParameter('amplitude', this.state.playback.currentTime, this.state.playback.playingIcon);

      if (this.state.playback.currentTime >= this.state.vticons.mixedWave.duration) {
        var amplitude_for_soundgen = 0;
      } else {
        var amplitude_for_soundgen = amplitude;
      }

      return (
        <div id="mixer" >
          <SoundGen frequency={frequency} amplitude={amplitude_for_soundgen} mute={this.state.playback.mute} />
          <AnimationWindow
            name="main"
            animation={this.state.animation.animation}
            animationParameters={this.state.animation.animationParameters} />
          <MixControls />

          <div style={titlesStyles}>
              Wave1 Result Wave2
          </div>

          <div id="wave-previews">

            <div name="wave1" id="wave-previewer-1" ref="wave1EditorRef" style={designStyle}>
              <ControlBar
    						name="wave1"
    						playing={this.state.playback.playing}
    						mute={this.state.playback.mute}/>
              <PlayHead name="wave1"
    						displayPlayhead={this.state.vticons["wave1"].selected}
    						scaleX={scaleXwave1}
    						currentTime={this.state.playback.currentTime}
    						duration={wave1_icon.duration}
    						keyframeCircleRadius={this.props.keyframeCircleRadius}
    						playheadFill={this.props.playheadFill}/>
              <IconVis name="wave1"
    						scaleX={scaleXwave1}
    						vticon={wave1_icon}
    						currentTime={this.state.playback.currentTime}
    						keyframeCircleRadius={this.props.keyframeCircleRadius}
    						playheadFill={this.props.playheadFill}
    						interpolateParameters={this.interpolateParameters}
    						interpolateParameter={this.interpolateParameter}
    						selection={this.state.selection}/>
    					{Object.keys(wave1_icon.parameters).map( (p) => (
    							<KeyframeEditor
    								name="wave1"
                    height="160"
                    selectable="true"
                    modifiable="true"
                    axisNameWidth="20"
    								scaleX={scaleXwave1}
    								currentTime={this.state.playback.currentTime}
    								parameter={p}
    								vticon={wave1_icon}
    								keyframeCircleRadius={this.props.keyframeCircleRadius}
    								playheadFill={this.props.playheadFill}
    								selection={this.state.selection}/>
    						))}
            </div>

            <div name="mixedWave" id="wave-previewer-mixed" ref="mixedWaveEditorRef" style={designStyle}>
              <ControlBar
    						name="mixedWave"
    						playing={this.state.playback.playing}
    						mute={this.state.playback.mute}/>
              <PlayHead name="mixedWave"
    						displayPlayhead={this.state.vticons["mixedWave"].selected}
    						scaleX={scaleXmixedWave}
    						currentTime={this.state.playback.currentTime}
    						duration={mixedWave_icon.duration}
    						keyframeCircleRadius={this.props.keyframeCircleRadius}
    						playheadFill={this.props.playheadFill}/>
              <IconVis name="mixedWave"
    						scaleX={scaleXmixedWave}
    						vticon={mixedWave_icon}
    						currentTime={this.state.playback.currentTime}
    						keyframeCircleRadius={this.props.keyframeCircleRadius}
    						playheadFill={this.props.playheadFill}
    						interpolateParameters={this.interpolateParameters}
    						interpolateParameter={this.interpolateParameter}
    						selection={this.state.selection}/>
    					{Object.keys(mixedWave_icon.parameters).map( (p) => (
    							<KeyframeEditor
    								name="mixedWave"
                    height="160"
                    selectable="false"
                    modifiable="false"
                    axisNameWidth="20"
    								scaleX={scaleXmixedWave}
    								currentTime={this.state.playback.currentTime}
    								parameter={p}
    								vticon={mixedWave_icon}
    								keyframeCircleRadius={this.props.keyframeCircleRadius}
    								playheadFill={this.props.playheadFill}
    								selection={this.state.selection}/>
    						))}
            </div>

            <div name="wave2" id="wave-previewer-2" ref="wave2EditorRef" style={designStyle}>
              <ControlBar
    						name="wave2"
    						playing={this.state.playback.playing}
    						mute={this.state.playback.mute}/>
              <PlayHead name="wave2"
    						displayPlayhead={this.state.vticons["wave2"].selected}
    						scaleX={scaleXwave2}
    						currentTime={this.state.playback.currentTime}
    						duration={wave2_icon.duration}
    						keyframeCircleRadius={this.props.keyframeCircleRadius}
    						playheadFill={this.props.playheadFill}/>
              <IconVis name="wave2"
    						scaleX={scaleXwave2}
    						vticon={wave2_icon}
    						currentTime={this.state.playback.currentTime}
    						keyframeCircleRadius={this.props.keyframeCircleRadius}
    						playheadFill={this.props.playheadFill}
    						interpolateParameters={this.interpolateParameters}
    						interpolateParameter={this.interpolateParameter}
    						selection={this.state.selection}/>
    					{Object.keys(wave2_icon.parameters).map( (p) => (
    							<KeyframeEditor
    								name="wave2"
                    height="160"
                    selectable="true"
                    modifiable="true"
                    axisNameWidth="20"
    								scaleX={scaleXwave2}
    								currentTime={this.state.playback.currentTime}
    								parameter={p}
    								vticon={wave2_icon}
    								keyframeCircleRadius={this.props.keyframeCircleRadius}
    								playheadFill={this.props.playheadFill}
    								selection={this.state.selection}/>
    						))}
            </div>


          </div>
        </div>
      );


      // return (
      //   <div id="mixer" >
      //     <SoundGen frequency={frequency} amplitude={amplitude_for_soundgen} mute={this.state.playback.mute} />
      //     <AnimationWindow
      //       name="main"
      //       animation={this.state.animation.animation}
      //       animationParameters={this.state.animation.animationParameters} />
      //     <MixControls />
      //   </div>
      // );
    }

    else { return(<div id="mixer" />); }
  },

  componentDidMount: function () {
    if (this.props.isMixMode) {
      this._updateScales();
      window.addEventListener('resize', this.handleResize);
      window.addEventListener('mousemove', this._handleMouseMove);
      window.addEventListener('mouseup', this._handleMouseUp);
    }
  },


  handleResize: function(e) {
    this._updateScales();
  },

  _updateScales : function() {
    for (var n in this.state.scales)
    {
      if ((n=="wave1")||(n=="mixedWave")||(n=="wave2")) {
        ScaleStore.actions.setTimelineRange(n, this._calculateTimelineRange(n));
        var actualLeft = this.refs[n+"EditorRef"].getDOMNode().offsetLeft;
        // var actualTop = this.refs[name+"EditorRef"].getDOMNode().clientHeight;
        ScaleStore.actions.setLeftOffset(n, actualLeft);
      }
    }
  },

  _calculateTimelineRange(name) {
    var actualWidth = this.refs[name+"EditorRef"].getDOMNode().clientWidth;
    // var actualHeight = this.refs[name+"EditorRef"].getDOMNode().clientHeight;
    return [this.props.timelineLeftOffset+this.props.keyframeCircleRadius, actualWidth-this.props.keyframeCircleRadius-this.props.timelineRightOffset];
  }


});

module.exports = MixMode;
