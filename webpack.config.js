var path = require('path');


module.exports = {
entry: ['webpack/hot/dev-server', path.resolve(__dirname, 'app/app.js')],
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'bundle.js',
    },
};
