import React from 'react'

export function credentialsOK(creds) {
  return creds && creds.username !== '-' && creds.password !== '-'
}

// Credentials will fetch the default user, when props.enabled is true
function Credentials(props) {
  React.useEffect(() => {
    const getCredentials = async () => {
      // TODO: hardcoded user
      props.onCredentialsChanged({ username: 'admin', password: 'password' })
    }
    if (props.enabled) {
      getCredentials()
    }
  }, [props])

  return null
}

export default Credentials
