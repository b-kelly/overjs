const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = (_, argv) => ({
    mode: argv.mode === "development" ? "development" : "production",
    devtool: argv.mode === "development" ? "inline-source-map" : false,
    entry: "./src/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: "ts-loader",
                        options: {
                            configFile: "tsconfig.build.json",
                        },
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    plugins: [new CleanWebpackPlugin()],
    output: {
        filename: "[name].js",
        path: path.resolve(__dirname, "dist"),
        libraryTarget: "umd",
    },
});
