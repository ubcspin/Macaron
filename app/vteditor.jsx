
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

	mixins : [
				Reflux.connect(PlaybackStore.store, 'playback'), //emitted updates go to 'playback' key
				Reflux.connect(VTIconStore.store, 'vticons'), //emitted updates go to 'vticon' key
				Reflux.connect(ScaleStore.store, 'scales'), //emitted updates go to 'scales' key
				Reflux.connect(SelectionStore.store, 'selection'), //emitted updates go to 'selection' key
				Reflux.connect(AnimationStore.store, 'animation'), //emitted updates go to 'animation' key
				Reflux.connect(StudyStore.store, 'study') //emitted updates go to 'study' key
	],

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
