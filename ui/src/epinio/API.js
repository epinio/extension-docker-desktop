import React from "react";
import {sprintf} from "sprintf-js";
import useTraceUpdate from "../tracer.js";
import {Card, CardContent, Typography} from "@mui/material";
import {credentialsOK} from "./Credentials";

function Info(props) {
  useTraceUpdate(props);
  React.useEffect(() => {
    if (props.enabled && credentialsOK(props.credentials)) {
      const creds = props.credentials;
      const apiURL = sprintf("http://%s:%s@%s/api/v1/info", creds.username, creds.password, props.epiDomain);
      console.log("check info api endpoint");
      window.ddClient.extension.vm.service.get(apiURL).then(
        (value) => {
          const info = props.info;
          info.version = value.version;
          info.kube_version = value.kube_version;
          props.onInfoChanged(info);
        }
      ).catch(
        (error) => {
          console.error(error);
          const info = props.info;
          info.version = "-";
          info.kube_version = "-";
          props.onInfoChanged(info);
        }
      );
    }
  }, [props]);

  return (
    <Card>
      <CardContent>
        <Typography>
          Info
        </Typography>
        <Typography variant="body2">
          <a href="https://epinio.io">Homepage</a> | <a href="https://github.com/epinio/epinio/releases">CLI download</a>
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
