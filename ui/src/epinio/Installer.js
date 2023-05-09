import React, { useState } from 'react'
import { Delete as DeleteIcon, InstallDesktop as InstallDesktopIcon } from '@mui/icons-material'
import { Box, Button, Card, CardActions, CardContent, CircularProgress, LinearProgress, Typography } from '@mui/material'

export default function EpinioInstaller({
  hasKubernetes,
  domain,
  onInstallationChanged,
  onError
}) {
  const [progress, setProgress] = useState(0)
  const [installed, setInstalled] = useState(null)

  const helm = async (args) => {
    const result = await window.ddClient.extension.host.cli.exec('helm', args)
    console.debug(JSON.stringify(result))

    if (result.stderr) {
      throw Error(result?.stderr)
    }

    console.debug(result?.stdout)
  }

  const isEpinioInstalled = async () => {
    console.debug('checking if Epinio is already installed')

    try {
      await helm(['status', '--namespace', 'epinio', 'epinio'])
      setInstalled(true)
    } catch (error) {
      setInstalled(false)
    }
  }

  async function install() {
    try {
      await installNginx()
      await installCertManager()
      await installEpinio()

      setInstalled(true)
      onInstallationChanged(true)
    } catch (error) {
      setInstalled(false)
      onInstallationChanged(false)

      console.error(error)
      const message = `If the nginx service is stuck in pending state, you might need to restart docker desktop. \n ${JSON.stringify(error)}`
      onError(message)
    } finally {
      setProgress(0)
    }
  }

  async function uninstall() {
    try {
      await uninstallEpinio()
      await uninstallCertManager()
      await uninstallNginx()

      setInstalled(false)
      onInstallationChanged(true)
    } catch (error) {
      onInstallationChanged(false)
      console.error(error)
      onError(msg)
    } finally {
      setProgress(0)
    }
  }

  const installNginx = async () => {
    console.log('installing nginx chart')
    setProgress(10)

    await helm([
      'upgrade', '--install', '--atomic', 'ingress-nginx',
      '--create-namespace', '--namespace', 'ingress-nginx',
      'https://github.com/kubernetes/ingress-nginx/releases/download/helm-chart-4.3.0/ingress-nginx-4.3.0.tgz'
    ])

    // https://github.com/docker/for-mac/issues/4903
    console.log('installed: nginx')
    console.log("you might need to restart docker-desktop if localhost:443 doesn't forward to nginx")
    setProgress(25)
  }

  const installCertManager = async () => {
    console.log('installing cert-manager chart')
    setProgress(30)

    await helm([
      'upgrade', '--install', '--atomic', 'cert-manager',
      '--create-namespace', '--namespace', 'cert-manager',
      '--set', 'installCRDs=true',
      '--set', 'extraArgs[0]=--enable-certificate-owner-ref=true',
      'https://charts.jetstack.io/charts/cert-manager-v1.9.1.tgz'
    ])

    console.log('installed: cert-manager')
    setProgress(50)
  }

  const installEpinio = async () => {
    console.log('installing epinio chart')
    setProgress(55)

    await helm([
      'upgrade', '--install', 'epinio',
      '--create-namespace', '--namespace', 'epinio',
      '--atomic',
      '--set', 'global.domain=' + domain,
      '--set', 'ingress.ingressClassName=nginx',
      '--set', 'ingress.nginxSSLRedirect=false',
      'https://github.com/epinio/helm-charts/releases/download/epinio-1.8.0/epinio-1.8.0.tgz'
    ])

    console.log('installed: epinio')
    setProgress(100)
  }

  const uninstallEpinio = async () => {
    console.log('uninstalling epinio chart')
    setProgress(10)

    await helm([
      'uninstall', '--namespace', 'epinio',
      '--wait', 'epinio'
    ])

    console.log('uninstalled: epinio')
    setProgress(25)
  }

  const uninstallCertManager = async () => {
    console.log('uninstalling cert-manager chart')
    setProgress(30)

    await helm([
      'uninstall', '--namespace', 'cert-manager',
      '--wait', 'cert-manager'
    ])

    console.log('uninstalled: cert-manager')
    setProgress(50)
  }

  const uninstallNginx = async () => {
    console.log('uninstalling nginx chart')
    setProgress(75)

    await helm([
      'uninstall', '--namespace', 'ingress-nginx',
      '--wait', 'ingress-nginx'
    ])

    console.log('uninstalled: nginx')
    setProgress(100)
  }

  if (installed === null) {
    isEpinioInstalled()
  }

  // TODO install is idempotent, but maybe also detect working installation?
  const isLoading = progress !== 100 && progress !== 0

  return (
    <Card sx={{ height: '160px' }}>
      <CardContent>
        <Typography>
          Install Epinio in Kubernetes
        </Typography>
        <br/>
        <Typography variant="body2" align="left">
        The Application Development Engine for Kubernetes.
        Epinio uses build packs to create container images from source code.
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          startIcon={<InstallDesktopIcon/>}
          variant="contained"
          onClick={install}
          // install button is disabled if kubernetes not available or Epinio already installed
          disabled={!!installed || isLoading || !hasKubernetes} >
          Install/Upgrade
        </Button>
        <Button
          startIcon={<DeleteIcon/>}
          variant="contained"
          onClick={uninstall}
          // uninstall button is disabled if Epinio is not installed
          disabled={!installed || isLoading}
          color="secondary" >
          Uninstall
        </Button>
        {isLoading && <CircularProgress style={{ width: '20px', height: '20px', marginLeft: '10px' }} />}
      </CardActions>
      <Box sx={{ width: '100%' }}>
        {isLoading && <LinearProgress variant="determinate" value={progress} />}
      </Box>
    </Card>
  )
}
