import React from "react";
import useTraceUpdate from "../tracer.js";

function credsChanged(creds, update) {
  return creds.username !== update.username || creds.password !== update.password;
}

export function credentialsOK(creds) {
  return creds && creds.username !== "" && creds.password !== "";
}

// Credentials will fetch the default user, when props.enabled is true
function Credentials(props) {
  useTraceUpdate(props);
  React.useEffect(() => {
    const getCredentials = async () => {
      try {
        const result = await window.ddClient.extension.host.cli.exec(
          "kubectl",
          ["get", "secret", "-n", "epinio", "default-epinio-user", "-o", "jsonpath={.data}"]
        );
        const obj = result.parseJsonObject();
        const u = {username: atob(obj.username), password: atob(obj.password)};
        if (credsChanged(props.credentials, u)) {
          props.onCredentialsChanged(u);
        }
      } catch (error) {
        if (error instanceof Error) {
          console.error(error);
        } else {
          console.log(JSON.stringify(error));
        }
        const u = {username: "-", password: "-"};
        if (credsChanged(props.credentials, u)) {
          props.onCredentialsChanged(u);
        }
      }
    };
    if (props.enabled) {
      console.log("get credentials");
      getCredentials()
    }
  }, [props]);

  return null;
}

export default Credentials;
