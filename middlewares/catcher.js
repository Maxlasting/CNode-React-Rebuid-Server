module.exports = app => app.use(async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.status = 500
    if (process.env.NODE_ENV === 'development') {
      console.error(err.message)
      ctx.body = err.message
    } else {
      ctx.body = '500 | 您访问的服务出错啦！'
    }
  }
})
