import React from 'react'
import EpinioClient from './API'

function credsChanged(creds, update) {
  return creds.username !== update.username || creds.password !== update.password
}

export function credentialsOK(creds) {
  return creds && creds.username !== '-' && creds.password !== '-'
}

// Credentials will fetch the default user, when props.enabled is true
function Credentials(props) {
  React.useEffect(() => {
    const epinioClient = EpinioClient({ apiDomain: props.domain })

    const login = async () => {
      let u = { username: '-', password: '-' }

      try {
        await epinioClient.login('admin', 'password')
        u = { username: 'admin', password: 'password' }
      } catch (error) {
        // fail
      }

      if (credsChanged(props.credentials, u)) {
        props.onCredentialsChanged(u)
      }
    }

    const logout = async () => {
      await epinioClient.logout()

      const u = { username: '-', password: '-' }
      if (credsChanged(props.credentials, u)) {
        props.onCredentialsChanged(u)
      }
    }

    if (props.enabled) {
      login()
    } else {
      logout()
    }
  }, [props])

  return null
}

export default Credentials
