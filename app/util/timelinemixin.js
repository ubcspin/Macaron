

var TimelineMixin = function(refID) {
		return {


				getInitialState: function() {

					return {
						actualWidth:10,
						actualHeight:10,
						offsetLeft:10,
						offsetTop:10
					}

				},
				
				componentDidMount: function () {

					window.addEventListener('resize', this.handleResize);
			    	
			    	var width = this.refs[refID].getDOMNode().clientWidth;
			    	var height = this.refs[refID].getDOMNode().clientHeight;

			    	var offsetLeft = this.refs[refID].getDOMNode().offsetLeft;
			    	var offsetTop = this.refs[refID].getDOMNode().offsetTop;


			    	this.setState( {actualWidth:width, actualHeight:height, offsetLeft:offsetLeft, offsetTop:offsetTop} );
			   	},


			   	handleResize: function(e) {
			    	var width = this.refs[refID].getDOMNode().clientWidth;
			    	var height = this.refs[refID].getDOMNode().clientHeight;


			    	var currentElement = this.refs[refID].getDOMNode();

			    	var offsetLeft = this.refs[refID].getDOMNode().offsetLeft;
			    	var offsetTop = this.refs[refID].getDOMNode().offsetTop;

			    	// while(currentElement)
			    	// {
			    	// 	offsetLeft += this.refs[refID].getDOMNode().offsetLeft;
			    	// 	offsetTop += this.refs[refID].getDOMNode().offsetTop;
			    	// 	currentElement = currentElement.offsetParent;
			    	// }

			    	this.setState( {actualWidth:width, actualHeight:height, offsetLeft:offsetLeft, offsetTop:offsetTop} );

				}

	}
};

module.exports = TimelineMixin;