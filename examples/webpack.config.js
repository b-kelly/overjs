const path = require('path');
const merge = require('webpack-merge');
var HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('../webpack.config');

module.exports = merge(config, {
    mode: "development",
    entry: path.resolve(__dirname, './index.ts'),
    output: {
        filename: 'docs.js',
        path: path.resolve(__dirname, '../public'),
    },
    plugins: [new HtmlWebpackPlugin({
        template: path.resolve(__dirname, './index.html')
    })],
    devServer: {
        contentBase: path.join(__dirname, '../public'),
        compress: true,
        port: 9000
    }
});