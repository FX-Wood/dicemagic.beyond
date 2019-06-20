/* eslint-disable key-spacing */
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = function(env, args) {
    // please see reference: https://stackoverflow.com/questions/44232366/how-do-i-build-a-json-file-with-webpack
    function transformManifest(buffer) {
        if (args.firefox) {
            const manifest = JSON.parse(buffer.toString());

            const newManifest = Object.assign({}, manifest, {
                browser_specific_settings: {
                    gecko: {
                        id: '{70be19ad-ca69-40d4-b3da-5592b653f59e}'
                    }
                }
            });
            return JSON.stringify(newManifest);
        }
        return buffer;
    }
    return {
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
        plugins: [
            new CleanWebpackPlugin(),
            new CopyWebpackPlugin([
                {
                    from: './manifest.json',
                    to:   'manifest.json',
                    transform(content, path) {
                        return transformManifest(content);
                    }
                }
            ]),
            new CopyWebpackPlugin([
                {
                    from: './css',
                    to:   'css'
                }
            ]),
            new CopyWebpackPlugin([
                {
                    from: './fonts',
                    to:   'fonts'
                }
            ]),
            new CopyWebpackPlugin([
                {
                    from: './html',
                    to:   'html'
                }
            ]),
            new CopyWebpackPlugin([
                {
                    from: './icon',
                    to:   'icon'
                }
            ])
        ]
    };
};
