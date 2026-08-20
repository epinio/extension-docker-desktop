import React, { useState } from 'react'
import { Box, Button, Input, Typography } from '@mui/material'

export const DEFAULT_DOMAIN = '127.0.0.1.sslip.io'

const STORAGE_KEY = 'epinio.domain'

// Wildcard DNS root, not a URL: hostname shape only, no scheme or path.
const DOMAIN_PATTERN = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/i

export function isValidDomain(value) {
  return DOMAIN_PATTERN.test(value)
}

export function storedDomain() {
  return window.localStorage.getItem(STORAGE_KEY) || DEFAULT_DOMAIN
}

export function DomainField({ domain, onDomainChanged }) {
  const [draft, setDraft] = useState(domain)

  const trimmed = draft.trim()
  const valid = isValidDomain(trimmed)
  const dirty = trimmed !== domain

  const apply = () => {
    window.localStorage.setItem(STORAGE_KEY, trimmed)
    onDomainChanged(trimmed)
  }

  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <Input
        value={draft}
        placeholder={DEFAULT_DOMAIN}
        error={!valid}
        onChange={e => setDraft(e.target.value)}
        sx={{ width: '18rem', mr: 1 }} />
      <Button variant="outlined" onClick={apply} disabled={!dirty || !valid}>
        Apply
      </Button>
      <Typography variant="body2" sx={{ mt: 0.5 }}>
        { valid ? `API and UI at epinio.${trimmed}` : 'Not a valid domain' }
      </Typography>
    </Box>
  )
}
