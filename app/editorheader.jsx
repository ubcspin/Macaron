
import React from 'react';
import Reflux from 'reflux';

var AnimationStore = require('./stores/animationstore.js');


var EditorHeader = React.createClass({

	mixins : [
				Reflux.connect(AnimationStore.store, 'animation'), //emitted updates go to 'playback' key
			],

	propTypes: {
			},

	getDefaultProps: function() {
	    return {
	    }
	},


	
	/**
	* Rendering
	* 
	*/

	render : function() {

		var headerStyle = {
			className:'unselectable'
		};

		var animationOptions = this.state.animation.animationOptions;

		return (
			<div className="header" style={headerStyle}>
				<span className="title"> Macaron Editor </span>
				<select className="animationoptions">
					{animationOptions.map( (animationOption) => (
						<option value={animationOption}>{animationOption}</option>
						))}
				</select>
			</div>
			);
	}

});

module.exports = EditorHeader;