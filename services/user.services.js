const mongoose = require('mongoose')
const UserModel = mongoose.model('user')

const saveNewUserDataTodb = async ({username, password, accesstoken}) => {
  const query = {
    $or: [{username}, {accesstoken}]
  }

  const target = await UserModel.findOne(query)

  if (target) return 'error'

  const user = new UserModel({
    username,
    password,
    accesstoken
  })

  await user.save()

  return user.meta
}

const checkAndGetAccesstoken = async ({username, password}) => {
  const user = await UserModel.findOne({ username })

  if (!user) return 'error'

  // 对比密码信息
  const match = await user.comparePassword(password, user.password)

  if (!match) {
    await user.incLoginAttempts()
    return 'error'
  }

  if (user.lockStatus) return 'locked'

  const { accesstoken, lastLoginTime, userId, meta } = user
  user.lastLoginTime = Date.now()
  await user.save()

  return { accesstoken, lastLoginTime, userId, meta }
}

module.exports = {
  checkAndGetAccesstoken,
  saveNewUserDataTodb
}
