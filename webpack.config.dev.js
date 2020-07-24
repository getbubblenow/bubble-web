/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */
const webpackMerge = require('webpack-merge');

module.exports = webpackMerge.merge(require('./webpack.config.js'), {
  mode: 'development',
  devServer: {
    proxy: {
      '/api': 'http://beta.bubv.net:8888',
    },
  },
});
