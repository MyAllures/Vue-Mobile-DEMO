const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // HOST: '"https://staging-dev-1-api.h9339.com"',
  HOST: '"/api-ghost"',
  eiderHost: '"wss://staging-eider.h9339.com"',
  eagleHost: '"https://staging-eagle.h9339.com"',
  // eagleHost: '"/api-eagle"',
  wsEagleHost: '"wss://staging-eagle.h9339.com"',
  venomHost: '"https://staging-venom.h9339.com"',
  venomSocket: '"ws://staging-venom.h9339.com"',
  company: '"staging"'
})
