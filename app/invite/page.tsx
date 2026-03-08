'use client'

import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import LoginLayout from '../(root)/login-layout'

export default function InvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const token = searchParams.get('token') || ''

  const submit = async () => {
    setError(null)
    if (!token) {
      setError('Invite token is missing from URL')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/accept', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Unable to accept invite')
        return
      }
      router.push('/search')
    } catch {
      setError('Unable to accept invite right now')
    } finally {
      setLoading(false)
    }
  }

  return (
    <LoginLayout>
      <Box
        sx={{
          minWidth: { xs: '80%', sm: '60%', md: '30%' },
          p: 4,
          borderRadius: '20px',
          boxShadow: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <Stack spacing={1} alignItems="center" mb={3}>
          <Typography variant="h4" fontWeight={800} color="white">
            Accept Invite
          </Typography>
          <Typography variant="subtitle1" fontWeight={600} color="white">
            Set your password to activate your account
          </Typography>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <TextField
          fullWidth
          label="New password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ backgroundColor: 'white', borderRadius: '8px' }}
        />

        <Button fullWidth variant="contained" sx={{ mt: 2, borderRadius: '12px', py: 1.5 }} onClick={submit} disabled={loading}>
          {loading ? 'Activating...' : 'Activate account'}
        </Button>
      </Box>
    </LoginLayout>
  )
}
