
import React from 'react';
import Reflux from 'reflux';
import d3 from 'd3';

var EditorHeader = require('./editorheader.jsx');
var KeyframeEditor = require('./keyframeeditor.jsx');
var MixMode = require('./mixmode.jsx');
var MobilePanel = require('./mobilepanel.jsx');

var PlaybackStore = require('./stores/playbackstore.js');
var VTIconStore = require('./stores/vticonstore.js');
var AnimationStore = require('./stores/animationstore.js');




var MobileEditor = React.createClass({

	/**
	* Render
	*/
	render : function() {

		return (
			<div id="app" ref="appRef">
				<EditorHeader displayMenu={false} isMixMode={this.props.isMixMode}/>
				<MobilePanel parentLeft="none" parentRight="none" />
			</div>
		);
	}
});


module.exports = MobileEditor;
