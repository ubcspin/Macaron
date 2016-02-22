# Macaron
Vibrotactile Icon Editor

## Installation Instructions

Simply run:

`npm install`

to download and install all dependencies. Then:

`npm run build`

to compile the JS code into an app. Then:

`npm run dev`

To run the server. If there are any issues, consult the detailed instructions below.

## Contributing

The cardinal rule for this repository is to LEAVE MASTER ALONE. For every new feature/bug fix/etc, the process is as follows. Make sure your local repository is current by:

`git fetch`;
`git checkout master`;
`git pull master`;

You shouldn't have any conflicts, but if you do, make sure that your master branch is identical to the GitHub master. Then checkout your own branch:

`git checkout -b <your initials>_<fix tag>_<one-or-two-word-description>`

For example I am Paul Bucci and I'm doing a polishing fix with the readme:

`git checkout -b pb_polish_readmeupdate`

After you've commited your changes, push the branch to the GitHub repo:

`git push origin <your initials>_<fix tag>_<one-or-two-word-description>`

Then make a pull request. Either Paul, Oliver, or Matthew will review your code, make comments, and either merge to master or ask you to make some more changes.

## Detailed Build Environment Instructions

Macaron requires the following libraries:

 - [React][react]
 - [NodeJS tools][nodejs]
 - [NodeJS Package Manager (NPM)][npm]
 - [Webpack][webpack]
 - [d3][d3]
 - [reflux][reflux]

Begin by installing [NPM][npm] for your OS. Once NPM is installed, install react as follows:

 `npm install react --save`

and install webpack:

 - `npm install -g webpack`
 - `npm i webpack --save-dev`
 - `npm i webpack-dev-server --save`

and the JSX syntax handler:

- `npm install babel-loader --save-dev`

You will also need to install the following libraries:

- [d3][d3]: `npm install d3 --save`
- [reflux][reflux]: `npm install reflux --save`
- [firebase][firebase]: `npm install firebase --save`

And you will need two custom loaders for webpack, to import Audiolet, a non-NPM library contained in `thirdparty/audiolet`:

 - `npm install imports-loader --save`
 - `npm install script-loader --save`

 As well, the following two loaders for loading CSS stylesheets:
 
 - `npm install style-loader css-loader --save-dev`

Now, you can build the environment with `npm run build`, and serve it on `localhost:8080` with `npm run dev`. When served, it will automatically refresh when you change components. 
For more information, follow this tutorial: https://github.com/christianalfoni/react-webpack-cookbook/wiki


[nodejs]: http://nodejs.org
[npm]: https://www.npmjs.org
[react]: http://facebook.github.io/react/
[webpack]: http://webpack.github.io
[d3]: http://d3js.org
[reflux]: https://github.com/spoike/refluxjs
[firebase]: https://www.firebase.com

