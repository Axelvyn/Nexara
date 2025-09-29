import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Get the authorization token from headers
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null

    if (token) {
      // Forward the logout request to the backend API
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      
      try {
        await fetch(`${backendUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        })
      } catch (error) {
        // Even if backend logout fails, we can still clear client-side data
        console.warn('Backend logout failed:', error)
      }
    }

    // Return success regardless of backend response
    // The frontend will clear local storage
    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    })
  } catch (error) {
    console.error('Logout API error:', error)
    // Still return success since logout should always work on frontend
    return NextResponse.json({
      success: true,
      message: 'Logout successful',
    })
  }
}