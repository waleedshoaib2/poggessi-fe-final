'use client'

import { Alert, Box, Button, IconButton, InputAdornment, Link, Stack, TextField, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import LoginLayout from '../(root)/login-layout'
import { EmailOutlined, LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material'

const commonInputStyles = {
  backgroundColor: 'white',
  borderRadius: '8px',
  overflow: 'hidden',
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'white',
    '& input': {
      color: 'primary.main'
    },
    '& fieldset': {
      borderColor: 'primary.main',
      borderRadius: '8px'
    },
    '&:hover fieldset': {
      borderColor: 'primary.main'
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main'
    },
    '& input:-webkit-autofill': {
      WebkitBoxShadow: '0 0 0 1000px white inset !important',
      WebkitTextFillColor: 'primary.main !important'
    },
    '& .MuiInputAdornment-root': {
      backgroundColor: 'white !important',
      color: 'primary.main !important',
      marginRight: '10px !important'
    }
  }
}

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError(null)
    if (!email || !password) {
      setError('Email and password are required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Login failed')
        return
      }

      router.push('/search')
    } catch {
      setError('Login failed. Please try again.')
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
        <Stack spacing={1} display={'flex'} alignItems={'center'} flexDirection={'column'}>
          <Typography variant="h4" fontWeight={800} color="white" mb={3}>
            Welcome Back
          </Typography>
          <Typography variant="subtitle1" fontWeight={600} color="white" mb={3}>
            Sign in to access Pogessi
          </Typography>
        </Stack>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'white' }}>
            Email Address
          </Typography>
          <TextField
            fullWidth
            placeholder="admin@pogessi.local"
            onChange={(e) => setEmail(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined color="primary" />
                  </InputAdornment>
                )
              }
            }}
            sx={commonInputStyles}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'white' }}>
            Password
          </Typography>
          <TextField
            fullWidth
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter Password"
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff color="primary" /> : <Visibility color="primary" />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
            sx={commonInputStyles}
          />
        </Box>

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2, borderRadius: '12px', py: 1.5 }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Login'}
        </Button>

        <Typography variant="caption" color="white" sx={{ display: 'block', mt: 2 }}>
          Forgot your password?{' '}
          <Link href="/reset-password" underline="always" color="inherit">
            Reset it
          </Link>
        </Typography>

      </Box>
    </LoginLayout>
  )
}
