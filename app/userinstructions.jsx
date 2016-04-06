import React from 'react';
import Reflux from 'reflux';
import d3 from 'd3';

//we should still use a store, to maintain and change copy text more easily
var UserInstructionsStore = require('./stores/userinstructionsstore.js');

//for exporting out as a reusable HTML component
var userInstructions = React.createClass({
 
	//no mixins or propTypes required in this case, due to it being more standalone, static
	mixins : [		
	],

	propTypes: {
	},

    //just to toggle display of button on/off
    getDefaultProps: function() {
	    return {
	    	displayUserInstructionsButton:true
	    }
	},

    //use to display text of user instructions currently in store
	_onUserInstructionsClick : function(e){
		UserInstructionsStore.actions.showInstructions();
	},

    /**
	* Rendering
	* 
	*/
    render: function() {
       
       //empty but needed to refer to it by other HTML 
       var userInstructionsStyle = {

       	 
		};


        //I think this is the css for the button appearance
    	var buttonStyle = {
			marginLeft:'0.5em',
			marginRight:'0.5em',
			fontSize:12
		};

		var userInstructionsButton = <span />
		if (this.props.displayUserInstructionsButton)
		{
			userInstructionsButton = (<a className="btn" style={buttonStyle} onClick={this._onUserInstructionsClick} ><i className="fa fa-userInstructions"></i>Instructions</a>);
		    //userAgreementButton = (<p>Just a test</p>);
		    //userAgreementButton=(<a class="btn header" style={buttonStyle} onClick={this._onUserAgreementClick} ><i className="fa fa-download"></i> Save</a>);
		}
		//userAgreementButton = (<a class="btn header" style={buttonStyle} onClick={this._onUserAgreementClick} ><i className="fa fa-userAgreement"></i> User Agreement</a>);



		return (
			<span className="userInstructions" >
			  
				{userInstructionsButton}
			 
			</span>
			);

    }

});

module.exports = userInstructions; 