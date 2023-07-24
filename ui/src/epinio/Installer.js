import React, { useEffect, useState } from 'react'
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
    return result?.stdout
  }

  const isEpinioInstalled = async () => {
    console.debug('check Epinio installation')

    try {
      const result = await helm(['status', '--namespace', 'epinio', 'epinio'])

      // if the release is uninstalling we are in a "pending" state
      if (result.includes('STATUS: uninstalling')) {
        console.debug('uninstalling epinio release')

        setInstalled(null)
      } else {
        setInstalled(true)
      }
    } catch (error) {
      setInstalled(false)
    }
  }

  const checkEpinioStatus = async () => {
    isEpinioInstalled()
    setInterval(async () => {
      await isEpinioInstalled()
    }, 3000)
  }

  async function install() {
    try {
      setProgress(10)
      await installNginx()
      setProgress(25)

      setProgress(30)
      await installCertManager()
      setProgress(50)

      setProgress(60)
      await installEpinio()
      setProgress(100)

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
      setProgress(10)
      await uninstallEpinio()
      setProgress(25)

      setProgress(30)
      await uninstallCertManager()
      setProgress(50)

      setProgress(75)
      await uninstallNginx()
      setProgress(100)

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

    await helm([
      'upgrade', '--install', '--atomic', 'ingress-nginx',
      '--create-namespace', '--namespace', 'ingress-nginx',
      'https://github.com/kubernetes/ingress-nginx/releases/download/helm-chart-4.7.1/ingress-nginx-4.7.1.tgz'
    ])

    // https://github.com/docker/for-mac/issues/4903
    console.log('installed: nginx')
    console.log("you might need to restart docker-desktop if localhost:443 doesn't forward to nginx")
  }

  const installCertManager = async () => {
    console.log('installing cert-manager chart')

    await helm([
      'upgrade', '--install', '--atomic', 'cert-manager',
      '--create-namespace', '--namespace', 'cert-manager',
      '--set', 'installCRDs=true',
      '--set', 'extraArgs[0]=--enable-certificate-owner-ref=true',
      'https://charts.jetstack.io/charts/cert-manager-v1.9.1.tgz'
    ])

    console.log('installed: cert-manager')
  }

  const installEpinio = async () => {
    console.log('installing epinio chart')

    await helm([
      'upgrade', '--install', 'epinio',
      '--create-namespace', '--namespace', 'epinio',
      '--atomic',
      '--set', 'global.domain=' + domain,
      '--set', 'ingress.ingressClassName=nginx',
      '--set', 'ingress.nginxSSLRedirect=false',
      'https://github.com/epinio/helm-charts/releases/download/epinio-1.8.1/epinio-1.8.1.tgz'
    ])

    console.log('installed: epinio')
  }

  const uninstallEpinio = async () => {
    console.log('uninstalling epinio chart')

    await helm([
      'uninstall', '--namespace', 'epinio',
      '--wait', 'epinio'
    ])

    console.log('uninstalled: epinio')
  }

  const uninstallCertManager = async () => {
    console.log('uninstalling cert-manager chart')

    await helm([
      'uninstall', '--namespace', 'cert-manager',
      '--wait', 'cert-manager'
    ])

    console.log('uninstalled: cert-manager')
  }

  const uninstallNginx = async () => {
    console.log('uninstalling nginx chart')

    await helm([
      'uninstall', '--namespace', 'ingress-nginx',
      '--wait', 'ingress-nginx'
    ])

    console.log('uninstalled: nginx')
  }

  // spawn epinio status check only once
  useEffect(() => {
    checkEpinioStatus()
  }, [])

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
          disabled={installed == null || installed || isLoading || !hasKubernetes} >
          Install/Upgrade
        </Button>
        <Button
          startIcon={<DeleteIcon/>}
          variant="contained"
          onClick={uninstall}
          // uninstall button is disabled if Epinio is not installed
          disabled={installed == null || !installed || isLoading}
          color="secondary" >
          Uninstall
        </Button>
        {(installed == null || isLoading) && <CircularProgress style={{ width: '20px', height: '20px', marginLeft: '10px' }} />}
      </CardActions>
      <Box sx={{ width: '100%' }}>
        {isLoading && <LinearProgress variant="determinate" value={progress} />}
      </Box>
    </Card>
  )
}
