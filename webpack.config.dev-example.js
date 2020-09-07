/**
 * Copyright (c) 2020 Bubble, Inc.  All rights reserved.
 * For personal (non-commercial) use, see license: https://getbubblenow.com/bubble-license/
 */

// -------------------------------------------------------------
// Copy this file to webpack.config.dev.js to use in development
// -------------------------------------------------------------

const webpackMerge = require('webpack-merge');

module.exports = webpackMerge.merge(require('./webpack.config.js'), {
  mode: 'development',
  devServer: {
    proxy: {
    '/api': 'http://example.com:8888'   // change this to wherever your bubble API is running
    }
  },
});
