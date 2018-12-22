const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  HOST: '"http://staging-api.h9339.com"',
  chatHost: '"ws://b583747.eastasia.cloudapp.azure.com:8003"',
  chatApi: '"http://b583747.eastasia.cloudapp.azure.com:8003"',
  eiderHost: '"ws://staging-eider.h9339.com"',
  company: '"staging"'
})
