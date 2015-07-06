# Macaron
Vibrotactile Icon Editor

## Build Environment

Macaron requires the following libraries:

 - [React][react]
 - [NodeJS tools][nodejs]
 - [NodeJS Package Manager (NPM)][npm]
 - [Webpack][webpack]
 - [d3][d3]
 - [reflux][reflux]

 Once NPM is installed, install react and react-tools as follows:

 `npm install -g react-tools`
 `npm install react --save`

 and install webpack:

 `npm install -g webpack`
 `npm i webpack --save-dev`
 `npm i webpack-dev-server --save`

 and the JSX syntax handler:

`npm install babel-loader --save-dev`

 Now, you can build the environtment with `npm run build`, and serve it on `localhost:8080` with `npm run dev`. When served, it will automatically refresh when you change components. 
 For more information, follow this tutorial: https://github.com/christianalfoni/react-webpack-cookbook/wiki

 You will also need to install the following libraries:

 [d3][d3]: `npm install d3 --save`
 [reflux][reflux]: `npm install reflux --save`


[nodejs]: http://nodejs.org
[npmjs]: https://www.npmjs.org
[react]: http://facebook.github.io/react/
[webpack]: http://webpack.github.io
[d3]: http://d3js.org
[reflux]: https://github.com/spoike/refluxjs

