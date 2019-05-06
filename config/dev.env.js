const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  HOST: '"https://api.h9339.com"',
  chatHost: '"ws://raven.h9339.com"',
  chatApi: '"https://raven.h9339.com"',
  eiderHost: '"wss://eider.h9339.com"',
  venomHost: '"https://venom.h9339.com"',
  venomSocket: '"ws://venom.h9339.com"',
  company: '"staging"'
})
