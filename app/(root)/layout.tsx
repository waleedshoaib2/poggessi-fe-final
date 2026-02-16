'use client'

import { AppBar, Box, Toolbar, IconButton, Popover, Tooltip, CircularProgress } from '@mui/material'
import { MAIN_GRADIENT } from '../libs/mui/theme/palette'
import Image from 'next/image'
import { Fragment, Suspense, useState } from 'react'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import MenuIcon from '@mui/icons-material/Menu'
import Configuration, { NumResults } from './components/Configuration'
import { useRouter, useSearchParams } from 'next/navigation'

function MainLayoutContent({ children, onSidebarToggle }: { children: React.ReactNode; onSidebarToggle?: () => void }) {
  // Initialize with a function to avoid accessing window during SSR
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const [numResults, setNumResults] = useState<NumResults>(3)
  const [confidence, setConfidence] = useState(0.3)
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSettingsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

  const open = Boolean(anchorEl)
  const handleNumResultsChange = (value: NumResults) => {
    setNumResults(value)
    updateURL('top_k', value.toString())
  }

  const handleConfidenceChange = (value: number) => {
    setConfidence(value)
    updateURL('conf_t', value.toString())
  }

  const updateURL = (param: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set(param, value)
    router.push(`?${params.toString()}`, { scroll: false })
  }

  return (
    <Fragment>
      <AppBar
        position="fixed"
        sx={{
          backgroundImage: MAIN_GRADIENT,
          borderRadius: '0 0 16px 16px'
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', p: 2 }}>
          {onSidebarToggle ? (
            <Tooltip title="Conversations">
              <IconButton color="inherit" aria-label="conversations" sx={{ color: 'white' }} onClick={onSidebarToggle}>
                <MenuIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Box sx={{ width: 48 }} />
          )}
          <Image alt="" src={'/logo.png'} width={120} height={60} />

          <Tooltip title="Settings">
            <IconButton color="inherit" aria-label="settings" sx={{ color: 'white' }} onClick={handleSettingsClick}>
              <SettingsOutlinedIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableScrollLock
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        transitionDuration={0}
        sx={{
          '& .MuiPopover-paper': {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            mt: 1
          }
        }}
      >
        <Configuration
          numResults={numResults}
          setNumResults={handleNumResultsChange}
          confidence={confidence}
          setConfidence={handleConfidenceChange}
          onClose={handleClose}
        />
      </Popover>

      <Box
        sx={{
          minHeight: '100vh',
          backgroundImage: 'url(/main.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          p: 3,
          pt: 15, // Ensure top padding accounts for fixed header
          boxSizing: 'border-box'
        }}
      >
        {children}
      </Box>
    </Fragment>
  )
}

export default function MainLayout({
  children,
  onSidebarToggle
}: {
  children: React.ReactNode
  onSidebarToggle?: () => void
}) {
  return (
    <Suspense fallback={<CircularProgress size={50} />}>
      <MainLayoutContent onSidebarToggle={onSidebarToggle}>{children}</MainLayoutContent>
    </Suspense>
  )
}
