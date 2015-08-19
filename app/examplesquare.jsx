import React from 'react';

var ExampleStore = require('./stores/examplestore.js');


var ExampleSquare = React.createClass({
	
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
	//       // visColor:'#FFDDAD',
	//       // background:"#FAFAFA",
	//       // resolution:4000,
	//       // maxFrequencyRendered:250,
	//       // limitFrequencies:true
	    }
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
			<div className={className} onClick={this._handleClick} style={styles}/>
			);
	}

});


module.exports = ExampleSquare;