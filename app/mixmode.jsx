import React from 'react';
import Reflux from 'reflux';

var MixMode = React.createClass({

  propTypes: {
    isMixMode: React.PropTypes.bool
  },

  render : function () {

    if (this.props.isMixMode) {
      return (
        <div><span>Test Mix Mode</span></div>
      );
    }

    else {
      return(
        <div />
      );
    }
  }

});

module.exports = MixMode;
