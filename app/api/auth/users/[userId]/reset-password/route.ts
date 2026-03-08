import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, getSessionUserFromRequest, resetUserPassword } from '@/app/lib/auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const user = await getSessionUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await context.params

  try {
    const { password } = await request.json()
    if (!password || String(password).length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value || ''
    const result = await resetUserPassword(sessionToken, userId, String(password))
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to reset password' },
      { status: 400 }
    )
  }
}
