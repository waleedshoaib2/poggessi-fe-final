import { NextRequest, NextResponse } from 'next/server'
import { login } from '@/app/lib/auth'
import { withSessionCookie } from '@/app/lib/auth-response'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    const result = await login(email, password)
    if (!result) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const response = NextResponse.json({ user: result.user })
    return withSessionCookie(response, result.token)
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
