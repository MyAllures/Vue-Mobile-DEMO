const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  HOST: '"http://ghost-refactor.eastasia.cloudapp.azure.com:8000"',
  chatHost: '"ws://b583747.eastasia.cloudapp.azure.com:8003"',
  chatApi: '"http://b583747.eastasia.cloudapp.azure.com:8003"',
  eiderHost: '"ws://b583747.eastasia.cloudapp.azure.com:8005"',
  company: '"staging"'
})
