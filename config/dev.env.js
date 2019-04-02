const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // HOST: '"http://refactor-api.h9339.com"',
  HOST: '"/api-ghost"',
  chatHost: '"ws://refactor-raven.h9339.com"',
  chatApi: '"https://refactor-raven.h9339.com"',
  eiderHost: '"ws://refactor-eider.h9339.com"',
  // eagleHost: '"http://refactor-eagle.h9339.com"',
  eagleHost: '"/api-eagle"',
  wsEagleHost: '"ws://refactor-eagle.h9339.com"',
  company: '"staging"'
})
