const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserWebpackPlugin = require("terser-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin")
module.exports = {
    mode: "production",
    optimization: {
        splitChunks: {
            chunks: 'all',
            minSize: 30 * 1024, // 大于30kb的才会被分割
        },
        minimize: false,
        minimizer: [
            // 配置生产环境的压缩方案：js和css
            new TerserWebpackPlugin({
                exclude: /\/mysql/,
                // 开启多进程打包
                parallel: true,
                terserOptions: {
                    output: {
                        // 是否输出可读性较强的代码，即会保留空格和制表符，默认为输出，为了达到更好的压缩效果，可以设置为false
                        beautify: false,
                        // 是否保留代码中的注释，默认为保留，为了达到更好的压缩效果，可以设置为false
                        comments: false
                    },
                    compress: {
                        // 是否在UglifyJS删除没有用到的代码时输出警告信息，默认为输出，可以设置为false关闭这些作用不大的警告
                        warnings: false,
                        // 是否删除代码中所有的console语句，默认为不删除，开启后，会删除所有的console语句
                        drop_console: true,
                        drop_debugger: true,
                        // 是否内嵌虽然已经定义了，但是只用到一次的变量，比如将 var x = 1; y = x, 转换成 y = 5, 默认为不转换，为了达到更好的压缩效果，可以设置为false
                        collapse_vars: true,
                        // 是否提取出现了多次但是没有定义成变量去引用的静态值，比如将 x = 'xxx'; y = 'xxx'  转换成var a = 'xxxx'; x = a; y = a; 默认为不转换，为了达到更好的压缩效果，可以设置为false
                        reduce_vars: true,
                        pure_funcs: ['console.log'] // 移除console
                    }
                }
            }),
        ],
    },
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js'
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    target: 'node',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: "ts-loader"
                },
                exclude: /node_modules/
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin,
        new CopyWebpackPlugin({
            patterns: [{ from: "./src/release/better_sqlite3.node", to: "" }],
        })
    ]
}