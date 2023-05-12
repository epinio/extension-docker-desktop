import React from 'react'
import { Card, CardActions, CardContent, Grid, Typography } from '@mui/material'
import Pusher from './Pusher'
import Lister from './Lister'

export default function Applications({
  uiDomain,
  credentials,
  onError,
  enabled,
  disabled
}) {
  return (
    <Card>
      <CardContent>
        <Typography>
          Applications
        </Typography>
      </CardContent>
      <CardActions>
        <Grid container spacing={2} direction="column">
          <Pusher
            apiDomain={uiDomain}
            enabled={enabled}
            disabled={disabled}
            credentials={credentials}
            onError={onError}
            list={
                <Lister apiDomain={uiDomain} enabled={enabled} credentials={credentials} />
            } />
        </Grid>
      </CardActions>
    </Card>
  )
}
