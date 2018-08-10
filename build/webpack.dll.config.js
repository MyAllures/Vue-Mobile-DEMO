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
      'async-validator',
      'axios',
      'babel-polyfill',
      'crypto-js',
      'js-combinatorics',
      'lodash',
      'lrz',
      'vue-awesome',
      'vue-cookie',
      'vue-i18n',
      'vue-infinite-scroll',
      'vue-lazyload',
      'vue-moment',
      'vue-router',
      'vue2-filters',
      'vuex',
      'vuex-router-sync'
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
