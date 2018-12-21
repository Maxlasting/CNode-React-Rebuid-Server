const fs = require('fs')
const util = require('util')
const { join } = require('path')
const readFile = util.promisify(fs.readFile)
const { prefix, get } = require('../decorators')

@prefix('/')
class _defaultRouter_ {
  @get('*')
  async _serverRender (ctx) {
    ctx.set('Content-Type', 'text/html')

    const html = await readFile(
      join(__dirname, '../apps/index.html'),
      'utf-8'
    )

    ctx.body = html
  }
}
