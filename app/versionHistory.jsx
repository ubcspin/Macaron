import React from 'react';

var versionHistory = React.createClass({

    mixins : [
    ],

    propTypes: {
    },

    getDefaultProps: function() {
        return {
            displayVersionHistoryButton:true
        }
    },

    _onHistoryVersionClick : function(e){

    },

    /**
     * Rendering
     */
    render: function() {

        var versionHistoryStyle = {
        };

        var buttonStyle = {
            marginLeft:'0.5em',
            marginRight:'0.5em',
            fontSize:12,
            fontcolor: 'grey'
        };

        var versionHistoryButton = <span />
        if (this.props.displayVersionHistoryButton)
        {
            var jsonData = require('json!../package.json');
            var currentVersion = JSON.parse(JSON.stringify(jsonData));
            currentVersion = "v" + currentVersion.version;
            versionHistoryButton = (<a className="btn" style={buttonStyle} onClick={this._onHistoryVersionClick()} ><i className="fa fa-versionHistory"></i>{currentVersion}</a>);
        }

        return (
            <span className="versionHistory">

				{versionHistoryButton}

			</span>
        );

    }

});

module.exports = versionHistory;