import React from "react";
import "./App.css";
import { DockerMuiThemeProvider } from '@docker/docker-mui-theme';
import CssBaseline from '@mui/material/CssBaseline';

import KubernetesCheck from "./KubernetesCheck";
import Installer from "./epinio/Installer";
import Credentials from "./epinio/Credentials";
import {credentialsOK} from "./epinio/Credentials";
import {Info,  Lister} from "./epinio/API";
import {infoOK} from "./epinio/API";
import {Pusher} from "./epinio/Pusher";

import Button from "@mui/material/Button";
import {Alert, Modal, BottomNavigation, BottomNavigationAction, Box, Card, CardActions, CardContent, Grid, Paper, Typography} from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInBrowserIcon from '@mui/icons-material/OpenInBrowser';

function Link(props) {
  const open = () => { window.ddClient.host.openExternal(props.url); };
  return <Button startIcon={<OpenInBrowserIcon />} variant="outlined" onClick={open} disabled={props.disabled}>{props.title}</Button>
}

function Opener(props) {
  return (
    <Card sx={{ height: '160px' }}>
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
        <Link url={"https://"+props.uiDomain} title="Open" disabled={props.disabled} />
      </CardActions>
    </Card>
  );
}

function App() {
  const domain = "localdev.me";
  const uiDomain = "epinio.localdev.me";
  const [hasKubernetes, setHasKubernetes] = React.useState(false);
  const [installation, setInstallation] = React.useState(false);
  const [credentials, setCredentials] = React.useState({username: "-", password: "-"});
  const [epinioInfo, setEpinioInfo] = React.useState("-");

  const [error, setError] = React.useState(null);
  const [errorOpen, setErrorOpen] = React.useState(false);
  const handleErrorClose = () => setErrorOpen(false);
  const handleError = (error) => {
    setError(error);
    setErrorOpen(true);
  }

  const openURL = (e) => {
    window.ddClient.host.openExternal(e.currentTarget.attributes['url'].value);
  };

  const disabled = !hasKubernetes || !credentialsOK(credentials) || !infoOK(epinioInfo);

  return (
    <DockerMuiThemeProvider>
      <CssBaseline />
      <div className="App">

        <div>
        <Modal
          open={errorOpen}
          onClose={handleErrorClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '80%',
              bgcolor: 'background.paper',
              border: '2px solid #000',
              boxShadow: 24,
              p: 4,
            }}
            >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Error
            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 10 }}>
              <Alert severity="error">{error}</Alert>
            </Typography>
          </Box>
        </Modal>
        </div>

        <Credentials enabled={hasKubernetes} credentials={credentials} onCredentialsChanged={setCredentials} installation={installation} />

        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle1" component="div" gutterBottom>
            Epinio - From Source To Deployment
          </Typography>
        </Box>

        <Grid container mt={2} columnSpacing={2}>
          <Grid item xs={8}>
            <Installer domain={domain} enabled={hasKubernetes} onInstallationChanged={setInstallation} onError={handleError}/>
          </Grid>

          <Grid item xs={4}>
            <Opener uiDomain={uiDomain} enabled={hasKubernetes} credentials={credentials} disabled={disabled} />
          </Grid>

          <Grid item xs={12} mt={2}>
            <Card>
              <CardContent>
                <Typography>
                  Applications
                </Typography>
              </CardContent>
              <CardActions>
                <Grid container spacing={2} direction="column">
                  <Pusher apiDomain={uiDomain} enabled={hasKubernetes} credentials={credentials} onError={handleError} list={
                    <Lister apiDomain={uiDomain} enabled={hasKubernetes} credentials={credentials} />
                  } disabled={disabled} />
                </Grid>
              </CardActions>
            </Card>
          </Grid>

        </Grid>

        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <Box sx={{ width: '100%' }}>
            <KubernetesCheck running={hasKubernetes} onEnabledChanged={setHasKubernetes} />
          </Box>

          <BottomNavigation showLabels sx={{gridTemplateColumns: 'repeat(4, 1fr)'}}>
            <Info apiDomain={uiDomain} enabled={hasKubernetes} credentials={credentials} info={epinioInfo} onInfoChanged={setEpinioInfo} />
            <BottomNavigationAction label="epinio.io" icon={<HomeIcon />} onClick={openURL} url="https://epinio.io" />
            <BottomNavigationAction label="CLI" icon={<DownloadIcon />} onClick={openURL} url="https://github.com/epinio/epinio/releases/tag/v1.4.0" />
          </BottomNavigation>
        </Paper>

      </div>
    </DockerMuiThemeProvider>
  );
}

export default App;
