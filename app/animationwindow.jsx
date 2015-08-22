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
		} else if (this.props.animation === "cat")
		{
			var transformation = "";
			transformation += " translate(0," + ((1-this.props.animationParameters.size)*50) + ")"
			transformation += "scale("+1+","+this.props.animationParameters.size+")";
			animationContent = (
				<g>
					<g transform={transformation} stroke="none" stroke-opacity="1" stroke-dasharray="none" fill="none" fill-opacity="1"><path d="M 82.275525 45.8 C 81.700727 42.346694 79.135463 38.983972 74.57973 36.339208 C 64.15274 30.285907 47.247262 30.285907 36.82027 36.339208 C 32.264538 38.983973 29.699274 42.346695 29.124477 45.800002 Z" fill="black"/></g>
					<g stroke="none" stroke-opacity="1" stroke-dasharray="none" fill="none" fill-opacity="1"><ellipse cx="55.7" cy="47.29962" rx="26.700043" ry="15.500405" fill="black"/><path d="M 28.6 23.4 L 29.4 23.4 C 37.242443 23.4 43.6 29.757557 43.6 37.6 L 43.6 37.6 C 43.6 45.442444 37.242443 51.8 29.4 51.8 L 28.6 51.8 C 20.757557 51.8 14.4 45.442444 14.4 37.6 L 14.4 37.6 C 14.4 29.757557 20.757557 23.4 28.6 23.4 Z" fill="black"/><path d="M 28.6 23.4 L 29.4 23.4 C 37.242443 23.4 43.6 29.757557 43.6 37.6 L 43.6 37.6 C 43.6 45.442444 37.242443 51.8 29.4 51.8 L 28.6 51.8 C 20.757557 51.8 14.4 45.442444 14.4 37.6 L 14.4 37.6 C 14.4 29.757557 20.757557 23.4 28.6 23.4 Z" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/><path d="M 26.1 41.4 L 29 47.2 L 31.9 41.4 Z" fill="white"/><path d="M 16.2 18.8 L 30.4 33 L 16.2 33 Z" fill="black"/><path d="M 41.7 18.8 L 27.5 33 L 41.7 33 Z" fill="black"/><path d="M 19 34.26288 C 19 34.26288 20.743552 33.687607 22.925 33.6875 C 25.106448 33.687393 26.7 34.2625 26.7 34.2625" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/><path d="M 38.7 34.26288 C 38.7 34.26288 36.956448 33.687607 34.775 33.6875 C 32.593552 33.687393 31 34.2625 31 34.2625" stroke="white" stroke-linecap="round" stroke-linejoin="round" stroke-width="1"/><ellipse cx="43.3" cy="62.5" rx="12.30002" ry="3.9000063" fill="black"/><ellipse cx="37.5" cy="57.5" rx="12.30002" ry="3.9000063" fill="black"/><ellipse cx="65.5" cy="62.5" rx="12.30002" ry="3.9000063" fill="black"/><ellipse cx="72.3" cy="53.05" rx="10.700017" ry="12.0500194" fill="black"/><path d="M 73.8 42.00038 C 73.8 42.00038 83.600003 41.875001 87.2 47.8 C 90.8 53.725 91 60.85826 88.6 64.60038 C 86.200003 68.3425 81.4 73.00038 80.2 73.00038 C 79 73.00038 76.6 70.00038 76.6 69.00038 C 76.6 68.00038 82.925003 65.7175 84.4 61.60038 C 85.875 57.48326 86.05 53.87462 83.2 49.79962 C 80.350003 45.724622 75 46.00038 75 46.00038 Z" fill="black"/></g>
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