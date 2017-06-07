import React from 'react';
import Reflux from 'reflux';

var MobilePanel = React.createClass({

  mixins : [
				// Reflux.connect(VTIconStore.store, 'vticons'), //emitted updates go to 'vticon' key
	],

  propTypes: {
    parentLeft: React.PropTypes.String,
    parentRight: React.PropTypes.String,
	name : React.PropTypes.string.isRequired,
	selection : React.PropTypes.object.isRequired,
	currentTime: React.PropTypes.number.isRequired
	},

	getDefaultProps: function() {
	    return {
	      height: 190,
	      circleColor:'#FF8400',
	      selectedCircleColor:'#B05B00',
	      keyframeCircleRadius: 1,
	      playheadFill: '#FF0000',

	    }
	},

	

	/**
	* Render
	*/
	render : function() {

		return (
			<div className="mobilepanel">
			<KeyframeEditor 
					name="foo"
                    height="160"
                    axisNameWidth="20"
    				scaleX={scaleXwave2}
    				currentTime={this.state.playback.currentTime}
    				parameter="amplitude"
					vticon={this.props.parentLeft}
    				keyframeCircleRadius={this.props.keyframeCircleRadius}
					playheadFill={this.props.playheadFill}
    				selection={this.state.selection}/>
			</div>
		);
	}
});


module.exports = MobilePanel;
