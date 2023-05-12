import React, { useEffect } from 'react'
import { Cloud as CloudIcon, CloudOff as CloudOffIcon } from '@mui/icons-material'
import { Grid } from '@mui/material'
import { credentialsOK } from './Credentials'
import EpinioClient from './API'

export function infoOK(info) {
  return info && info !== '' && info !== '-'
}

export function Info({
  apiDomain,
  enabled,
  credentials,
  info,
  onInfoChanged
}) {
  useEffect(() => {
    const fetchInfo = async () => {
      const epinioClient = EpinioClient({ apiDomain, credentials })
      return await epinioClient.info()
    }

    if (enabled && credentialsOK(credentials)) {
      fetchInfo()
        .then(data => {
          onInfoChanged(data.version)
        })
        .catch(error => {
          console.error(error)
          onInfoChanged('-')
        })
    }
  }, [enabled, credentials, onInfoChanged])

  return (
    <Grid container direction="row" alignItems="center" width="30%">
      <Grid item xs={1}>
        { infoOK(info) ? <CloudIcon /> : <CloudOffIcon /> }
      </Grid>
      <Grid item xs={11}>
        Epinio: { info }
      </Grid>
    </Grid>
  )
}
