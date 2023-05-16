import { Buffer } from 'buffer'

export default function EpinioClient({
  apiDomain,
  credentials: {
    username,
    password
  }
}) {
  const info = async () => {
    console.log('EpinioClient.info')
    return doFetch(`http://${apiDomain}/api/v1/info`)
  }

  const listApplications = async (namespace) => {
    console.log('EpinioClient.listApplications')
    return doFetch(`http://${apiDomain}/api/v1/namespaces/${namespace}/applications`)
  }

  const authHeaders = () => {
    const encodedUserPass = Buffer.from(`${username}:${password}`).toString('base64')
    const authHeader = `Basic ${encodedUserPass}`
    const headers = new Headers()
    headers.set('Authorization', authHeader)
    return headers
  }

  const doFetch = async (url) => {
    console.debug('EpinioClient.call', 'executing fetch', url)

    try {
      const resp = await fetch(url, { headers: authHeaders() })
      console.debug('EpinioClient.call', 'response', resp)

      const json = await resp.json()
      console.debug('EpinioClient.call', 'response JSON', json)

      return json
    } catch (error) {
      console.error('EpinioClient.call', error)
      return Error(error)
    }
  }

  return {
    info,
    listApplications
  }
}
