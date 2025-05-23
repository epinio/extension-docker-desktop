import React, { useState } from 'react'
import { DockerMuiThemeProvider } from '@docker/docker-mui-theme'
import { Home as HomeIcon, Download as DownloadIcon, OpenInBrowser as OpenInBrowserIcon } from '@mui/icons-material'
import {
  Alert, Button, CssBaseline, Modal, BottomNavigation, BottomNavigationAction, Box,
  Card, CardActions, CardContent, Grid, Paper, Typography
} from '@mui/material'
import Installer from './epinio/Installer'
import Credentials, { credentialsOK } from './epinio/Credentials'
import { Info, infoOK } from './epinio/Info'
import KubernetesCheck from './KubernetesCheck'
import './App.css'
import Applications from './epinio/Applications'

function Link(props) {
  const open = () => { window.ddClient.host.openExternal(props.url) }
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
        <Link url={'https://' + props.uiDomain} title="Open" disabled={props.disabled} />
      </CardActions>
    </Card>
  )
}

function App() {
  const domain = 'localtest.me'
  const uiDomain = 'epinio.localtest.me'
  const [hasKubernetes, setHasKubernetes] = useState(false)
  const [installation, setInstallation] = useState(false)
  const [credentials, setCredentials] = useState({ username: '-', password: '-' })
  const [epinioInfo, setEpinioInfo] = useState('-')

  const [error, setError] = useState(null)
  const [errorOpen, setErrorOpen] = useState(false)
  const handleErrorClose = () => setErrorOpen(false)
  const handleError = (error) => {
    setError(error)
    setErrorOpen(true)
  }

  const openURL = (e) => {
    window.ddClient.host.openExternal(e.currentTarget.attributes.url.value)
  }

  const disabled = !hasKubernetes || !credentialsOK(credentials) || !infoOK(epinioInfo)

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
              p: 4
            }}
            >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Error
            </Typography>
            <Typography component={'span'} id="modal-modal-description" sx={{ mt: 10 }}>
              <Alert severity="error">{error}</Alert>
            </Typography>
          </Box>
        </Modal>
        </div>

        <Credentials
          enabled={hasKubernetes}
          credentials={credentials}
          onCredentialsChanged={setCredentials}
          installation={installation}
          domain={domain} />

        <Box sx={{ width: '100%' }}>
          <Typography variant="subtitle1" component="div" gutterBottom>
            Epinio - From Source To Deployment
          </Typography>
        </Box>

        <Grid container mt={2} columnSpacing={2}>
          <Grid item xs={8}>
            <Installer
              domain={domain}
              hasKubernetes={hasKubernetes}
              onInstallationChanged={setInstallation}
              onError={handleError} />
          </Grid>

          <Grid item xs={4}>
            <Opener uiDomain={uiDomain} enabled={hasKubernetes} credentials={credentials} disabled={disabled} />
          </Grid>

          <Grid item xs={12} mt={2}>
            <Applications
              uiDomain={uiDomain}
              enabled={hasKubernetes}
              credentials={credentials}
              disabled={disabled}
              onError={handleError} />
          </Grid>

        </Grid>

        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <Box sx={{ width: '100%' }}>
            <KubernetesCheck running={hasKubernetes} onEnabledChanged={setHasKubernetes} />
          </Box>

          <BottomNavigation showLabels sx={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
            <Info apiDomain={uiDomain} enabled={hasKubernetes} credentials={credentials} info={epinioInfo} onInfoChanged={setEpinioInfo} />
            <BottomNavigationAction label="epinio.io" icon={<HomeIcon />} onClick={openURL} url="https://epinio.io" />
            <BottomNavigationAction label="CLI" icon={<DownloadIcon />} onClick={openURL} url="https://github.com/epinio/epinio/releases/tag/v1.11.0" />
          </BottomNavigation>
        </Paper>

      </div>
    </DockerMuiThemeProvider>
  )
}

export default App
