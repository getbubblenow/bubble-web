const webpackMerge = require('webpack-merge');

module.exports = webpackMerge.merge(require('./webpack.config.js'), {
  mode: 'development',
  devServer: {
    proxy: {
      '/api': 'http://beta.bubv.net:8888',
    },
  },
});
