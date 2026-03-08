import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, createInvite, getSessionUserFromRequest, listUsersAndInvites, UserRole } from '@/app/lib/auth'

export async function GET(request: NextRequest) {
  const user = await getSessionUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE)?.value || ''
  const data = await listUsersAndInvites(sessionToken)
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const user = await getSessionUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    const inviteRole: UserRole = 'member'

    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value || ''
    const inviteBaseUrl = request.nextUrl.origin
    const result = await createInvite(sessionToken, email, inviteRole, inviteBaseUrl)
    const origin = request.nextUrl.origin
    return NextResponse.json({
      inviteUrl: result.inviteUrl || `${origin}/invite?token=${result.inviteToken}`,
      email: result.email || email,
      role: result.role || inviteRole,
      emailSent: result.emailSent ?? false,
      emailError: result.emailError || ''
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to create invite' },
      { status: 400 }
    )
  }
}
