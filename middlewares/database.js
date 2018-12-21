const mongoose = require('mongoose')
const { join } = require('path')
const glob = require('glob')

glob.sync(join(__dirname, '../database/', '**/*.js')).forEach(require)

mongoose.Promise = global.Promise

mongoose.set('useCreateIndex', true)

const db = 'mongodb://localhost/cnode'

mongoose.connect(db, {useNewUrlParser: true})

mongoose.connection.once('open', async () => {
  console.log(`Connected to mongodb -> ${db}`)
})
