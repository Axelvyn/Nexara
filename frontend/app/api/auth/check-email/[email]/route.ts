import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> }
) {
  try {
    const { email } = await params

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required', available: false },
        { status: 400 }
      )
    }

    // Forward the request to the backend API
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const response = await fetch(
      `${backendUrl}/api/auth/check-email/${encodeURIComponent(email)}`
    )

    const data = await response.json()

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Email check API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Error checking email availability',
        available: false,
      },
      { status: 500 }
    )
  }
}
