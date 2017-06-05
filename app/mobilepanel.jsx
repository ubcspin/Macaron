import React from 'react';
import Reflux from 'reflux';

var MobilePanel = React.createClass({

  mixins : [
				// Reflux.connect(VTIconStore.store, 'vticons'), //emitted updates go to 'vticon' key
	],

  propTypes: {
    parentLeft: React.PropTypes.String,
    parentRight: React.PropTypes.String
  },
	

	/**
	* Render
	*/
	render : function() {

		return (
			<div className="mobilepanel">
			</div>
		);
	}
});


module.exports = MobilePanel;
