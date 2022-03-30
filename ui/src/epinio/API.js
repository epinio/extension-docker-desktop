import React from "react";
import {sprintf} from "sprintf-js";
import {credentialsOK} from "./Credentials";
import { Grid } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import CloudIcon from '@mui/icons-material/Cloud';
import CloudOffIcon from '@mui/icons-material/CloudOff';

function infoChanged(info, update) {
  return info.version !== update.version;
}

export function infoOK(info) {
  return info && info.version !== "" && info.version !== "-";
}

export function Info(props) {
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
      <Grid item xs={1}>
        {icon}
      </Grid>
      <Grid item xs={4}>
        Epinio: { props.info.version }
      </Grid>
      <Grid item xs={5}>
        Kubernetes: { props.info.kube_version }
      </Grid>
    </Grid>
  );
}

export class Lister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {table: []};
  }

  componentDidMount() {
    this.list();
    this.timerID = setInterval(
      () => this.list(),
      15000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  list() {
    if (this.props.enabled && credentialsOK(this.props.credentials)) {
      const creds = this.props.credentials;
      const apiURL = sprintf("http://%s:%s@%s/api/v1/namespaces/workspace/applications", creds.username, creds.password, this.props.apiDomain);
      console.log("check app list api endpoint");
      window.ddClient.extension.vm.service.get(apiURL).then(
        (value) => {
          console.log(value);
          var t = [];
          for (var i = 0; i < value.length; i++) {
            t[i] = {
              id: value[i].meta.name,
              state: value[i].status,
              instances: value[i].configuration.instances,
            };
            if (value[i].deployment) {
              t[i].status = value[i].deployment.status;
            }
            if (value[i].configuration.routes.length > 0) {
              t[i].route = value[i].configuration.routes[0];
            }
          }
          this.setState({table: t});
        }
      ).catch(
        (error) => {
          console.error(error);
          this.setState({table: []});
        }
      );
    }
  }

  render() {
    const columns = [
      {field: "id", headerName: "Name", width: "160"},
      {field: "state", headerName: "State", sortable: true, width: "80"},
      {field: "instances", headerName: "Instances", type: "number", width: "80"},
      {field: "route", headerName: "Route", width: "160"},
      {field: "dstatus", headerName: "Info", width: "320"},
    ];

    return (
      <div style={{height: 300, width: '100%'}}>
        <DataGrid
          rows={this.state.table}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </div>
    )
  }
}

export default Info;
