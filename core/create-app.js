const Koa = require('koa')
const { join } = require('path')

const app = new Koa()

function KoaLoader () {
  this.loaders = []
  return this
}

KoaLoader.prototype.add = function (middleware) {
  if (typeof middleware === 'string') {
    this.loaders.push(join(__dirname, '../middlewares/', middleware))
  }
  if (Array.isArray(middleware)) {
    this.loaders = middleware.reduce((ctx, item) => {
      ctx.push(join(__dirname, '../middlewares/', item))
      return ctx
    }, this.loaders)
  }
  return this
}

KoaLoader.prototype.init = function (app) {
  for (let item of this.loaders) {
    const module = require(item)
    if (typeof module === 'function') {
      module(app)
    }
  }
  return this
}

const appLoader = new KoaLoader

module.exports = { app, appLoader }
