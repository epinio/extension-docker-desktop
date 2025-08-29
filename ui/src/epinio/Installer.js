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

  const kubectl = async (args) => {
    const result = await window.ddClient.extension.host.cli.exec('kubectl', args)
    console.debug(JSON.stringify(result))

    if (result.stderr) {
      throw Error(result?.stderr)
    }

    return result.parseJsonObject()
  }

  const isEpinioInstalled = async () => {
    console.debug('check Epinio installation')

    try {
      const result = await helm(['status', '--namespace', 'epinio', 'epinio'])

      // if the release is uninstalling we are in a "pending" state
      if (result.includes('STATUS: uninstalling')) {
        console.debug('uninstalling epinio release')

        // alert('epinio not yet installed')
        setInstalled(null)
      } else {
        setInstalled(true)
      }
    } catch (error) {
      // alert('epinio check error' + error)
      setInstalled(false)
    }
  }

  const checkEpinioStatus = async () => {
    isEpinioInstalled()
    setInterval(async () => {
      await isEpinioInstalled()
    }, 10000)
  }

  async function install() {
    try {
      setProgress(10)
      const isTraefikInstalled = await checkTraefik()
      // alert(`Traefik is installed ${isTraefikInstalled}`)
      // todo: prompt for optional installation of traefik
      if (!isTraefikInstalled) {
        // alert('Traefik is not installed, installing')
        await installTraefik()
      }
      setProgress(30)

      const isCertManagerInstalled = await checkCertManager()
      // alert(`CertManager is installed ${isCertManagerInstalled}`)
      setProgress(40)
      if (!isCertManagerInstalled) {
        await installCertManager()
      }
      setProgress(50)

      setProgress(60)
      // todo: Handle repo not found and "Error: no cached repo found (try 'helm repo update')"
      await installEpinio()
      setProgress(100)

      setInstalled(true)
      onInstallationChanged(true)
    } catch (error) {
      setInstalled(false)
      onInstallationChanged(false)

      let message = 'Error installing Epinio'
      // todo: Fix error message reflection. It appears as though stderr is not being captured.
      if (error.stderr) {
        message = error.stderr
      }
      // alert(error)

      onError(message + '. \n' + error)
    } finally {
      setProgress(0)
    }
  }

  async function uninstall() {
    try {
      setProgress(10)
      await uninstallEpinio()
      setProgress(25)

      // todo: prompt for optional uninstallation of cert-manager
      setProgress(30)
      // await uninstallCertManager()
      setProgress(50)

      // todo: prompt for optional uninstallation of traefik
      setProgress(60)
      // await uninstallTraefik()
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

  const checkTraefik = async () => {
    console.log('checking traefik installation')

    const result = await kubectl([
      'get', 'svc', '-A',
      '-l', 'app.kubernetes.io/name=traefik',
      '-o', 'json'
    ])

    const isInstalled = result.items.length > 0
    console.log(`traefik already installed: ${isInstalled}`)

    return isInstalled
  }

  const installTraefik = async () => {
    console.log('installing traefik chart')

    const result = await helm([
      'upgrade', '--install', '--atomic', 'traefik',
      '--create-namespace', '--namespace', 'ingress-traefik',
      'https://traefik.github.io/charts/traefik/traefik-19.0.3.tgz'
    ])

    // alert(JSON.stringify(result))
    console.log('installed: traefik')
  }

  const checkCertManager = async () => {
    console.log('checking traefik installation')

    const result = await kubectl([
      'get', 'deployment', '-A',
      '-l', 'app.kubernetes.io/name=cert-manager',
      '-o', 'json'
    ])

    const isInstalled = result.items.length > 0
    console.log(`cert-manager already installed: ${isInstalled}`)

    return isInstalled
  }

  const installCertManager = async () => {
    console.log('installing cert-manager chart')
    // alert('installing cert-manager')
    const result = await helm([
      'upgrade', '--install', '--atomic', 'cert-manager',
      '--create-namespace', '--namespace', 'cert-manager',
      '--set', 'installCRDs=true',
      '--set', 'extraArgs[0]=--enable-certificate-owner-ref=true',
      'https://charts.jetstack.io/charts/cert-manager-v1.9.1.tgz'
    ])

    // alert(JSON.stringify(result))
    console.log('installed: cert-manager')
  }

  const installEpinio = async () => {
    console.log('installing epinio chart')

    // alert('installing epinio')
    const output = await helm([
      'upgrade', '--install', 'epinio',
      '--create-namespace', '--namespace', 'epinio',
      '--atomic',
      '--set', 'global.domain=' + domain,
      'https://github.com/epinio/helm-charts/releases/download/epinio-1.12.0/epinio-1.12.0.tgz'
    ])
    // alert(JSON.stringify(output))
    console.log('installed: epinio')
  }

  const uninstallTraefik = async () => {
    console.log('uninstalling traefik chart')

    await helm([
      'uninstall', '--namespace', 'ingress-traefik',
      '--wait', 'traefik'
    ])

    console.log('uninstalled: traefik')
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
