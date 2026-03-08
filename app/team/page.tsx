'use client'

import { Alert, Box, Button, Chip, Divider, Paper, Stack, TextField, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '../(root)/layout'
import MailOutlineRoundedIcon from '@mui/icons-material/MailOutlineRounded'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined'
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'

type User = { id: string; email: string; role: 'admin' | 'member'; createdAt: string }
type Invite = { id: string; email: string; role: 'admin' | 'member'; createdAt: string; expiresAt: string }

export default function TeamPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [invites, setInvites] = useState<Invite[]>([])
  const [email, setEmail] = useState('')
  const [inviteUrl, setInviteUrl] = useState('')
  const [inviteStatus, setInviteStatus] = useState<string>('')
  const [passwordResetStatus, setPasswordResetStatus] = useState<string>('')
  const [deleteStatus, setDeleteStatus] = useState<string>('')

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const meResp = await fetch('/api/auth/me')
      if (!meResp.ok) {
        router.replace('/login')
        return
      }
      const meData = await meResp.json()
      if (meData.user.role !== 'admin') {
        router.replace('/search')
        return
      }

      const resp = await fetch('/api/auth/invites')
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.error || 'Unable to load team data')
        return
      }
      setUsers(data.users || [])
      setInvites(data.pendingInvites || [])
    } catch {
      setError('Unable to load team data')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void load()
  }, [load])

  const createInvite = async () => {
    setError(null)
    setInviteUrl('')
    setInviteStatus('')
    setPasswordResetStatus('')
    setDeleteStatus('')
    try {
      const resp = await fetch('/api/auth/invites', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.error || 'Unable to create invite')
        return
      }
      setInviteUrl(data.inviteUrl || '')
      if (data.emailSent) {
        setInviteStatus(`Invite email sent to ${data.email}`)
      } else {
        setInviteStatus(data.emailError ? `Email not sent: ${data.emailError}` : 'Email not sent')
      }
      setEmail('')
      await load()
    } catch {
      setError('Unable to create invite')
    }
  }

  const resetPassword = async (userId: string, userEmail: string) => {
    setError(null)
    setPasswordResetStatus('')
    setDeleteStatus('')
    const password = window.prompt(`Enter a new password for ${userEmail}`)
    if (!password) return

    try {
      const resp = await fetch(`/api/auth/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password })
      })
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.error || 'Unable to reset password')
        return
      }
      setPasswordResetStatus(`Password reset for ${userEmail}`)
    } catch {
      setError('Unable to reset password')
    }
  }

  const removeUser = async (userId: string, userEmail: string) => {
    setError(null)
    setPasswordResetStatus('')
    setDeleteStatus('')
    const confirmed = window.confirm(`Delete ${userEmail}? This removes their access immediately.`)
    if (!confirmed) return

    try {
      const resp = await fetch(`/api/auth/users/${userId}`, {
        method: 'DELETE'
      })
      const data = await resp.json()
      if (!resp.ok) {
        setError(data.error || 'Unable to delete user')
        return
      }
      setDeleteStatus(`Deleted ${userEmail}`)
      await load()
    } catch {
      setError('Unable to delete user')
    }
  }

  return (
    <MainLayout>
      <Box sx={{ width: '100%', maxWidth: 1180 }}>
        <Paper
          sx={{
            mb: 3,
            overflow: 'hidden',
            borderRadius: '28px',
            border: '1px solid rgba(255,255,255,0.18)',
            background: 'linear-gradient(135deg, rgba(12,28,44,0.78) 0%, rgba(45,90,140,0.62) 52%, rgba(127,171,245,0.5) 100%)',
            backdropFilter: 'blur(22px)',
            boxShadow: '0 26px 70px rgba(10, 24, 42, 0.28)'
          }}
        >
          <Box
            sx={{
              p: { xs: 2.5, md: 4 },
              background:
                'radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 28%), radial-gradient(circle at bottom right, rgba(255,255,255,0.12), transparent 24%)'
            }}
          >
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} justifyContent="space-between">
              <Box sx={{ maxWidth: 620 }}>
                <Typography
                  sx={{
                    fontSize: { xs: 34, md: 56 },
                    lineHeight: 0.95,
                    fontWeight: 900,
                    color: 'common.white',
                    letterSpacing: '-0.04em',
                    mb: 1.5
                  }}
                >
                  Team Access
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 14, md: 17 },
                    color: 'rgba(255,255,255,0.82)',
                    maxWidth: 540
                  }}
                >
                  Invite members, monitor pending access, and handle password resets from one controlled surface.
                </Typography>
              </Box>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ minWidth: { lg: 360 } }}>
                <Paper
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: '22px',
                    backgroundColor: alpha('#FFFFFF', 0.14),
                    color: 'common.white',
                    border: '1px solid rgba(255,255,255,0.14)'
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <PeopleAltOutlinedIcon fontSize="small" />
                    <Typography sx={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>
                      Active users
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>{users.length}</Typography>
                </Paper>

                <Paper
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: '22px',
                    backgroundColor: alpha('#FFFFFF', 0.1),
                    color: 'common.white',
                    border: '1px solid rgba(255,255,255,0.14)'
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <PendingActionsOutlinedIcon fontSize="small" />
                    <Typography sx={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.8 }}>
                      Pending invites
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: 34, fontWeight: 900, lineHeight: 1 }}>{invites.length}</Typography>
                </Paper>
              </Stack>
            </Stack>
          </Box>
        </Paper>

        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {inviteStatus ? <Alert severity={inviteStatus.startsWith('Invite email sent') ? 'success' : 'warning'} sx={{ mb: 2 }}>{inviteStatus}</Alert> : null}
        {inviteUrl && !inviteStatus.startsWith('Invite email sent') ? <Alert severity="info" sx={{ mb: 2 }}>Manual Invite Link: {inviteUrl}</Alert> : null}
        {passwordResetStatus ? <Alert severity="success" sx={{ mb: 2 }}>{passwordResetStatus}</Alert> : null}
        {deleteStatus ? <Alert severity="success" sx={{ mb: 2 }}>{deleteStatus}</Alert> : null}

        <Stack direction={{ xs: 'column', xl: 'row' }} spacing={2.5} alignItems="stretch">
          <Paper
            sx={{
              flex: { xl: '0 0 360px' },
              p: { xs: 2.5, md: 3 },
              borderRadius: '24px',
              border: '1px solid rgba(255,255,255,0.28)',
              backgroundColor: 'rgba(245,247,251,0.9)',
              backdropFilter: 'blur(18px)',
              boxShadow: '0 18px 45px rgba(16, 31, 53, 0.14)'
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #5B7595 0%, #76A7F8 100%)',
                  color: 'common.white'
                }}
              >
                <MailOutlineRoundedIcon fontSize="small" />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 24, fontWeight: 800, color: 'grey.900' }}>Invite Member</Typography>
                <Typography sx={{ fontSize: 14, color: 'grey.600' }}>
                  Add one more seat to the platform with a single email invite.
                </Typography>
              </Box>
            </Stack>

            <TextField
              label="Member email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              sx={{
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '16px',
                  backgroundColor: 'rgba(255,255,255,0.72)'
                }
              }}
            />
            <Button
              variant="contained"
              onClick={createInvite}
              disabled={!email || loading}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: '16px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                boxShadow: '0 14px 24px rgba(91,117,149,0.26)'
              }}
            >
              {loading ? 'Sending...' : 'Create Invite'}
            </Button>

            <Divider sx={{ my: 2.5 }} />

            <Typography sx={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'grey.600', mb: 1 }}>
              Access policy
            </Typography>
            <Typography sx={{ fontSize: 14, color: 'grey.700', lineHeight: 1.6 }}>
              Invitations created here always provision a <strong>member</strong> account. Admin access remains restricted.
            </Typography>
          </Paper>

          <Stack flex={1} spacing={2.5}>
            <Paper
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.28)',
                backgroundColor: 'rgba(245,247,251,0.92)',
                backdropFilter: 'blur(18px)',
                boxShadow: '0 18px 45px rgba(16, 31, 53, 0.14)'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography sx={{ fontSize: 26, fontWeight: 800, color: 'grey.900' }}>Users</Typography>
                  <Typography sx={{ fontSize: 14, color: 'grey.600' }}>
                    Live accounts that can sign in right now.
                  </Typography>
                </Box>
                <Chip
                  label={`${users.length} active`}
                  sx={{
                    borderRadius: '999px',
                    backgroundColor: alpha('#5B7595', 0.12),
                    color: 'primary.main',
                    fontWeight: 700
                  }}
                />
              </Stack>

              <Stack spacing={1.5}>
                {users.map((user) => (
                  <Paper
                    key={user.id}
                    elevation={0}
                    sx={{
                      p: 1.75,
                      borderRadius: '18px',
                      border: '1px solid rgba(91,117,149,0.12)',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(240,244,249,0.95) 100%)'
                    }}
                  >
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                      <Box>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'grey.900', wordBreak: 'break-word' }}>
                          {user.email}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: 'grey.600', mt: 0.5 }}>
                          Account access enabled
                        </Typography>
                      </Box>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }}>
                        <Chip
                          label={user.role}
                          sx={{
                            alignSelf: { xs: 'flex-start', sm: 'center' },
                            borderRadius: '999px',
                            backgroundColor: user.role === 'admin' ? 'primary.main' : alpha('#5D6679', 0.12),
                            color: user.role === 'admin' ? 'common.white' : 'grey.700',
                            fontWeight: 700,
                            textTransform: 'lowercase'
                          }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<LockResetOutlinedIcon />}
                          onClick={() => resetPassword(user.id, user.email)}
                          sx={{
                            borderRadius: '14px',
                            px: 1.75,
                            py: 0.9,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Reset Password
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          startIcon={<DeleteOutlineRoundedIcon />}
                          onClick={() => removeUser(user.id, user.email)}
                          sx={{
                            borderRadius: '14px',
                            px: 1.75,
                            py: 0.9,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Delete
                        </Button>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Paper>

            <Paper
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: '24px',
                border: '1px solid rgba(255,255,255,0.28)',
                backgroundColor: 'rgba(245,247,251,0.92)',
                backdropFilter: 'blur(18px)',
                boxShadow: '0 18px 45px rgba(16, 31, 53, 0.14)'
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Box>
                  <Typography sx={{ fontSize: 26, fontWeight: 800, color: 'grey.900' }}>Pending Invites</Typography>
                  <Typography sx={{ fontSize: 14, color: 'grey.600' }}>
                    Invitations sent but not activated yet.
                  </Typography>
                </Box>
                <Chip
                  label={`${invites.length} pending`}
                  sx={{
                    borderRadius: '999px',
                    backgroundColor: alpha('#76A7F8', 0.18),
                    color: 'info.main',
                    fontWeight: 700
                  }}
                />
              </Stack>

              <Stack spacing={1.5}>
                {invites.map((invite) => (
                  <Paper
                    key={invite.id}
                    elevation={0}
                    sx={{
                      p: 1.75,
                      borderRadius: '18px',
                      border: '1px solid rgba(118,167,248,0.16)',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(237,244,255,0.95) 100%)'
                    }}
                  >
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                      <Box>
                        <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'grey.900', wordBreak: 'break-word' }}>
                          {invite.email}
                        </Typography>
                        <Typography sx={{ fontSize: 13, color: 'grey.600', mt: 0.5 }}>
                          Awaiting activation
                        </Typography>
                      </Box>
                      <Chip
                        label={invite.role}
                        sx={{
                          alignSelf: { xs: 'flex-start', md: 'center' },
                          borderRadius: '999px',
                          backgroundColor: alpha('#5D6679', 0.12),
                          color: 'grey.700',
                          fontWeight: 700,
                          textTransform: 'lowercase'
                        }}
                      />
                    </Stack>
                  </Paper>
                ))}
                {!invites.length && (
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: '20px',
                      border: '1px dashed rgba(93,102,121,0.28)',
                      textAlign: 'center',
                      backgroundColor: 'rgba(255,255,255,0.58)'
                    }}
                  >
                    <Typography sx={{ fontSize: 15, color: 'grey.600' }}>No pending invites</Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Stack>
      </Box>
    </MainLayout>
  )
}
