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
import {BottomNavigation, BottomNavigationAction, Box, Card, CardActions, CardContent, Grid, Paper, Typography} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import DownloadIcon from '@mui/icons-material/Download';

function Link(props) {
  const open = () => { window.ddClient.host.openExternal(props.url); };
  return <Button onClick={open} disabled={props.disabled}>{props.title}</Button>
}

function infoOK(info) {
  return info && info.version !== "" && info.version !== "-";
}

function Opener(props) {
  const disabled = !props.enabled || !credentialsOK(props.credentials) || !infoOK(props.info);
  return (
    <Card>
      <CardContent>
        <Typography>
          Open the Epinio UI in a browser.
        </Typography>
        <br/>
        <Typography variant="body2" align="left">
          User: {props.credentials.username} <br/>
          Password: {props.credentials.password} <br/>
        </Typography>
      </CardContent>
      <CardActions>
        <Link url={"https://"+props.uiDomain} title="Open" disabled={disabled} />
      </CardActions>
    </Card>
  );
}

function App() {
  const domain = "localdev.me";
  const uiDomain = "epinio.localdev.me";
  const [enabled, setEnabled] = React.useState(false);
  const [installation, setInstallation] = React.useState(false);
  const [credentials, setCredentials] = React.useState({username: "", password: ""});
  const [info, setInfo] = React.useState({version: "-", kube_version: "-"});

  const open = (e) => {
    window.ddClient.host.openExternal(e.currentTarget.attributes['url'].value);
  };

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
          <KubernetesCheck running={enabled} onEnabledChanged={setEnabled} />
          <BottomNavigation showLabels>
            <BottomNavigationAction label="epinio.io" icon={<HomeIcon />} onClick={open} url="https://epinio.io" />
            <BottomNavigationAction label="CLI" icon={<DownloadIcon />} onClick={open} url="https://github.com/epinio/epinio/releases" />
          </BottomNavigation>
        </Paper>

      </div>
    </DockerMuiThemeProvider>
  );
}

export default App;
