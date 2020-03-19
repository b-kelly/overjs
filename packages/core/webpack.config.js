const path = require('path');

module.exports = (env, argv) =>  ({
    mode: argv.mode === 'development' ? 'development' : 'production',
    devtool: argv.mode === 'development' ? "inline-source-map" : null,
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [{
                    loader: 'ts-loader',
                    options: {
                        configFile: 'tsconfig.build.json'
                    }
                }],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: 'umd',
    },
});