import React from 'react'

function credsChanged(creds, update) {
  return creds.username !== update.username || creds.password !== update.password
}

export function credentialsOK(creds) {
  return creds && creds.username !== '-' && creds.password !== '-'
}

// Credentials will fetch the default user, when props.enabled is true
function Credentials(props) {
  React.useEffect(() => {
    const getCredentials = async () => {
      try {
        await epinioClient.login('admin', 'password')
        const u = { username: 'admin', password: 'password' }
        if (credsChanged(props.credentials, u)) {
          props.onCredentialsChanged(u)
        }
      } catch (error) {
        const u = { username: '-', password: '-' }
        if (credsChanged(props.credentials, u)) {
          props.onCredentialsChanged(u)
        }
      }
    }
    if (props.enabled) {
      getCredentials()
    }
  }, [props])

  return null
}

export default Credentials
