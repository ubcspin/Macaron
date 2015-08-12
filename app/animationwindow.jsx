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

		var centerStyle = {
			marginLeft:'auto',
			marginRight:'auto',
			display:'block'
		};


		var animationContent = <group />;
		var viewBox = "0 0 100 100";
		if (this.props.animation === "heartbeat") {
			animationContent = (
					<path
						transform={"translate("+((1-this.props.animationParameters.size)*50) + "," + ((1-this.props.animationParameters.size)*50) + ") scale(" + this.props.animationParameters.size + ")"}
						fill-rule="evenodd" 
						clip-rule="evenodd"
						fill="red"
						d="M25.119,2.564c12.434,0.023,18.68,5.892,24.88,17.612  c6.2-11.721,12.446-17.589,24.877-17.612c13.81-0.025,25.035,10.575,25.061,23.66c0.033,23.708-24.952,47.46-49.938,71.212  C25.016,73.685,0.03,49.932,0.064,26.224C0.085,13.14,11.309,2.539,25.119,2.564z">
					</path>
				);
		} else if (this.props.animation === "mobile")
		{
			viewBox = "0 0 100 100";
			var transformation = "";
			transformation += " translate("+((1-this.props.animationParameters.size)*50) + "," + ((1-this.props.animationParameters.size)*50) + ")"
			transformation += " scale(" + this.props.animationParameters.size + ")";

			transformation += " rotate(" + this.props.animationParameters.rotation + ", 50, 50)"; //rotate
			
			


			animationContent = (
					// <path
					// 	fill="black"
					// 	d="M60.007,53.008H39.993c-1.101,0-1.993,0.896-1.993,2.001v37.998c0,1.104,0.892,2.001,1.993,2.001h20.015  c1.1,0,1.993-0.896,1.993-2.001V55.009C62,53.905,61.107,53.008,60.007,53.008z M58.014,57.01v29.997H41.985V57.01H58.014z   M50,93.007c-1.104,0-2-0.895-2-2c0-1.104,0.896-2,2-2c1.104,0,1.997,0.896,1.997,2C51.997,92.113,51.104,93.007,50,93.007z" >
					// </path>

						<g transform={transformation}>
						<path d="M 29 12.5 L 71 12.5 C 73.20914 12.5 75 14.290861 75 16.5 L 75 83.5 C 75 85.70914 73.20914 87.5 71 87.5 L 29 87.5 C 26.790861 87.5 25 85.70914 25 83.5 L 25 16.5 C 25 14.290861 26.790861 12.5 29 12.5 Z"
								fill="black"/>
						<rect x="30.45" y="19.4"
						width="39.1"
						height="56.45"
						fill="white"/>
						<path d="M 50 78.75 L 50 78.75 C 51.656854 78.75 53 80.093147 53 81.75 L 53 81.75 C 53 83.406855 51.656854 84.75 50 84.75 L 50 84.75 C 48.343146 84.75 47 83.406855 47 81.75 L 47 81.75 C 47 80.093147 48.343146 78.75 50 78.75 Z"
						fill="white"/>
						<path d="M 50 78.75 L 50 78.75 C 51.656854 78.75 53 80.093147 53 81.75 L 53 81.75 C 53 83.406855 51.656854 84.75 50 84.75 L 50 84.75 C 48.343146 84.75 47 83.406855 47 81.75 L 47 81.75 C 47 80.093147 48.343146 78.75 50 78.75 Z"
						stroke="black"
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1"/>
						</g>
				);
		}

// viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"
		return (
			<div style={centerStyle}>
				<svg style={centerStyle} width="100" height="100" viewBox={viewBox}>
					{animationContent}
				</svg>
			</div>
			);

	}


});


module.exports = AnimationWindow;