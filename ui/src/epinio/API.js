export default function EpinioClient({
  apiDomain
}) {
  const login = async (username, password) => {
    console.info('EpinioClient.login')

    await epinio([
      'login', '-u', username, '-p', password, '--trust-ca', `epinio.${apiDomain}`
    ])
  }

  const logout = async () => {
    console.info('EpinioClient.logout')

    await epinio(['logout'])
  }

  const info = async () => {
    console.log('EpinioClient.info')

    // TODO: update with '--output json' flag
    const result = await epinio(['info'])
    const lines = result.split('\n')

    for (const i in lines) {
      if (lines[i].indexOf('Epinio Server Version: ') === 0) {
        const version = lines[i].replace('Epinio Server Version: ', '')
        return { version }
      }
    }

    return { version: 'unknown' }
  }

  const listApplications = async (namespace) => {
    console.log('EpinioClient.listApplications')

    const result = await epinio([
      'app', 'list', '--output', 'json'
    ])

    return JSON.parse(result)
  }

  const epinio = async (args) => {
    try {
      const result = await window.ddClient.extension.host.cli.exec('epinio', args)
      return result.stdout
    } catch (error) {
      if (error.stderr) {
        throw Error(error.stderr)
      }
      throw error
    }
  }

  return {
    login,
    logout,
    info,
    listApplications
  }
}
