import { NextRequest, NextResponse } from 'next/server'
import { clearSessionCookie } from '@/app/lib/auth-response'
import { logout, SESSION_COOKIE } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  if (token) {
    await logout(token)
  }

  const response = NextResponse.json({ success: true })
  return clearSessionCookie(response)
}
