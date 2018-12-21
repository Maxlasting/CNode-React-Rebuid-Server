const methods = ['get', 'post', 'del', 'put']

const pathPrefixer = Symbol('pathPrefixer')

const routerMap = new Map()

const prefix = path => target => target.prototype[pathPrefixer] = path

const change2Arr = target => Array.isArray(target) ? target : [target]

const _setRouter = method => subPath => (target, key, descriptor) => {
  const configs = { method, subPath, target }
  const controllers = target[key]
  routerMap.set(configs, controllers)
  return descriptor
}

const methodsList = methods.reduce((ctx, key) => {
  ctx[key] = _setRouter(key)
  return ctx
}, {})

const _convert = middleware => (target, key, descriptor) => {
  target[key] = change2Arr(middleware).concat(change2Arr(target[key]))
  return descriptor
}

const createRouter = (app, routesPath, routes) => {
  const KoaRouter = require('koa-router')
  const path = require('path')

  const router = new KoaRouter()

  routes.map(route => path.join(routesPath, route)).forEach(require)

  for (let [configs, controllers] of routerMap) {
    const { method, subPath, target } = configs

    router[method](path.join(target[pathPrefixer], subPath), ...change2Arr(controllers))
  }

  app.use(router.routes()).use(router.allowedMethods())

  return router
}

const required = (rules) => _convert(async (ctx, next) => {
  let errs = []

  for (let key in rules) {
    const vals = rules[key]
    errs = errs.concat(vals.filter(_ => !ctx.request[key][_]))
  }

  if (!errs.length) return await next()

  ctx.body = {
    success: false,
    code: 412,
    msg: '缺少必要的请求参数',
    data: errs
  }
})

module.exports = { ...methodsList, createRouter, prefix, required }
