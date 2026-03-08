import { NextRequest, NextResponse } from 'next/server'
import { requestPasswordReset } from '@/app/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const result = await requestPasswordReset(String(email), request.nextUrl.origin)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to request password reset' },
      { status: 400 }
    )
  }
}
