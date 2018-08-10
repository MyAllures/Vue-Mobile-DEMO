// library.webpack.config.js
const path = require('path')
const webpack = require('webpack')
const utils = require('./utils')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

module.exports = {
  mode: 'production',
  entry: {
    base: [
      'vue/dist/vue.esm.js',
      'qs',
      'lodash',
      'axios',
      'vuex',
      'vue-cookie',
      'vue-router',
      'vue-i18n'
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
