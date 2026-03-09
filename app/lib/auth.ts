import { NextRequest } from 'next/server'

export type UserRole = 'admin' | 'member'
export type CreateInviteResult = {
  inviteToken: string
  inviteUrl: string
  email: string
  role: UserRole
  emailSent: boolean
  emailError: string
}

const backendBaseUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
export const SESSION_COOKIE = 'auth_session'

type SessionUser = { id: string; email: string; role: UserRole }

function getErrorMessage(data: Record<string, unknown> | null, fallback: string) {
  const error = data?.error
  return typeof error === 'string' && error ? error : fallback
}

function requireData(data: Record<string, unknown> | null, fallback: string) {
  if (!data) {
    throw new Error(fallback)
  }
  return data
}

async function backendFetch(path: string, options: RequestInit = {}) {
  const url = new URL(path, backendBaseUrl)
  const response = await fetch(url, {
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.headers || {})
    }
  })
  let data: unknown = null
  try {
    data = await response.json()
  } catch {
    data = null
  }
  return { response, data: data as Record<string, unknown> | null }
}

export async function login(email: string, password: string) {
  const { response, data } = await backendFetch('/api/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  if (!response.ok) return null
  const payload = requireData(data, 'Login failed')
  return { token: payload.token as string, user: payload.user as SessionUser }
}

export async function logout(token: string) {
  await backendFetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'x-session-token': token }
  })
}

export async function getSessionUser(token: string | undefined) {
  if (!token) return null
  const { response, data } = await backendFetch('/api/auth/me', {
    method: 'GET',
    headers: { 'x-session-token': token }
  })
  if (!response.ok) return null
  const payload = requireData(data, 'Unauthorized')
  return payload.user as SessionUser
}

export async function getSessionUserFromRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  return getSessionUser(token)
}

export async function createInvite(sessionToken: string, email: string, role: UserRole, inviteBaseUrl: string) {
  const { response, data } = await backendFetch('/api/auth/invites', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-session-token': sessionToken
    },
    body: JSON.stringify({ email, role, invite_base_url: inviteBaseUrl })
  })
  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Unable to create invite'))
  }
  return requireData(data, 'Unable to create invite') as CreateInviteResult
}

export async function listUsersAndInvites(sessionToken: string) {
  const { response, data } = await backendFetch('/api/auth/invites', {
    headers: { 'x-session-token': sessionToken }
  })
  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Unable to load users and invites'))
  }
  return requireData(data, 'Unable to load users and invites') as {
    users: Array<{ id: string; email: string; role: UserRole; created_at?: string; createdAt?: string }>
    pendingInvites: Array<{ id: string; email: string; role: UserRole; created_at?: string; createdAt?: string; expires_at?: string; expiresAt?: string }>
  }
}

export async function acceptInvite(token: string, password: string) {
  const { response, data } = await backendFetch('/api/auth/accept', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token, password })
  })

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Unable to accept invite'))
  }

  const payload = requireData(data, 'Unable to accept invite')
  return {
    token: payload.token as string,
    user: payload.user as SessionUser
  }
}

export async function resetUserPassword(sessionToken: string, userId: string, password: string) {
  const { response, data } = await backendFetch(`/api/auth/users/${userId}/reset-password`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-session-token': sessionToken
    },
    body: JSON.stringify({ password })
  })

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Unable to reset password'))
  }

  return requireData(data, 'Unable to reset password')
}

export async function deleteUser(sessionToken: string, userId: string) {
  const { response, data } = await backendFetch(`/api/auth/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'x-session-token': sessionToken
    }
  })

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Unable to delete user'))
  }

  return requireData(data, 'Unable to delete user')
}

export async function requestPasswordReset(email: string, resetBaseUrl: string) {
  const { response, data } = await backendFetch('/api/auth/password-reset/request', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, reset_base_url: resetBaseUrl })
  })

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Unable to request password reset'))
  }

  return requireData(data, 'Unable to request password reset')
}

export async function confirmPasswordReset(token: string, password: string) {
  const { response, data } = await backendFetch('/api/auth/password-reset/confirm', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token, password })
  })

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Unable to reset password'))
  }

  return requireData(data, 'Unable to reset password')
}
