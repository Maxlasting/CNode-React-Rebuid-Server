const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')

const SALT_WORK_FACTOR = 10
const MAX_LOGIN_ATTEMPTS = 5
const LOCKED_DURATIONS = 10 * 1000

const userSchema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  accesstoken: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: Number,
    unique: true
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Number,
    default: 0
  },
  lastLoginTime: {
    type: Number,
    default: 0
  },
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})

userSchema.virtual('lockStatus').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now())
})

const idSchema = new Schema({
  _id: {
    type: String,
    default: '__max__'
  },
  uid: {
    type: Number,
    default: -1
  }
})

const Counter = mongoose.model('userId', idSchema)

userSchema.pre('save', async function (next) {
  let counter = await Counter.findById('__max__')

  if (!counter) counter = await Counter.create({})

  counter.uid++

  this.userId = counter.uid

  await counter.save()
  next()
})

userSchema.pre('save', function (next) {
  const now = Date.now()
  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = now
  } else {
    this.meta.updateAt = now
  }
  next()
})

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) throw err

    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) throw err
      this.password = hash
      next()
    })
  })
})

userSchema.methods = {
  comparePassword: (password, hash) => new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, isMatch) => {
      if (err) {
        reject(err)
      } else {
        resolve(isMatch)
      }
    })
  }),

  incLoginAttempts() {
    return new Promise((resolve, reject) => {
      if (this.lockUntil && this.lockUntil < Date.now()) {
        this.updateOne({
          $set: { loginAttempts: 1 },
          $unset: { lockUntil: 1 }
        }, (err) => {
          if (err) return reject(err)
          resolve()
        })
      } else {
        const update = {
          $inc: { loginAttempts: 1 }
        }
        if (this.loginAttempts + 1 > MAX_LOGIN_ATTEMPTS && !this.lockStatus) {
          update.$set = {
            lockUntil: Date.now() + LOCKED_DURATIONS
          }
        }
        this.updateOne(update, (err) => {
          if (err) return reject(err)
          resolve()
        })
      }
    })
  }
}

mongoose.model('user', userSchema)

