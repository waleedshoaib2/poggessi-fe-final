import { NextRequest, NextResponse } from 'next/server'
import { confirmPasswordReset } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
    }

    const result = await confirmPasswordReset(String(token), String(password))
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to reset password' },
      { status: 400 }
    )
  }
}
