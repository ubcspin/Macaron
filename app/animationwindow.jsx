import React from 'react';

var AnimationWindow = React.createClass({

	// propTypes: {

	// },

	getDefaultProps: function() {
		return {
		      height: 50,
		      width:'100%'
		};

	},

	render : function() {

		return (
			<div width="100%" height="100%">
				<svg width="100%" height="100%">
				</svg>
			</div>
			);

	}


});


module.exports = AnimationWindow;