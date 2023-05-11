import React, { useEffect } from 'react'
import { Buffer } from 'buffer'
import { sprintf } from 'sprintf-js'
import { Cloud as CloudIcon, CloudOff as CloudOffIcon } from '@mui/icons-material'
import { Button, Grid } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { credentialsOK } from './Credentials'

export function infoOK(info) {
  return info && info !== '' && info !== '-'
}

function EpinioClient(
  apiDomain,
  username,
  password
) {
  const authHeaders = () => {
    const encodedUserPass = Buffer.from(`${username}:${password}`).toString('base64')
    const authHeader = `Basic ${encodedUserPass}`
    const headers = new Headers()
    headers.set('Authorization', authHeader)
    return headers
  }

  const info = async () => {
    try {
      console.log('check info api endpoint', apiDomain, username, password)

      const resp = await fetch(`http://${apiDomain}/api/v1/info`, { headers: authHeaders() })
      return await resp.json()
    } catch (error) {
      console.error(error)
      return Error(error)
    }
  }

  return {
    info
  }
}

export function Info({
  apiDomain,
  enabled,
  credentials,
  info,
  onInfoChanged
}) {
  useEffect(async () => {
    if (!onInfoChanged || !enabled || !credentialsOK(credentials)) {
      return
    }

    const epinioClient = EpinioClient(apiDomain, credentials.username, credentials.password)

    try {
      console.log('check info api endpoint')
      const infoResponse = await epinioClient.info()
      onInfoChanged(infoResponse.version)
    } catch (error) {
      console.error(error)
      onInfoChanged('-')
    }
  }, [enabled, credentials, onInfoChanged])

  const icon = infoOK(info) ? <CloudIcon /> : <CloudOffIcon />

  return (
    <Grid container direction="row" alignItems="center" width="30%">
      <Grid item xs={1}>
        {icon}
      </Grid>
      <Grid item xs={11}>
        Epinio: { info }
      </Grid>
    </Grid>
  )
}

export class Lister extends React.Component {
  constructor(props) {
    super(props)
    this.state = { table: [] }
  }

  componentDidMount() {
    this.list()
    this.timerID = setInterval(
      () => this.list(),
      15000
    )
  }

  componentWillUnmount() {
    clearInterval(this.timerID)
  }

  list() {
    if (this.props.enabled && credentialsOK(this.props.credentials)) {
      const creds = this.props.credentials
      const apiURL = sprintf('http://%s:%s@%s/api/v1/namespaces/workspace/applications', creds.username, creds.password, this.props.apiDomain)
      console.log('check app list api endpoint')
      window.ddClient.extension.vm.service.get(apiURL).then(
        (value) => {
          console.log(value)
          const t = []
          for (let i = 0; i < value.length; i++) {
            t[i] = {
              id: value[i].meta.name,
              state: value[i].status,
              instances: value[i].configuration.instances
            }
            if (value[i].deployment) {
              t[i].dstatus = value[i].deployment.status
            }
            if (value[i].configuration.routes.length > 0) {
              t[i].route = value[i].configuration.routes[0]
            }
          }
          this.setState({ table: t })
        }
      ).catch(
        (error) => {
          console.error(error)
          this.setState({ table: [] })
        }
      )
    }
  }

  render() {
    const columns = [
      { field: 'id', headerName: 'Name', width: '160' },
      { field: 'state', headerName: 'State', sortable: true, width: '80' },
      { field: 'instances', headerName: 'Instances', type: 'number', width: '80' },
      {
        field: 'route',
        headerName: 'Route',
        width: '160',
        renderCell: (params) => {
          const open = () => {
            window.ddClient.host.openExternal('https://' + params.row.route)
          }
          return <Button onClick={open}>{params.row.route}</Button>
        }
      },
      { field: 'dstatus', headerName: 'Info', width: '320' }
    ]

    return (
      <div style={{ height: 300, width: '100%' }}>
        <DataGrid
          rows={this.state.table}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
        />
      </div>
    )
  }
}

export default Info
