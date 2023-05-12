import React, { useEffect, useState } from 'react'
import { Button } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import { credentialsOK } from './Credentials'
import EpinioClient from './API'

export function Lister({ apiDomain, enabled, credentials }) {
  const [table, setTable] = useState([])

  useEffect(() => {
    const fetchApplications = () => {
      const epinioClient = EpinioClient({ apiDomain, credentials })
      epinioClient.listApplications('workspace')
        .then(applications => {
          const t = []

          for (let i = 0; i < applications.length; i++) {
            const app = applications[i]

            t[i] = {
              id: app.meta.name,
              state: app.status,
              instances: app.configuration.instances
            }

            if (app.deployment) {
              t[i].dstatus = app.deployment.status
            }

            if (app.configuration.routes.length > 0) {
              t[i].route = app.configuration.routes[0]
            }
          }

          setTable(t)
        })
        .catch(error => {
          console.error('error listing applications', error)
          setTable([])
        })
    }

    if (enabled && credentialsOK(credentials)) {
      fetchApplications()
      const timerID = setInterval(fetchApplications, 15000)
      return () => clearInterval(timerID)
    }
  }, [apiDomain, enabled, credentials])

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
        rows={table}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
      />
    </div>
  )
}

export default Lister
