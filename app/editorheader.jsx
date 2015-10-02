
import React from 'react';
import Reflux from 'reflux';

var AnimationStore = require('./stores/animationstore.js');
var StudyStore = require('./stores/studystore.js');
var SaveLoadStore = require('./stores/saveloadstore.js');
var LogStore = require('./stores/logstore.js');

var IO = require('./../thirdparty/socket/socket.io.js');
var socket = io();

var EditorHeader = React.createClass({

	mixins : [
				Reflux.connect(AnimationStore.store, 'animation'), //emitted updates go to 'animation' key
				Reflux.connect(StudyStore.store, 'study'), //emitted updates go to 'study' key

			],

	propTypes: {
			},

	getDefaultProps: function() {
	    return {
	    	displayAnimation:false,
	    	displayInterfaceMode:false,
	    	displaySaveButton:true,
	    	displayStartButton:true,
			displayTestButton:true,
			displayRenderButton:true
	    }
	},

	_onAnimationChange: function(val) {
		AnimationStore.actions.setAnimation(val.target.value);
	},

	_onDisplayModeChange: function(val) {
		StudyStore.actions.setDisplayMode(val.target.value);
	},

	_onStartClick : function(e) {
		LogStore.actions.log("START_TASK");
	},

	_onSaveClick : function(e) {
		SaveLoadStore.actions.save();
	},

	_onTestClick : function(e) {
		socket.emit('test');
	},

	_onRenderClick : function(e) {
		socket.emit('render');
	},

	/**
	* Rendering
	*
	*/

	render : function() {

		var headerStyle = {
		};

		var animationOptions = this.state.animation.animationOptions;
		var displayOptions = this.state.study.modes;
		var animationChangeCallback = this._onAnimationChange;
		var displayChangeCallback = this._onDisplayModeChange;
		var selectedAnimation = this.state.animation.animation;
		var selectedDisplayMode = this.state.study.currentMode;

		var animationOptionDisplay = <span />
		if (this.props.displayAnimation)
		{
			animationOptionDisplay = (<select className="animationoptions unselectable" onChange={animationChangeCallback}>
					{animationOptions.map( (animationOption) => (
						<option value={animationOption} selected={animationOption==selectedAnimation}>{animationOption}</option>
						))}
				</select>);
		}

		var interfaceModeDisplay = <span />
		if (this.props.displayInterfaceMode)
		{
			interfaceModeDisplay = (<select className="displayoptions unselectable" onChange={displayChangeCallback}>
					{Object.keys(displayOptions).map( (displayOption) => (
						<option value={displayOption} selected={displayOption==selectedDisplayMode}>{displayOption}</option>
						))}
				</select>);
		}

		var startButton = <span />
		if (this.props.displayStartButton)
		{
			startButton = (<button onClick={this._onStartClick}>Start</button>);
		}

		var saveButton = <span />
		if (this.props.displaySaveButton)
		{
			saveButton = (<button onClick={this._onSaveClick}>Finish</button>);
		}

		var testButton = <span />
		if (this.props.displayTestButton)
		{
			testButton = (<button onClick={this._onTestClick}>Test</button>);
		}

		var renderButton = <span />
		if (this.props.displayRenderButton)
		{
			renderButton = (<button onClick={this._onRenderClick}>Render</button>);
		}


		return (
			<div className="header" style={headerStyle}>
				{startButton}
				<span className="title unselectable"> Editor </span>
				{animationOptionDisplay}
				{interfaceModeDisplay}
				{saveButton}
				{testButton}
				{renderButton}
			</div>
			);
	}

});

module.exports = EditorHeader;
