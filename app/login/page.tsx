'use client'

import { Box, Button, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import LoginLayout from '../(root)/login-layout'
import { EmailOutlined, LockOutlined, Visibility, VisibilityOff } from '@mui/icons-material'

const commonInputStyles = {
  backgroundColor: 'white',
  // color: 'red', // Remove this as it's not the correct way to target the input
  borderRadius: '8px',
  overflow: 'hidden',
  '& .MuiOutlinedInput-root': {
    // This removes the background from the container itself
    backgroundColor: 'white',
    // Target the input element for text color
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
      WebkitTextFillColor: 'primary.main !important' // Ensure autofill text is also red
    },
    // This targets the specific area around the icon
    '& .MuiInputAdornment-root': {
      backgroundColor: 'white !important',
      color: 'primary.main !important',
      marginRight: '10px !important' // Added space between icon and text
    }
  }
}

// In your TextField, make sure to REMOVE the sx from InputAdornment

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')

  const handleLogin = () => {
    if (email && password) {
      router.push('/search')
    } else {
      alert('Invalid Credentials')
    }
  }

  return (
    <LoginLayout>
      <Box
        sx={{
          // minWidth: 526,
          minWidth: { xs: '80%', sm: '60%', md: '30%' },
          // mx: { xs: 12 },

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
            Let&apos;s Sign in you account
          </Typography>
        </Stack>

        {/* Email Field */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" sx={{ mb: 1, display: 'block', color: 'white' }}>
            Email Address
          </Typography>
          <TextField
            fullWidth
            placeholder="test@soal.com"
            onChange={(e) => setEmail(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  // REMOVED sx from here so it can inherit the transparent style
                  <InputAdornment position="start">
                    <EmailOutlined color="primary" />
                  </InputAdornment>
                )
              }
            }}
            sx={commonInputStyles}
          />
        </Box>

        {/* Password Field */}
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

        <Button fullWidth variant="contained" sx={{ mt: 2, borderRadius: '12px', py: 1.5 }} onClick={handleLogin}>
          Login
        </Button>
      </Box>
    </LoginLayout>
  )
}
