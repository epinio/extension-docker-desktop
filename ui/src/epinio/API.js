import React from "react";
import {sprintf} from "sprintf-js";
import useTraceUpdate from "../tracer.js";
import {credentialsOK} from "./Credentials";
import { Grid, Typography} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import CloudIcon from '@mui/icons-material/Cloud';
import CloudOffIcon from '@mui/icons-material/CloudOff';

function infoChanged(info, update) {
  return info.version !== update.version;
}

export function Info(props) {
  useTraceUpdate(props);
  React.useEffect(() => {
    if (props.enabled && credentialsOK(props.credentials)) {
      const creds = props.credentials;
      const apiURL = sprintf("http://%s:%s@%s/api/v1/info", creds.username, creds.password, props.apiDomain);
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

  const icon = props.info.version === "" ? <CloudOffIcon /> : <CloudIcon />;

  return (
    <Grid container direction="row" alignItems="center" width="20%">
      <Grid item xs={2}>
        {icon}
      </Grid>
      <Grid item xs={4}>
        Epinio: { props.info.version }
      </Grid>
      <Grid item xs={4}>
        Kubernetes: { props.info.kube_version }
      </Grid>
    </Grid>
  );
}

export function Lister(props) {
  const [table, setTable] = React.useState([]);

  React.useEffect(() => {
    if (props.enabled && credentialsOK(props.credentials)) {
      const creds = props.credentials;
      const apiURL = sprintf("http://%s:%s@%s/api/v1/namespaces/workspace/applications", creds.username, creds.password, props.apiDomain);
      console.log("check app list api endpoint");
      window.ddClient.extension.vm.service.get(apiURL).then(
        (value) => {
          console.log(value);
          var t = [];
          for (var i=0; i < value.length; i++) {
            t[i] = {
              id: value[i].meta.name,
              state: value[i].status,
              instances: value[i].configuration.instances,
              dstatus: value[i].deployment.status,
            };
            if (value[i].configuration.routes.length > 0) {
              t[i].route = value[i].configuration.routes[0];
            }
          }
          setTable(t);
        }
      ).catch(
        (error) => {
          console.error(error);
        }
      );
    }
  }, [props.enabled, props.credentials, props.apiDomain, props.appName]);

  const columns = [
    {field: "id", headerName: "Name", width: "160"},
    {field: "state", headerName: "State", sortable: true, width: "80"},
    {field: "instances", headerName: "Instances", type: "number",  width: "80"},
    {field: "route", headerName: "Route", width: "160"},
    {field: "dstatus", headerName: "Info", width: "320"},
  ];

  return (
    <div style={{ height: 300, width: '100%' }}>
    <DataGrid
      rows={table}
      columns={columns}
      pageSize={5}
      rowsPerPageOptions={[5]}
    />
    </div>
  )
}

export default Info;
