const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  HOST: '"http://35.244.216.28"',
  chatHost: '"ws://b583747.eastasia.cloudapp.azure.com:8003"',
  chatApi: '"http://b583747.eastasia.cloudapp.azure.com:8003"',
  eiderHost: '"ws://35.244.231.245"',
  company: '"staging"'
})
