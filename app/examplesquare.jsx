import React from 'react';


var ExampleSquare = React.createClass({
	
	propTypes: {
		exampleicon : React.PropTypes.object.isRequired
			},
	
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

	render() {
		return (
			<div className="example-square" />
			);
	}

});


module.exports = ExampleSquare;