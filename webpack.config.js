/* eslint-disable key-spacing */
const path = require('path');

module.exports = {
    entry: {
        character:  './js/content.js',
        encounters:  './js/encounters.js',
        background: './js/background.js',
        popup:      './js/popup.js',
        settings:   './js/options.js'
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'build')
    },
    devtool: 'inline-cheap-source-map'
};
