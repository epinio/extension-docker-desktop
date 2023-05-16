import React from 'react'
import { Box, Button, Grid, IconButton, Input } from '@mui/material'
import { FolderOpen as FolderOpenIcon, Send as SendIcon } from '@mui/icons-material'
import CircularProgress from '@mui/material/CircularProgress'

export function Pusher(props) {
  const [folder, setFolder] = React.useState('')
  const [name, setName] = React.useState('')
  const [progress, setProgress] = React.useState(null)

  const drag = (ev) => {
    setFolder(ev.dataTransfer.files[0].path)
  }

  const epinio = async (args) => {
    try {
      setProgress(true)
      const result = await window.ddClient.extension.host.cli.exec('epinio', args)
      setProgress(null)
      return result
    } catch (error) {
      setProgress(null)
      if (error instanceof Error) {
        console.error(error.message)
        throw error
      } else {
        console.error(JSON.stringify(error))
        if (error.stderr) {
          throw Error(error.stderr)
        } else {
          throw Error(JSON.stringify(error))
        }
      }
    }
  }

  const handleOpen = async (ev) => {
    const result = await window.ddClient.desktopUI.dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    if (!result.canceled) {
      if (result.filePaths.length > 0) {
        setFolder(result.filePaths[0])
      }
    }
  }

  const send = async (ev) => {
    if (folder !== '' && name !== '') {
      window.ddClient.desktopUI.toast.success("Using buildpacks to deploy '" + name + "', this can take a few minutes.")
      try {
        const epinioURL = 'https://' + props.apiDomain
        let result = await epinio([
          'login', '--trust-ca', '-u', 'admin', '-p', 'password', epinioURL
        ])
        if (result.stderr.length > 0) {
          console.log(result.stderr)
        }
        result = await epinio([
          'apps', 'push',
          '-n', name,
          '-p', folder
        ])
        if (result.stderr.length > 0) {
          console.log(result.stderr)
        }
        console.info(result.stdout)
      } catch (error) {
        props.onError('Epinio failed to deploy: ' + error)
      }
    }
  }

  const spinner = progress ? <CircularProgress /> : null
  return (
    <Grid container m={2}>
      <Grid item xs={3}>
        <label htmlFor="contained-input-name">
          <Input value={name} placeholder='Application name' onChange={e => setName(e.target.value)} disabled={props.disabled} />
        </label>
      </Grid>

      <Grid item xs={6}>
        <Input value={folder} placeholder='Source folder' onDrop={drag} disabled={props.disabled} sx={{ width: '30ch' }} />
        <IconButton aria-label="open" onClick={handleOpen} disabled={props.disabled}>
          <FolderOpenIcon />
        </IconButton>
      </Grid>

      <Grid item xs={2}>
        <Button variant="outlined" startIcon={<SendIcon />} onClick={send} disabled={props.disabled}>Upload</Button>
      </Grid>
      <Grid item xs={1}>
        <Box sx={{ display: 'flex' }}>
          {spinner}
        </Box>
      </Grid>

      <Grid item xs={12} mt={'10px'}>
        {props.children}
      </Grid>
    </Grid>
  )
}

export default Pusher
