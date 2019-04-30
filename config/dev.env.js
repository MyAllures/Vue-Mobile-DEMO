const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  HOST: '"http://staging-dev-1-api.h9339.com"',
  chatHost: '"ws://staging-raven.h9339.com"',
  chatApi: '"https://staging-raven.h9339.com"',
  eiderHost: '"ws://staging-dev-1-eider.h9339.com"',
  venomHost: '"https://staging-venom.h9339.com"',
  venomSocket: '"ws://staging-venom.h9339.com"',
  company: '"staging"'
})
