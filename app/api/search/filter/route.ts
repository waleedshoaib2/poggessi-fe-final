import { NextRequest, NextResponse } from 'next/server'

const backendBaseUrl =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://3.226.57.130:8000'

export async function POST(request: NextRequest) {
  try {
    const upstreamUrl = new URL('/api/search/filter', backendBaseUrl)
    upstreamUrl.search = request.nextUrl.search

    const incomingApiKey = request.headers.get('x-api-key')
    const apiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY || incomingApiKey

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        ...(apiKey ? { 'x-api-key': apiKey } : {})
      }
    })

    const responseBody = await upstreamResponse.arrayBuffer()
    const responseContentType = upstreamResponse.headers.get('content-type') || 'application/json'

    return new NextResponse(responseBody, {
      status: upstreamResponse.status,
      headers: { 'content-type': responseContentType }
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Upstream request failed',
        detail: error instanceof Error ? error.message : String(error)
      },
      { status: 502 }
    )
  }
}
