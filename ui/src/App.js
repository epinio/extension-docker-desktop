import React from "react";
import "./App.css";
import KubernetesCheck from "./KubernetesCheck";
import Installer from "./Installer";
import { DockerMuiThemeProvider } from '@docker/docker-mui-theme';
import CssBaseline from '@mui/material/CssBaseline';
import Button from "@mui/material/Button";
import {BottomNavigation, Box, Card, CardActions, CardContent, Grid, Paper, Typography} from "@mui/material";
import {sprintf} from "sprintf-js";

function useTraceUpdate(props) {
  const prev = React.useRef(props);
  React.useEffect(() => {
    const changedProps = Object.entries(props).reduce((ps, [k, v]) => {
      if (prev.current[k] !== v) {
        ps[k] = [prev.current[k], v];
      }
      return ps;
    }, {});
    if (Object.keys(changedProps).length > 0) {
      console.log('Changed props:', changedProps);
    }
    prev.current = props;
  });
}

function credentialsOK(creds) {
  return creds && creds.username !== "" && creds.password !== "";
}

// EpinioCredentials will fetch the default user, when props.enabled is true
function EpinioCredentials(props) {
  useTraceUpdate(props);
  React.useEffect(() => {
    const getCredentials = async () => {
      try {
        const result = await window.ddClient.extension.host.cli.exec(
          "kubectl",
          ["get", "secret", "-n", "epinio", "default-epinio-user", "-o", "jsonpath='{.data}'"]
        )
        const obj = result.parseJsonObject();
        const creds = props.credentials;
        creds.username = atob(obj.username);
        creds.password = atob(obj.password);
        props.onCredentialsChanged(creds);

      } catch (error) {
        if (error instanceof Error) {
          console.error(error);
        } else {
          console.log(JSON.stringify(error));
        }
        const creds = props.credentials;
        creds.username = "-";
        creds.password = "-";
        props.onCredentialsChanged(creds);
      }
    };
    if (props.enabled) {
      getCredentials()
    }
  }, [props]);

  return null;
}

function infoOK(info) {
  return info && info.version !== "" && info.version !== "-";
}

function Info(props) {
  useTraceUpdate(props);
  React.useEffect(() => {
    if (props.enabled && credentialsOK(props.credentials)) {
      const creds = props.credentials;
      const apiURL = sprintf("http://%s:%s@%s/api/v1/info", creds.username, creds.password, props.epiDomain);
      window.ddClient.extension.vm.service.get(apiURL).then(
        (value) => {
          const info = props.info;
          info.version = value.version;
          info.kube_version = value.kube_version;
          props.onInfoChanged(info);
        }
      ).catch(
        (error) => {
          console.error(apiURL);
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

class Opener extends React.Component {
  constructor(props) {
    super(props);
    this.open = this.open.bind(this);
  }

  async open() {
    window.ddClient.host.openExternal("http://" + this.props.uiDomain);
  }

  render() {
    const disabled = !this.props.enabled || !credentialsOK(this.props.credentials) || !infoOK(this.props.info);
    return (
      <Card>
        <CardContent>
          <Typography>
            Open the Epinio UI in a browser.
          </Typography>
          <br/>
          <Typography variant="body2" align="left">
            User: {this.props.credentials.username} <br/>
            Password: {this.props.credentials.password} <br/>
          </Typography>
        </CardContent>
        <CardActions>
          <Button onClick={this.open} disabled={disabled}>
            Open
          </Button>
        </CardActions>
      </Card>
    );
  }
}

function App() {
  const domain = "localdev.me";
  const uiDomain = "epinio.localdev.me";
  const [enabled, setEnabled] = React.useState(false);
  const [credentials, setCredentials] = React.useState({username: "", password: ""});
  const [info, setInfo] = React.useState({version: "-", kube_version: "-"});

  return (
    <DockerMuiThemeProvider>
      <CssBaseline />
      <div className="App">

        <EpinioCredentials enabled={enabled} credentials={credentials} onCredentialsChanged={setCredentials} />

        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle1" component="div" gutterBottom>
            Epinio - From Source To Deployment
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Installer domain={domain} enabled={enabled} />
          </Grid>

          <Grid item xs={4}>
            <Info epiDomain={uiDomain} enabled={enabled} credentials={credentials} info={info} onInfoChanged={setInfo} />
          </Grid>

          <Grid item xs={4}>
            <Opener uiDomain={uiDomain} enabled={enabled} credentials={credentials} info={info} />
          </Grid>
        </Grid>

        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation>
            <KubernetesCheck running={enabled} onEnabledChanged={setEnabled} />
          </BottomNavigation>
        </Paper>

      </div>
    </DockerMuiThemeProvider>
  );
}

export default App;
