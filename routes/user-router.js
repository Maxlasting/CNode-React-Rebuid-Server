const { prefix, get, post, required } = require('../decorators')
const createApi = require('../utils/create-api.js')
const { checkAndGetAccesstoken, saveNewUserDataTodb } = require('../services/user.services.js')
const createBody = require('../utils/create-body.js')

@prefix('/api')
class _userRouter_ {
  @post('/register')
  @required({
    body: [
      'username',
      'password',
      'accesstoken'
    ]
  })
  async _userRegister_ (ctx) {
    const ret = await saveNewUserDataTodb(ctx.request.body)

    if (ret === 'error') return ctx.body = createBody(false, 403, '用户已被注册', {})

    ctx.body = createBody(true, 200, '', ret)
  }

  @post('/login')
  @required({
    body: [
      'username',
      'password'
    ]
  })
  async _userLogin_ (ctx) {
    const check = await checkAndGetAccesstoken(ctx.request.body)

    switch (check) {
      case 'error':
        ctx.body = createBody(false, 401, '用户名或密码错误', null)
        break;

      case 'locked':
        ctx.body = createBody(false, 403, '登陆错误次数过多，请稍后再试！', null)
        break;

      default:
        const { accesstoken, ...data } = check

        const res = await createApi({
          url: '/accesstoken',
          method: 'post',
          data: { accesstoken }
        })

        const { success, ...info } = res

        const retData = createBody(
          success,
          success ? 200 : 403,
          success ? '' : '登陆请求失败！',
          success ? { ...data, ...info } : null
        )

        ctx.session.userData = retData

        ctx.body = retData
    }
  }

  @get('/logout')
  async _userLogout_ (ctx) {
    ctx.session.userData = null
    ctx.body = createBody(true, 200, '', null)
  }

  @get('/checkIfLogin')
  async _checkIfLogin_ (ctx) {
    const check = ctx.session.userData
    ctx.body = createBody(true, 200, check ? '' : '用户未登录', check ? check.data : null)
  }
}

module.exports = _userRouter_
