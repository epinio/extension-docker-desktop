import React from "react";
import {sprintf} from "sprintf-js";
import useTraceUpdate from "../tracer.js";
import {Card, CardContent, Typography} from "@mui/material";
import {credentialsOK} from "./Credentials";

function infoChanged(info, update) {
  return info.version !== update.version;
}

function Info(props) {
  useTraceUpdate(props);
  React.useEffect(() => {
    if (props.enabled && credentialsOK(props.credentials)) {
      const creds = props.credentials;
      const apiURL = sprintf("http://%s:%s@%s/api/v1/info", creds.username, creds.password, props.epiDomain);
      console.log("check info api endpoint");
      window.ddClient.extension.vm.service.get(apiURL).then(
        (value) => {
          const u = {version: value.version, kube_version: value.kube_version};
          if (infoChanged(props.info, u)) {
            props.onInfoChanged(u);
          }
        }
      ).catch(
        (error) => {
          console.error(error);
          const u = {version: "-", kube_version: "-"};
          if (infoChanged(props.info, u)) {
            props.onInfoChanged(u);
          }
        }
      );
    }
  }, [props]);

  const msg = props.info.version === "" ? "Not Connected" : "Connected";

  return (
    <Card>
      <CardContent>
        <Typography>
        {msg}
        </Typography>
        <br/>
        <Typography variant="body2" align="left">
          Epinio: { props.info.version } <br/>
          Kubernetes: { props.info.kube_version }
        </Typography>
      </CardContent>
    </Card>
  );
}

export default Info;
