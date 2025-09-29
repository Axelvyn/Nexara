import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Username is required', available: false },
        { status: 400 }
      )
    }

    // Forward the request to the backend API
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const response = await fetch(
      `${backendUrl}/api/auth/check-username/${encodeURIComponent(username)}`
    )

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Username check API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error checking username availability',
        available: false,
      },
      { status: 500 }
    )
  }
}
