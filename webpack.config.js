//const { Module } = require('webpack');
const webpack = require('webpack')

const path = require('path') 
const HTMLWebpackPlugin = require('html-webpack-plugin') 
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin') 
const MiniCssExtractPlugin = require('mini-css-extract-plugin') 
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const isDev = process.env.NODE_ENV==='development' 
const isProd = !isDev
const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }
    if (isProd) {
        config.minimizer = [
            new CssMinimizerPlugin(),
            new TerserPlugin()
        ]
    }
    return config
}

module.exports = {
    context: path.resolve(__dirname, 'src'), 
    mode: 'development', 
    target: 'web',
    entry: { 
        main: ['@babel/polyfill', './main.js'],
        
    }, 

    plugins: [
        new HTMLWebpackPlugin({            
            template: './index.html', 
            minify: {
                collapseWhitespace: isProd
            }
        }),        
        new CleanWebpackPlugin(), 
        /*new CopyWebpackPlugin({
            /*patterns:[
                { 
                    from: path.resolve(__dirname, 'src/img/favicon.ico'), 
                    to: path.resolve(__dirname, 'dist'),
                }, 
            ]
        }),*/
        new MiniCssExtractPlugin({
            filename: filename('css')
        }),
        new ESLintPlugin(),
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        }),
    ],
    devServer: { 
        contentBase: './dist',
        //hot: isDev,        
        //inline: true
        //liveReload: true,
        
    },
    output: { 
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist'),
        
    },
    resolve: {
        extensions: ['.js', '.png', '.json', '.gif'],
        alias: {
            '@' : path.resolve(__dirname, 'src')
        }
    },
    optimization: optimization(),    
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: 
                            {
                                publicPath: '', //без этого ругается)))                                
                            }, 
                    }, "style-loader", 'css-loader']
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    {
                    loader: MiniCssExtractPlugin.loader,
                    options: 
                        {
                            publicPath: '',                             
                        }, 
                    },
                    {
                    loader: 'css-loader',
                    },
                    {
                    loader: 'postcss-loader',
                    options: {
                        sourceMap: true,
                        'postcssOptions': {
                            'config': path.resolve(__dirname, 'postcss.config.js'),
                        },
                    }
                    },
                    {
                    loader: 'sass-loader', options: { sourceMap: true }
                    }
                ]
            },
            {
                test: /\.(png|jpe?g|gif)$/i,             
                loader: 'file-loader',
                options: {
                    name: '[path][name].[ext]',
                },
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: ['file-loader']
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader'],
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',                            
                        ],
                        plugins: [
                            "@babel/plugin-proposal-class-properties"
                        ]                     
                    }                    
                }
            }
        ]
    }
}