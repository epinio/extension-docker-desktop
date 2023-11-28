export default function EpinioClient({
  apiDomain,
  credentials: {
    username,
    password
  }
}) {
  const login = async (username, password) => {
    console.info('EpinioClient.login')

    try {
      await epinio([
        'login', '--trust-ca', '-u', username, '-p', password, `${apiDomain}`
      ])
      console.info('EpinioClient.login OK')
    } catch (error) {
      console.error('EpinioClient.login', error)
      throw error
    }
  }

  const info = async () => {
    console.log('EpinioClient.info')

    try {
      const result = await epinio(['info'])
      console.info('EpinioClient.info OK', result)

      // TODO parse info to get version
      return { version: 'v1.11.0-rc1' }
    } catch (error) {
      console.error('EpinioClient.info', error)
      throw error
    }
  }

  const listApplications = async (namespace) => {
    console.log('EpinioClient.listApplications')

    try {
      const result = await epinio([
        'app', 'list', '--output', 'json'
      ])
      console.info('EpinioClient.listApplications OK', result)
      return JSON.parse(result)
    } catch (error) {
      console.error('EpinioClient.listApplications', error)
      throw error
    }
  }

  const epinio = async (args) => {
    try {
      const result = await window.ddClient.extension.host.cli.exec('epinio', args)
      return result.stdout
    } catch (error) {
      console.error(error)

      if (error.stderr) {
        throw Error(error.stderr)
      }
      throw error
    }
  }

  return {
    login,
    info,
    listApplications
  }
}
