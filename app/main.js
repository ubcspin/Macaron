import React from 'react';
var MobileEditor = require('./mobileeditor.jsx');
require('../css/macaron.css');
require('../css/mcpolicy.css');
require('../css/mcinstructions.css');
require('../css/saveload.css');

//require('../img/');


main();

function main() {
		React.render(<MobileEditor />, document.getElementById('app'));
	}
