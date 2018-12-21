const session = require('koa-session')

module.exports = app => {
  app.keys = ['CNode']

  const CONFIG = {
    key: 'Y1Z9z8S9D0Fu8QIanG24',
    maxAge: 2 * 60 * 60 * 1000,
    overwrite: true,
    httpOnly: true,
    signed: true,
    rolling: false
  }

  app.use(session(CONFIG, app))
}
