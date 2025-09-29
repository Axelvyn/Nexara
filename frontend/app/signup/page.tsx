'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowRight,
  Zap,
  CheckCircle,
} from 'lucide-react'
import { authManager } from '@/lib/auth'
import { useToastMessage } from '@/hooks/useToastMessage'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [passwordValidation, setPasswordValidation] = useState({
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    hasMinLength: false,
  })
  const [usernameStatus, setUsernameStatus] = useState<{
    isChecking: boolean
    isAvailable: boolean | null
    message: string
  }>({
    isChecking: false,
    isAvailable: null,
    message: '',
  })
  const [emailStatus, setEmailStatus] = useState<{
    isChecking: boolean
    isAvailable: boolean | null
    message: string
  }>({
    isChecking: false,
    isAvailable: null,
    message: '',
  })
  const router = useRouter()
  const toast = useToastMessage()

  // Password validation function
  const validatePassword = (password: string) => {
    const validation = {
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      hasMinLength: password.length >= 8,
    }
    setPasswordValidation(validation)
    return Object.values(validation).every(Boolean)
  }

  // Username availability check with debouncing
  const checkUsernameAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameStatus({ isChecking: false, isAvailable: null, message: '' })
      return
    }

    // Basic format validation
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        message:
          'Username can only contain letters, numbers, underscores, and hyphens',
      })
      return
    }

    setUsernameStatus({
      isChecking: true,
      isAvailable: null,
      message: 'Checking availability...',
    })

    try {
      const response = await fetch(
        `/api/auth/check-username/${encodeURIComponent(username)}`
      )
      const data = await response.json()

      setUsernameStatus({
        isChecking: false,
        isAvailable: data.available,
        message: data.message,
      })
    } catch (error) {
      setUsernameStatus({
        isChecking: false,
        isAvailable: false,
        message: 'Error checking username availability',
      })
    }
  }

  // Email availability check with debouncing
  const checkEmailAvailability = async (email: string) => {
    if (!email) {
      setEmailStatus({ isChecking: false, isAvailable: null, message: '' })
      return
    }

    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setEmailStatus({
        isChecking: false,
        isAvailable: false,
        message: 'Please provide a valid email address',
      })
      return
    }

    setEmailStatus({
      isChecking: true,
      isAvailable: null,
      message: 'Checking availability...',
    })

    try {
      const response = await fetch(
        `/api/auth/check-email/${encodeURIComponent(email)}`
      )
      const data = await response.json()

      setEmailStatus({
        isChecking: false,
        isAvailable: data.available,
        message: data.message,
      })
    } catch (error) {
      setEmailStatus({
        isChecking: false,
        isAvailable: false,
        message: 'Error checking email availability',
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.username ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error('Error', 'Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Error', 'Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Error', 'Password must be at least 8 characters long')
      return
    }

    if (!validatePassword(formData.password)) {
      toast.error(
        'Error',
        'Password must contain uppercase, lowercase, number, and special character'
      )
      return
    }

    if (formData.username.length < 3 || formData.username.length > 30) {
      toast.error('Error', 'Username must be between 3 and 30 characters')
      return
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      toast.error(
        'Error',
        'Username can only contain letters, numbers, underscores, and hyphens'
      )
      return
    }

    if (usernameStatus.isAvailable === false) {
      toast.error(
        'Error',
        'Username is not available. Please choose a different one.'
      )
      return
    }

    if (usernameStatus.isChecking) {
      toast.error('Error', 'Please wait while we check username availability')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      toast.error('Error', 'Please provide a valid email address')
      return
    }

    if (emailStatus.isAvailable === false) {
      toast.error(
        'Error',
        'Email is already registered. Please use a different email or try logging in.'
      )
      return
    }

    if (emailStatus.isChecking) {
      toast.error('Error', 'Please wait while we check email availability')
      return
    }

    if (!agreedToTerms) {
      toast.error('Error', 'Please agree to the terms and conditions')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(
          'Registration Failed',
          data.message || 'Failed to create account'
        )
        return
      }

      if (data.success && data.data) {
        if (data.data.requiresEmailVerification) {
          // User needs to verify email first
          toast.success(
            'Account Created!',
            'Please check your email for verification code'
          )

          // Redirect to email verification page
          router.push(
            `/verify-email?email=${encodeURIComponent(formData.email)}`
          )
        } else {
          // Old flow for backward compatibility (if email verification is disabled)
          authManager.login(
            data.data.token,
            data.data.user,
            data.data.refreshToken
          )

          toast.success('Account Created', 'Welcome to Nexara!')
          router.push('/userdashboard')
        }
      } else {
        toast.error('Registration Failed', 'Invalid response from server')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration Failed', 'Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Validate password in real-time
    if (field === 'password') {
      validatePassword(value)
    }

    // Check username availability with debouncing
    if (field === 'username') {
      // Clear previous timeout
      if (typeof window !== 'undefined') {
        clearTimeout((window as any).usernameTimeout)
      }

      // Set new timeout for debounced checking
      if (typeof window !== 'undefined') {
        ;(window as any).usernameTimeout = setTimeout(() => {
          checkUsernameAvailability(value)
        }, 500) // 500ms delay
      }
    }

    // Check email availability with debouncing
    if (field === 'email') {
      // Clear previous timeout
      if (typeof window !== 'undefined') {
        clearTimeout((window as any).emailTimeout)
      }

      // Set new timeout for debounced checking
      if (typeof window !== 'undefined') {
        ;(window as any).emailTimeout = setTimeout(() => {
          checkEmailAvailability(value)
        }, 500) // 500ms delay
      }
    }
  }

  return (
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 via-emerald-900/20 to-black" />

      {/* Animated Grid Pattern */}
      <motion.div
        className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
        animate={{
          backgroundPosition: ['0% 0%', '100% 100%'],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"
          animate={{
            y: [0, -30, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Header */}
      <div className="relative z-10 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center space-x-2"
          >
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/25"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.2 }}
              >
                <span className="text-black font-bold text-lg">N</span>
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                Nexara
              </span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-120px)] items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl border border-slate-700/30 shadow-2xl shadow-emerald-500/25">
            {/* Animated Border */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-cyan-500/0 opacity-0 hover:opacity-100 transition-opacity duration-500"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />

            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5" />

            <div className="relative z-10 p-8">
              {/* Header Section */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/25"
                >
                  <Zap className="w-8 h-8 text-black" />
                </motion.div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3">
                  Create your account
                </h1>
                <p className="text-slate-400">
                  Join thousands of teams using Nexara
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="firstName"
                      className="text-slate-300 text-sm font-medium"
                    >
                      First name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="First name"
                        value={formData.firstName}
                        onChange={e =>
                          handleInputChange('firstName', e.target.value)
                        }
                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="lastName"
                      className="text-slate-300 text-sm font-medium"
                    >
                      Last name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Last name"
                        value={formData.lastName}
                        onChange={e =>
                          handleInputChange('lastName', e.target.value)
                        }
                        className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-slate-300 text-sm font-medium"
                  >
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="username"
                      type="text"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={e =>
                        handleInputChange('username', e.target.value)
                      }
                      className={`pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200 ${
                        usernameStatus.isAvailable === true
                          ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                          : usernameStatus.isAvailable === false
                            ? 'border-red-500 ring-1 ring-red-500/20'
                            : ''
                      }`}
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {usernameStatus.isChecking && (
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-emerald-500 rounded-full animate-spin" />
                      )}
                      {!usernameStatus.isChecking &&
                        usernameStatus.isAvailable === true && (
                          <CheckCircle className="w-4 h-4 text-emerald-500" />
                        )}
                      {!usernameStatus.isChecking &&
                        usernameStatus.isAvailable === false && (
                          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              ✕
                            </span>
                          </div>
                        )}
                    </div>
                  </div>
                  {usernameStatus.message && (
                    <p
                      className={`text-xs mt-1 ${
                        usernameStatus.isAvailable === true
                          ? 'text-emerald-400'
                          : usernameStatus.isAvailable === false
                            ? 'text-red-400'
                            : 'text-slate-400'
                      }`}
                    >
                      {usernameStatus.message}
                    </p>
                  )}
                  <p className="text-xs text-slate-400 mt-1">
                    3-30 characters, letters, numbers, underscores, and hyphens
                    only
                  </p>
                </div>{' '}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-slate-300 text-sm font-medium"
                  >
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                      required
                    />
                  </div>
                  {emailStatus.message && (
                    <p
                      className={`text-xs mt-1 ${
                        emailStatus.isAvailable === true
                          ? 'text-emerald-400'
                          : emailStatus.isAvailable === false
                            ? 'text-red-400'
                            : 'text-slate-400'
                      }`}
                    >
                      {emailStatus.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-slate-300 text-sm font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={e =>
                        handleInputChange('password', e.target.value)
                      }
                      className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Password Requirements */}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs text-slate-400 mb-2">
                      Password requirements:
                    </p>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      <div
                        className={`flex items-center gap-2 ${passwordValidation.hasMinLength ? 'text-emerald-400' : 'text-slate-400'}`}
                      >
                        {passwordValidation.hasMinLength ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-slate-600" />
                        )}
                        At least 8 characters
                      </div>
                      <div
                        className={`flex items-center gap-2 ${passwordValidation.hasUppercase ? 'text-emerald-400' : 'text-slate-400'}`}
                      >
                        {passwordValidation.hasUppercase ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-slate-600" />
                        )}
                        One uppercase letter
                      </div>
                      <div
                        className={`flex items-center gap-2 ${passwordValidation.hasLowercase ? 'text-emerald-400' : 'text-slate-400'}`}
                      >
                        {passwordValidation.hasLowercase ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-slate-600" />
                        )}
                        One lowercase letter
                      </div>
                      <div
                        className={`flex items-center gap-2 ${passwordValidation.hasNumber ? 'text-emerald-400' : 'text-slate-400'}`}
                      >
                        {passwordValidation.hasNumber ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-slate-600" />
                        )}
                        One number
                      </div>
                      <div
                        className={`flex items-center gap-2 ${passwordValidation.hasSpecial ? 'text-emerald-400' : 'text-slate-400'}`}
                      >
                        {passwordValidation.hasSpecial ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border border-slate-600" />
                        )}
                        One special character (!@#$%^&*)
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-slate-300 text-sm font-medium"
                  >
                    Confirm password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={e =>
                        handleInputChange('confirmPassword', e.target.value)
                      }
                      className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex items-start space-x-3 pt-2">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={e => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 bg-slate-800 border-slate-700 rounded focus:ring-emerald-500/20 focus:ring-2 mt-1"
                    required
                  />
                  <Label
                    htmlFor="terms"
                    className="text-sm text-slate-300 leading-relaxed"
                  >
                    I agree to the{' '}
                    <Link
                      href="/terms"
                      className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-200"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="/privacy"
                      className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-200"
                    >
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="pt-2"
                >
                  <Button
                    type="submit"
                    disabled={isLoading || !agreedToTerms}
                    className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-semibold py-3 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                    {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </motion.div>
                <div className="text-center pt-2">
                  <p className="text-slate-400 text-sm">
                    Already have an account?{' '}
                    <Link
                      href="/login"
                      className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors duration-200"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
