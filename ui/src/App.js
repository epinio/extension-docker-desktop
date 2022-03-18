import React from "react";
import "./App.css";
import KubernetesCheck from "./KubernetesCheck";
import Installer from "./Installer";
import { DockerMuiThemeProvider } from '@docker/docker-mui-theme';
import CssBaseline from '@mui/material/CssBaseline';
import Button from "@mui/material/Button";
import {BottomNavigation, Box, Card, CardActions, CardContent, Grid, Paper, Typography} from "@mui/material";

class Info extends React.Component {
  constructor(props) {
    super(props);
    this.state = {version: "", kube_version: ""};
  }

  componentDidMount() {
    window.ddClient.extension.vm.service.get(this.props.url + "/api/v1/info").then((value) => this.setState(value))
  }

  render() {
    const disabled = !this.props.enabled;
    return (
      <Card>
        <CardContent>
          <Typography>
            Info
          </Typography>
          <br/>
          <Typography variant="body2" align="left">
            Epinio: { this.state.version } <br/>
            Kubernetes: { this.state.kube_version }
          </Typography>
        </CardContent>
      </Card>
    );
  }
}
class Opener extends React.Component {
  constructor(props) {
    super(props);
    this.state = {username: "", password: ""};
    this.open = this.open.bind(this);
  }

  componentDidMount() {
    this.getCredentials();
  }

  // TODO move state up
  async getCredentials() {
    try {
      const result = await window.ddClient.extension.host.cli.exec(
        "kubectl",
        ["get", "secret", "-n", "epinio", "default-epinio-user", "-o", "jsonpath='{.data}'"]
      )
      const obj = result.parseJsonObject();
      console.debug(obj);
      this.setState({username: atob(obj.username), password: atob(obj.password)});

    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
      } else {
        console.log(JSON.stringify(error));
      }
      this.setState({username: "", password: ""});
    }
  }

  async open() {
    await this.getCredentials();
    window.ddClient.host.openExternal("https://" + this.props.domain);
  }

  render() {
    const disabled = !this.props.enabled;
    return (
      <Card>
        <CardContent>
          <Typography>
            Open the Epinio UI in a browser.
          </Typography>
          <br/>
          <Typography variant="body2" align="left">
            User: {this.state.username} <br/>
            Password: {this.state.password} <br/>
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
  const uiDomain = "ui.localdev.me";
  // TODO get admin:password
  const apiURL = "http://admin:password@epinio.localdev.me";
  const [enabled, setEnabled] = React.useState("");

  return (
    <DockerMuiThemeProvider>
      <CssBaseline />
      <div className="App">

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
            <Info url={apiURL} enabled={enabled} key={enabled} />
          </Grid>

          <Grid item xs={4}>
            <Opener domain={uiDomain} enabled={enabled} key={enabled} />
          </Grid>
        </Grid>

        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation>
            <KubernetesCheck onEnabledChanged={setEnabled} />
          </BottomNavigation>
        </Paper>

      </div>
    </DockerMuiThemeProvider>
  );
}

export default App;
