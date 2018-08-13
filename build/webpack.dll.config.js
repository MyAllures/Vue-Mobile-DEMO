// library.webpack.config.js
const path = require('path')
const webpack = require('webpack')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  mode: 'production',
  entry: {
    base: [
      'vue/dist/vue.esm.js',
      // 'axios',
      'babel-polyfill',
      'vue-cookie',
      'vue-i18n',
      'vue-router',
      'vuex',
      'vuex-router-sync'
    ],
    tools: [
      'crypto-js',
      'vue-lazyload',
      'lodash',
      'js-combinatorics',
      'lrz',
      'vue-moment',
      'vue-infinite-scroll',
      'vue2-filters',
      'async-validator',
    ]
  },
  output: {
    filename: '[name].dll.js',
    path: resolve('lib'),
    library: '[name]_lib'
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      })
    ]
  },
  plugins: [
    new webpack.DllPlugin({
      path: resolve('lib/[name]-manifest.json'),
      name: '[name]_lib',
      context: __dirname
    })
  ]
}
