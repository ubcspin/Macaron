
import React from 'react';
import Reflux from 'reflux';

var AnimationStore = require('./stores/animationstore.js');
var StudyStore = require('./stores/studystore.js');
var SaveLoadStore = require('./stores/saveloadstore.js');


var EditorHeader = React.createClass({

	mixins : [
				Reflux.connect(AnimationStore.store, 'animation'), //emitted updates go to 'animation' key
				Reflux.connect(StudyStore.store, 'study'), //emitted updates go to 'study' key
					
			],

	propTypes: {
			},

	getDefaultProps: function() {
	    return {
	    }
	},

	_onAnimationChange: function(val) {
		AnimationStore.actions.setAnimation(val.target.value);
	},

	_onDisplayModeChange: function(val) {
		StudyStore.actions.setDisplayMode(val.target.value);
	},

	_onSaveClick : function(e) {
		SaveLoadStore.actions.save({test:1});
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

		return (
			<div className="header" style={headerStyle}>
				<span className="title unselectable"> Macaron Editor </span>
				<select className="animationoptions unselectable" onChange={animationChangeCallback}>
					{animationOptions.map( (animationOption) => (
						<option value={animationOption} selected={animationOption==selectedAnimation}>{animationOption}</option>
						))}
				</select>
				<select className="displayoptions unselectable" onChange={displayChangeCallback}>
					{Object.keys(displayOptions).map( (displayOption) => (
						<option value={displayOption} selected={displayOption==selectedDisplayMode}>{displayOption}</option>
						))}
				</select>
				<button onClick={this._onSaveClick}>Save</button>
			</div>
			);
	}

});

module.exports = EditorHeader;