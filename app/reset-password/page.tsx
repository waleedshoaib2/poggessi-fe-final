'use client'

import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import LoginLayout from '../(root)/login-layout'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submitRequest = async () => {
    setError(null)
    setStatus(null)
    setLoading(true)
    try {
      const response = await fetch('/api/auth/password-reset/request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Unable to request reset')
        return
      }
      if (data.emailSent) {
        setStatus('Password reset email sent.')
      } else if (data.resetUrl) {
        setStatus(`Password reset link: ${data.resetUrl}`)
      } else {
        setStatus('If the account exists, reset instructions are ready.')
      }
    } catch {
      setError('Unable to request reset')
    } finally {
      setLoading(false)
    }
  }

  const submitConfirm = async () => {
    setError(null)
    setStatus(null)
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      const response = await fetch('/api/auth/password-reset/confirm', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Unable to reset password')
        return
      }
      setStatus('Password updated. Redirecting to login...')
      setTimeout(() => router.push('/login'), 1200)
    } catch {
      setError('Unable to reset password')
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
            Reset Password
          </Typography>
          <Typography variant="subtitle1" fontWeight={600} color="white">
            {token ? 'Set a new password' : 'Request a password reset link'}
          </Typography>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {status ? <Alert severity="success" sx={{ mb: 2 }}>{status}</Alert> : null}

        {token ? (
          <>
            <TextField
              fullWidth
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ backgroundColor: 'white', borderRadius: '8px' }}
            />
            <Button fullWidth variant="contained" sx={{ mt: 2, borderRadius: '12px', py: 1.5 }} onClick={submitConfirm} disabled={loading}>
              {loading ? 'Updating...' : 'Update password'}
            </Button>
          </>
        ) : (
          <>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ backgroundColor: 'white', borderRadius: '8px' }}
            />
            <Button fullWidth variant="contained" sx={{ mt: 2, borderRadius: '12px', py: 1.5 }} onClick={submitRequest} disabled={loading || !email}>
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </>
        )}
      </Box>
    </LoginLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}
