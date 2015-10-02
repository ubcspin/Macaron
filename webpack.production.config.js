var path = require('path');
var node_modules = path.resolve(__dirname, 'node_modules');
var pathToReact = path.resolve(node_modules, 'react/dist/react.min.js');

config = {
    entry: path.resolve(__dirname, 'app/main.js'),
    cache:true,
    resolve: {
        alias: {
          'react': pathToReact
        }
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: /firebase/,
            loader: 'babel'
        },
        {
            test:/audiolet\.js/,
            loaders: ['imports?this=>window', 'script']
        },
        {
            test:/socket\.io\.js/,
            loaders: ['imports?this=>window', 'script']
        },
        {
            test: /\.css$/,
            loader: "style-loader!css-loader"
        }

        ],
        noParse: [pathToReact]
    }
};

module.exports = config;
