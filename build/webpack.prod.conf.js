'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')

const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const AddAssetHtmlPlugin = require('add-asset-html-webpack-plugin')
const skeletons = require('./skeletons')
const launchScreen = require('./launch')

const env = process.env.NODE_ENV === 'testing'
  ? require('../config/test.env')
  : require('../config/prod.env')

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
   }
  }
let companyInfo = companyMap[process.env.company] || {id: 0, name: 'staging'}


const webpackConfig = merge(baseWebpackConfig, {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.s?[ac]ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ],
      },
      {
        test: /\.styl(us)?$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          {
            loader: 'stylus-loader',
            options: {
              'resolve url': true
            }
          }
        ],
      }
    ],
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[hash].js'),
    chunkFilename: utils.assetsPath('js/[id].[hash].js')
  },
  plugins: [
    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env
    }),
    // extract css into its own file
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: utils.assetsPath('css/[name].[chunkhash].css'),
      chunkFilename: utils.assetsPath('css/[id].[chunkhash].css')
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: process.env.NODE_ENV === 'testing'
        ? 'index.html'
        : config.build.index,
      template: 'index.html',
      title: env.SITE_TITLE.replace(/\"/g, ''),
      companyId: companyInfo.id,
      companyName: companyInfo.name,
      host: process.env.HOST || '',
      homeSkeleton: skeletons.homeSkeleton,
      launchScreen,
      inject: true,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    new HtmlWebpackPlugin({
      filename: 'app.html',
      template: 'app.html',
      title: env.SITE_TITLE.replace(/\"/g, ''),
      companyId: companyInfo.id,
      companyName: companyInfo.name,
      appHost: `https://storage.googleapis.com/lutra/${companyInfo.name}/`, // app storage url
     staticRoot: '/mobile/static/app/',
      host: process.env.HOST || '',
      homeSkeleton: skeletons.homeSkeleton,
      launchScreen,
      inject: false,
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),
    // keep module.id stable when vender modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    // copy custom static assets
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, '../static'),
        to: config.build.assetsSubDirectory,
        ignore: ['.*']
      }
    ]),
    new AddAssetHtmlPlugin([{
      filepath: require.resolve('../lib/base1.dll.js'),
      hash: true,
      files: ['index.html'],
      publicPath: '/mobile/static/js',
      outputPath: 'mobile/static/js',
      includeSourcemap: false
    },
    {
      filepath: require.resolve('../lib/tools.dll.js'),
      hash: true,
      files: ['index.html'],
      publicPath: '/mobile/static/js',
      outputPath: 'mobile/static/js',
      includeSourcemap: false
    }])
  ]
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig
