const axios = require('axios')
const qs = require('querystringify')

const request = axios.create({
  headers: {'Content-Type': 'application/x-www-form-urlencoded'}
})

const createRequest = request => new Promise((resolve, reject) => (
  request.then(res => resolve(res.data)).catch(err => reject(err))
))

const createApi = async (options) => {
  const { url, method = 'get', params = {}, data = {} } = options

  const ret = await createRequest(
    request({
      url: 'https://cnodejs.org/api/v1' + url,
      method,
      params,
      data: qs.stringify(data)
    })
  )

  return ret
}

module.exports = createApi
