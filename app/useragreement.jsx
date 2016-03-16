import React from 'react';
import Reflux from 'reflux';
import d3 from 'd3';


//we should still use a store, to maintain and change copy text more easily
var UserAgreementStore = require('./stores/useragreementstore.js');

//for exporting out as a reusable HTML component
var userAgreement = React.createClass({
 
	//no mixins or propTypes required in this case, due to it being more standalone, static
	mixins : [		
	],

	propTypes: {
	},

    //just to toggle display of button on/off
    getDefaultProps: function() {
	    return {
	    	displayUserAgreementButton:true
	    }
	},

    //use to display text of user agreement currently set in the store 
	_onUserAgreementClick : function(e){
		UserAgreementStore.actions.showText();
	},

	/**
	* Rendering
	* 
	*/
    render: function() {
       
       //empty but needed to refer to it by other HTML 
       var userAgreementStyle = {
		};


        //I think this is the css for the button appearance
    	var buttonStyle = {
			marginLeft:'0.5em',
			marginRight:'0.5em',
			fontSize:12
		};

		var userAgreementButton = <span />
		if (this.props.displayUserAgreementButton)
		{
			userAgreementButton = (<a className="btn" style={buttonStyle} onClick={this._onUserAgreementClick} ><i className="fa fa-userAgreement"></i>User Agreement</a>);
		    //userAgreementButton = (<p>Just a test</p>);
		    //userAgreementButton=(<a class="btn header" style={buttonStyle} onClick={this._onUserAgreementClick} ><i className="fa fa-download"></i> Save</a>);
		}
		//userAgreementButton = (<a class="btn header" style={buttonStyle} onClick={this._onUserAgreementClick} ><i className="fa fa-userAgreement"></i> User Agreement</a>);



		return (
			<span className="userAgreement">
			  
				{userAgreementButton}
			 
			</span>
			);

    }

});

module.exports = userAgreement; 


