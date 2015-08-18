import React from 'react';
import Reflux from 'reflux';

var ExampleStore = require('./stores/examplestore.js');
var ExampleSquare = require('./examplesquare.jsx');


var Gallery = React.createClass({

	mixins : [
				Reflux.connect(ExampleStore.store, 'examples'), //emitted updates go to 'examples' key
				],

	// propTypes: {
	// 	exampleicon : React.PropTypes.object.isRequired
	// 		},
	
	// getDefaultProps: function() {
	//     return {
	//       border:2,
	//       selectedBorder:10
	//       // width:'100%',
	//       // visColor:'#FFDDAD',
	//       // background:"#FAFAFA",
	//       // resolution:4000,
	//       // maxFrequencyRendered:250,
	//       // limitFrequencies:true
	//     }
	// },


	render: function() {

		var examples = this.state.examples.examples;

		return (
			<div className="example-gallery">
				{Object.keys(examples).map( (exName) => (
						<ExampleSquare exampleName={exName} exampleicon={examples[exName]} />
					))}
			</div>
			)

	}

});


module.exports = Gallery;