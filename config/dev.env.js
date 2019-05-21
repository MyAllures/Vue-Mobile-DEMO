const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  HOST: '"http://refactor-api.h9339.com"',
  // HOST: '"/api-ghost"',
  eiderHost: '"ws://refactor-eider.h9339.com"',
  eagleHost: '"http://refactor-eagle.h9339.com"',
  // eagleHost: '"/api-eagle"',
  wsEagleHost: '"ws://refactor-eagle.h9339.com"',
  venomHost: '"https://venom.h9339.com"',
  venomSocket: '"ws://venom.h9339.com"',
  company: '"staging"'
})
