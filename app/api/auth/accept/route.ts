import { NextRequest, NextResponse } from 'next/server'
import { acceptInvite } from '@/app/lib/auth'
import { withSessionCookie } from '@/app/lib/auth-response'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }
    if (String(password).length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const result = await acceptInvite(token, password)
    const response = NextResponse.json({ user: result.user })
    return withSessionCookie(response, result.token)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to accept invite' },
      { status: 400 }
    )
  }
}
