import React from 'react';

var TimelineMixin = function(refID) {
		return {

				propTypes: {
					scaleX: React.PropTypes.object.isRequired
				},

				getInitialState: function() {
					return {
						offsetLeft:10,
						offsetTop:10
					}

				},
				
				componentDidMount: function () {

					window.addEventListener('resize', this.handleResize);			   

			    	var offsetLeft = this.refs[refID].getDOMNode().offsetLeft;
			    	var offsetTop = this.refs[refID].getDOMNode().offsetTop;


			    	this.setState( {offsetLeft:offsetLeft, offsetTop:offsetTop} );
			   	},


			   	handleResize: function(e) {

			    	var currentElement = this.refs[refID].getDOMNode();

			    	var offsetLeft = this.refs[refID].getDOMNode().offsetLeft;
			    	var offsetTop = this.refs[refID].getDOMNode().offsetTop;

			    	// while(currentElement)
			    	// {
			    	// 	offsetLeft += this.refs[refID].getDOMNode().offsetLeft;
			    	// 	offsetTop += this.refs[refID].getDOMNode().offsetTop;
			    	// 	currentElement = currentElement.offsetParent;
			    	// }

			    	this.setState( {offsetLeft:offsetLeft, offsetTop:offsetTop} );

				}

	}
};

module.exports = TimelineMixin;