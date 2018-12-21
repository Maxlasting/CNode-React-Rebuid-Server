const decorators = require('../decorators')
const { join } = require('path')

const routesPath = join(__dirname, '../routes/')

const routes = ['user-router', 'api-router', 'default']

module.exports = app => decorators.createRouter(
  app,
  routesPath,
  routes
)
