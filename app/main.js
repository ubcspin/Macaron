import React from 'react';
var VTEditor = require('./vteditor.jsx');
require('../css/macaron.css');
require('../css/mcpolicy.css');
require('../css/mcinstructions.css');
require('../css/saveload.css')

//require('../img/');


main();

function main() {
		React.render(<VTEditor />, document.getElementById('app'));
	}
