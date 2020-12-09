/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env) => ({
  mode: 'development',
  resolve: {
    extensions: ['.js', '.vue'],
  },
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.vue?$/,
        exclude: /(node_modules)/,
        use: 'vue-loader',
      },
      {
        test: /\.js?$/,
        exclude: /(node_modules)/,
        use: 'babel-loader',
      },
      {
        test: /\.(css|less)$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['css-loader', 'sass-loader'],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new CopyWebpackPlugin([{ from: 'src/public', to: '' }]),
  ],
  devServer: {
    historyApiFallback: true,
    publicPath: '/',
    proxy: env && !!env.server && {
      '/api': env.server,
    } || null,
  },
  output: {
    publicPath: '/',
  },
  externals: {
    // global app config object
    config: JSON.stringify({
      production: true,
      apiUrl: '/api',
    }),
  },
});
