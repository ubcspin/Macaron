

var TimelineMixin = {


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
    	
    	var width = this.refs.divWrapper.getDOMNode().clientWidth;
    	var height = this.refs.divWrapper.getDOMNode().clientHeight;

    	var offsetLeft = this.refs.divWrapper.getDOMNode().offsetLeft;
    	var offsetTop = this.refs.divWrapper.getDOMNode().offsetTop;


    	this.setState( {actualWidth:width, actualHeight:height, offsetLeft:offsetLeft, offsetTop:offsetTop} );
   	},


   	handleResize: function(e) {
    	var width = this.refs.divWrapper.getDOMNode().clientWidth;
    	var height = this.refs.divWrapper.getDOMNode().clientHeight;


    	var currentElement = this.refs.divWrapper.getDOMNode();

    	var offsetLeft = this.refs.divWrapper.getDOMNode().offsetLeft;
    	var offsetTop = this.refs.divWrapper.getDOMNode().offsetTop;

    	// while(currentElement)
    	// {
    	// 	offsetLeft += this.refs.divWrapper.getDOMNode().offsetLeft;
    	// 	offsetTop += this.refs.divWrapper.getDOMNode().offsetTop;
    	// 	currentElement = currentElement.offsetParent;
    	// }

    	this.setState( {actualWidth:width, actualHeight:height, offsetLeft:offsetLeft, offsetTop:offsetTop} );

	}


};

module.exports = TimelineMixin;