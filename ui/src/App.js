import React from "react";
import "./App.css";
import KubernetesCheck from "./KubernetesCheck";
import Installer from "./epinio/Installer";
import Credentials from "./epinio/Credentials";
import {credentialsOK} from "./epinio/Credentials";
import Info from "./epinio/API";
import { DockerMuiThemeProvider } from '@docker/docker-mui-theme';
import CssBaseline from '@mui/material/CssBaseline';
import Button from "@mui/material/Button";
import {BottomNavigation, Box, Card, CardActions, CardContent, Grid, Paper, Typography} from "@mui/material";

function infoOK(info) {
  return info && info.version !== "" && info.version !== "-";
}

class Opener extends React.Component {
  constructor(props) {
    super(props);
    this.open = this.open.bind(this);
  }

  async open() {
    window.ddClient.host.openExternal("https://" + this.props.uiDomain);
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
  const [installation, setInstallation] = React.useState(false);
  const [credentials, setCredentials] = React.useState({username: "", password: ""});
  const [info, setInfo] = React.useState({version: "-", kube_version: "-"});

  return (
    <DockerMuiThemeProvider>
      <CssBaseline />
      <div className="App">

        <Credentials enabled={enabled} credentials={credentials} onCredentialsChanged={setCredentials} installation={installation} />

        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle1" component="div" gutterBottom>
            Epinio - From Source To Deployment
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Installer domain={domain} enabled={enabled} onInstallationChanged={setInstallation}/>
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
