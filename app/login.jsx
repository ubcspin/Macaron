import React from 'react';
import Reflux from 'reflux';
import d3 from 'd3';

//to be clear, this is a component to create an "icon" link for a particular service such as Github or Twitter
//it's meant to be used in a seperate modal dialog pop up - it's not the login link on the main Macaron page itself

//refer to Oliver's logstore here
var LogStore = require('./stores/logstore.js');

//for exporting out as a reusable HTML component
var loginIcon = React.createClass({
 
	//no mixins or propTypes required in this case, due to it being more standalone, static
	mixins : [		
	],

	propTypes: {
	},

    //just to toggle display of icon on/off
    getDefaultProps: function() {
	    return {
	    	displayLoginIcon:true
	    }
	},

    //use to display text of user agreement currently set in the store 
	_onLoginIconClick : function(e){
		LogStore.actions.log("START_TASK"); //might have to double check his function's name
	},

	/**
	* Rendering
	* 
	*/
    render: function() {
       
       //empty but needed to refer to it by other HTML 
       var loginIconStyle = {
		};


        //I think this is the css for the button appearance
    	var loginIconButtonStyle = {
			marginLeft:'0.5em',
			marginRight:'0.5em',
			fontSize:12
		};

		var loginIconButton = <span />
		if (this.props.displayLoginIcon)
		{
			loginIconButton = (<a className="btn" style={loginIconButtonStyle} onClick={this._onLoginIconClick} ><i className="fa fa-loginIcon"></i>Login Icon</a>);
		}

		return (
			<span className="loginIcon">
			  
				{loginIconButton}
			 
			</span>
			);

    }

});

module.exports = loginIcon; 


