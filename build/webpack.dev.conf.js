'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const skeletons = require('./skeletons')
const launchScreen = require('./launch')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

let companyMap = {
  'hg9q_1': {
    id: 1,
    name: 'cc722'
  },
  '75ue_2': {
   id: 2,
   name: 'fh801'
 },
  'cg8s_3': {
   id: 3,
   name: 'a59'
 },
  '8fn3_4': {
   id: 4,
   name: 'hm7899'
 },
 'ee9m_5': {
    id: 5,
    name: '6j'
  }
}
let companyInfo = companyMap[process.env.company] || {id: 0, name: 'staging'}


const devWebpackConfig = merge(baseWebpackConfig, {
  mode: 'development',
  module: {
    rules: utils.styleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    clientLogLevel: 'warning',
    historyApiFallback: true,
    hot: true,
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    new webpack.LoaderOptionsPlugin({ options: {} }),
    new webpack.DefinePlugin({
    'process.env': require('../config/dev.env')
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: 'index.html',
      host: process.env.HOST || '',
      companyId: companyInfo.id,
      companyName: companyInfo.name,
      homeSkeleton: skeletons.homeSkeleton,
      launchScreen,
      inject: true
    }),
    new HtmlWebpackPlugin({
      filename: 'app.html',
      template: 'app.html',
      host: process.env.HOST || '',
      companyId: companyInfo.id,
      companyName: companyInfo.name,
      homeSkeleton: skeletons.homeSkeleton,
      appHost: `https://storage.googleapis.com/lutra/${companyInfo.name}/`, // app storage url
      staticRoot: '/mobile/static/app/',
      launchScreen,
      inject: false
    }),
    new AddAssetHtmlPlugin([{
      filepath: require.resolve('../lib/base1.dll.js'),
      includeSourcemap: false
    },
    {
      filepath: require.resolve('../lib/tools.dll.js'),
      includeSourcemap: false
    }]),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ])
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})
