const path = require('path')

module.exports = {
  dev: {
    env: require('./dev.env'),
    assetsSubDirectory: 'mobile/static',
    assetsPublicPath: '/',
    proxyTable: {
      '/api-ghost': {
        target: 'https://staging-api.h9339.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api-ghost': ''
        }
      },
      '/api-eagle': {
        target: 'http://staging-eagle.h9339.com',
        changeOrigin: true,
        pathRewrite: {
          '^/api-eagle': ''
        }
      }
    },
    host: '0.0.0.0',
    port: 8080,
    autoOpenBrowser: false,
    errorOverlay: true,
    notifyOnErrors: true,
    poll: false,
    useEslint: true,
    showEslintErrorsInOverlay: false,
    devtool: 'eval-source-map',
    cacheBusting: true,
    cssSourceMap: false
  },
  build: {
    env: require('./prod.env'),
    index: path.resolve(__dirname, '../dist/index.html'),
    assetsRoot: path.resolve(__dirname, '../dist'),
    assetsSubDirectory: 'mobile/static',
    assetsPublicPath: '/',
    productionSourceMap: true,
    devtool: '#source-map',
    productionGzip: false,
    productionGzipExtensions: ['js', 'css'],
    bundleAnalyzerReport: process.env.npm_config_report
  }
}
