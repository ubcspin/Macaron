import React from 'react';
import Reflux from 'reflux';
import d3 from 'd3';

var ExampleStore = require('./stores/examplestore.js');
var WaveformPathMixin = require('./util/waveformpathmixin.js');



var ExampleSquare = React.createClass({
	mixins: [
		WaveformPathMixin,
		Reflux.listenTo(ExampleStore.store,"onExampleChange")
	],
	
	propTypes: {
		exampleName : React.PropTypes.string.isRequired,
		exampleicon : React.PropTypes.object.isRequired
			},
	
	getDefaultProps: function() {
	    return {
	//       border:2,
	//       selectedBorder:10
	       width:100,
	       height:50,
	      visColor:'#FFDDAD',
	      // background:"#FAFAFA",
	      resolution:2000,
	      maxFrequencyRendered:40,
	      limitFrequencies:true
	    }
	},

	onExampleChange: function(examples) {

		var example = examples.examples[this.props.exampleName];
		var scaleY = d3.scale.linear()
                    .domain( [-1, 1]) // return value from sine
                    .range([0, this.props.height]);

        var scaleX = d3.scale.linear()
                    .domain( [0, example.duration]) // return value from sine
                    .range([0, this.props.width]);
		this._visPath = this.computeWaveformPath(example,
			scaleX, scaleY,
			this.props.resolution, this.props.maxFrequencyRendered, this.props.limitFrequencies);
	},

	componentWillMount: function () { 
	    this._visPath = "";
	    ExampleStore.actions.selectExample("v4"); 
	 

	},

	_handleClick : function(e) {
		ExampleStore.actions.selectExample(this.props.exampleName);
	},

	render() {

		var className = "example-square";
		if (this.props.exampleicon.selected) {
			className += " selected";
		}

		var styles = {
			width:this.props.width,
			height:this.props.height,
		};

		return (
			<div className={className} onClick={this._handleClick} style={styles}>
				<svg width="100%" height="100%">
					<path stroke={this.props.visColor} strokeWidth="0.5" fill="none" d={this._visPath} />
				</svg>
			</div>
			);
	}

});


module.exports = ExampleSquare;