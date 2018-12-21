const koaBody = require('koa-body')

module.exports = app => app.use(koaBody({
  multipart: true,
  urlencoded: true,
  formidable: {
    maxFileSize: 10 * 1024 * 1024
  }
}))
