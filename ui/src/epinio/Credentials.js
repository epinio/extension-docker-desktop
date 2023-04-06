import React from 'react'

function credsChanged(creds, update) {
  return creds.username !== update.username || creds.password !== update.password
}

export function credentialsOK(creds) {
  return creds && creds.username !== "-" && creds.password !== "-"
}

// Credentials will fetch the default user, when props.enabled is true
function Credentials(props) {
  React.useEffect(() => {
    const getCredentials = async () => {
      try {
        // note: `-l` returns a list, hence the `.items...`, even if only a single secret matches
        const result = await window.ddClient.extension.host.cli.exec(
          "kubectl",
          ["get", "secret", "-n", "epinio", "-l", "epinio.io/role=admin", "-o", "jsonpath={.items[0].data}"]
        )
        result.parseJsonObject()
        // Retrieval above as check that epinio is present.
        // Creds hardwired, unchanged from defaults
        const u = { username: "admin", password: "password" }
        if (credsChanged(props.credentials, u)) {
          props.onCredentialsChanged(u)
        }
      } catch (error) {
        // for debugging:
        // if (error instanceof Error) {
        //   console.error(error);
        // } else {
        //   console.log(JSON.stringify(error));
        // }
        const u = { username: "-", password: "-" }
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
