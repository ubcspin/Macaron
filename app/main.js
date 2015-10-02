import React from 'react';
var VTEditor = require('./vteditor.jsx');
require('../css/macaron.css');

main();

function main() {
		React.render(<VTEditor />, document.getElementById('app'));
	}
