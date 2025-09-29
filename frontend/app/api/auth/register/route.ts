import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { firstName, lastName, username, email, password, confirmPassword } =
      body

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          message: 'Password must be at least 8 characters long',
        },
        { status: 400 }
      )
    }

    // Check for password complexity
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)

    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Password must contain uppercase, lowercase, number, and special character',
        },
        { status: 400 }
      )
    }

    // Validate username format (basic validation)
    if (username.length < 3 || username.length > 30) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username must be between 3 and 30 characters',
        },
        { status: 400 }
      )
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return NextResponse.json(
        {
          success: false,
          message:
            'Username can only contain letters, numbers, underscores, and hyphens',
        },
        { status: 400 }
      )
    }

    // Forward the request to the backend API
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    const response = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        username,
        firstName,
        lastName,
        confirmPassword,
      }),
    })
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Registration failed' },
        { status: response.status }
      )
    }

    // Return the successful response
    return NextResponse.json(data)
  } catch (error) {
    console.error('Registration API error:', error)
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error. Please try again later.',
      },
      { status: 500 }
    )
  }
}
