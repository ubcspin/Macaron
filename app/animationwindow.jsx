import React from 'react';

var AnimationWindow = React.createClass({

	propTypes: {
		animation:React.PropTypes.string,
		animationParameters:React.PropTypes.object
	},

	getDefaultProps: function() {
		return {
		      height: 50,
		      width:'100%'
		};

	},

	render : function() {
		var animationContent = <group />;
		if (this.props.animation === "heartbeat") {
			animationContent = (
					<path
						fill-rule="evenodd" 
						clip-rule="evenodd"
						fill="red"
						d="M25.119,2.564c12.434,0.023,18.68,5.892,24.88,17.612  c6.2-11.721,12.446-17.589,24.877-17.612c13.81-0.025,25.035,10.575,25.061,23.66c0.033,23.708-24.952,47.46-49.938,71.212  C25.016,73.685,0.03,49.932,0.064,26.224C0.085,13.14,11.309,2.539,25.119,2.564z">
					</path>
				);
	
		}

		return (
			<div width="100%" height="100%">
				<svg width="100%" height="100%">
					{animationContent}
				</svg>
			</div>
			);

	}


});


module.exports = AnimationWindow;