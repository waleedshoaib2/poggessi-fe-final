'use client'

import { AppBar, Box, Toolbar } from '@mui/material'
import { MAIN_GRADIENT } from '../libs/mui/theme/palette'
import Image from 'next/image'
import { useEffect, useState } from 'react'

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  const [height, setHeight] = useState(0)
  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <>
      <AppBar
        position="fixed"
        sx={{
          backgroundImage: MAIN_GRADIENT,
          borderRadius: '0 0 16px 16px'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <Image alt="" src={'/logo.png'} width={120} height={60} />
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          // height: '695px',
          height: `calc(${height}px)`,
          // Correct way to set background image
          backgroundImage: 'url(/login.png)',
          // mt: 11,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          display: 'flex',
          objectFit: 'cover',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'auto',
          p: 3,
          boxSizing: 'border-box'
        }}
      >
        {children}
      </Box>
    </>
  )
}
