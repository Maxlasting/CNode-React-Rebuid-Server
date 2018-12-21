const { prefix, get, post, required } = require('../decorators')
const createApi = require('../utils/create-api.js')
const _createBody = require('../utils/create-body.js')

const createBody = ({ success, data }) => _createBody(
  success,
  success ? 200 : 403 ,
  success ? '' : '接口请求错误！',
  success ? data : null
)

@prefix('/api')
class _cnodeRouter_ {
  @get('/topics')
  @required({
    query: [
      'page',
      'tab'
    ]
  })
  async _getIndexTopicsData_ (ctx) {
    const res = await createApi({
      url: '/topics',
      params: { ...ctx.query, limit: 20 }
    })

    ctx.body = createBody(res)
  }

  @get('/topicDetail')
  @required({
    query: ['topicId']
  })
  async _getTopicDetailData_ (ctx) {
    const { accesstoken = '' } = ctx.session._user_ || {}

    const res = await createApi({
      url: '/topic/' + ctx.query.topicId,
      params: { accesstoken }
    })

    ctx.body = createBody(res)
  }
}

module.exports = _cnodeRouter_
