import { NextRequest, NextResponse } from 'next/server'
import { SESSION_COOKIE, deleteUser, getSessionUserFromRequest } from '@/app/lib/auth'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const user = await getSessionUserFromRequest(request)
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId } = await context.params

  try {
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value || ''
    const result = await deleteUser(sessionToken, userId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to delete user' },
      { status: 400 }
    )
  }
}
