
import React from 'react';
import Reflux from 'reflux';
import d3 from 'd3';

var EditorHeader = require('./editorheader.jsx');
var ControlBar = require('./controlbar.jsx');
var SoundGen = require('./soundgen.jsx'); //TODO
var PlayHead = require('./playhead.jsx');
var IconVis = require('./iconvis.jsx');
var AnimationWindow = require('./animationwindow.jsx');
var KeyframeEditor = require('./keyframeeditor.jsx');
var Gallery = require('./gallery.jsx');
var EditorMode = require('./editormode.jsx');
var MixMode = require('./mixmode.jsx');

var PlaybackStore = require('./stores/playbackstore.js');
var VTIconStore = require('./stores/vticonstore.js');
var DragStore = require('./stores/dragstore.js');
var ScaleStore = require('./stores/scalestore.js');
var SelectionStore = require('./stores/selectionstore.js');
var ClipboardStore = require('./stores/clipboardstore.js');
var AnimationStore = require('./stores/animationstore.js');
var StudyStore = require('./stores/studystore.js');





var VTEditor = React.createClass({

	propTypes: {
		isMixMode: React.PropTypes.bool
	},

	getDefaultProps: function() {
		return { isMixMode: true }
	},


	/**
	* Render
	*/
	render : function() {

		return (
			<div id="app" ref="appRef">
				<EditorHeader isMixMode={this.props.isMixMode}/>
				<EditorMode isMixMode={this.props.isMixMode} />
				<MixMode isMixMode={this.props.isMixMode} />
			</div>
		);
	}
});


module.exports = VTEditor;
