'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { Mail, ArrowLeft, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { apiService } from '@/lib/api'
import { authManager } from '@/lib/auth'
import { useToastMessage } from '@/hooks/useToastMessage'

function VerifyEmailContent() {
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [email, setEmail] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToastMessage()

  useEffect(() => {
    // Get email from URL params
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    } else {
      // Redirect to signup if no email provided
      router.push('/signup')
    }
  }, [searchParams, router])

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp || otp.length !== 6) {
      toast.error('Error', 'Please enter a valid 6-digit code')
      return
    }

    if (!email) {
      toast.error('Error', 'Email not found. Please try signing up again.')
      return
    }

    setIsLoading(true)

    try {
      const response = await apiService.verifyEmail({ email, otp })

      // Store auth tokens and user data
      authManager.login(
        response.data.token,
        response.data.user,
        response.data.refreshToken
      )

      toast.success(
        'Success!',
        'Email verified successfully. Welcome to Nexara!'
      )

      // Redirect to dashboard
      setTimeout(() => {
        router.push('/userdashboard')
      }, 1000)
    } catch (error) {
      console.error('Verification error:', error)
      toast.error(
        'Error',
        error instanceof Error ? error.message : 'Invalid or expired code'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendOTP = async () => {
    if (!email) {
      toast.error('Error', 'Email not found. Please try signing up again.')
      return
    }

    setIsResending(true)

    try {
      await apiService.resendOTP({ email })
      toast.success('Success', 'Verification code sent successfully!')
      setCountdown(60) // 60 seconds cooldown
    } catch (error) {
      console.error('Resend error:', error)
      toast.error(
        'Error',
        error instanceof Error ? error.message : 'Failed to resend code'
      )
    } finally {
      setIsResending(false)
    }
  }

  const handleOtpInput = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    setOtp(numericValue)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 shadow-2xl shadow-emerald-500/25">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-blue-500/10" />

            <div className="relative z-10 p-8">
              {/* Header */}
              <div className="text-center space-y-6 mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25"
                >
                  <Mail className="w-10 h-10 text-white" />
                </motion.div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3">
                    Verify Your Email
                  </h1>
                  <p className="text-slate-300 leading-relaxed">
                    We&apos;ve sent a 6-digit verification code to{' '}
                    <span className="text-emerald-400 font-semibold">
                      {email}
                    </span>
                  </p>
                </div>
              </div>
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="otp"
                    className="text-slate-300 text-lg font-medium"
                  >
                    Verification Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={e => handleOtpInput(e.target.value)}
                    className="h-16 text-center text-3xl font-mono tracking-widest bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 rounded-xl backdrop-blur-sm transition-all duration-200"
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                  />
                  <p className="text-sm text-slate-400 text-center">
                    Enter the 6-digit code from your email
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full h-14 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-bold text-lg rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-emerald-500/25"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="w-5 h-5 border-2 border-black border-t-transparent rounded-full"
                      />
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5" />
                      Verify Email
                    </div>
                  )}
                </Button>
              </form>

              {/* Resend Section */}
              <div className="mt-8 text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  Didn&apos;t receive the code?
                </div>

                {countdown > 0 ? (
                  <p className="text-sm text-slate-500">
                    Resend available in{' '}
                    <span className="text-emerald-400 font-semibold">
                      {countdown}
                    </span>{' '}
                    seconds
                  </p>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-200 rounded-xl"
                  >
                    {isResending ? (
                      <div className="flex items-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                          className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full"
                        />
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Resend Code
                      </div>
                    )}
                  </Button>
                )}
              </div>

              {/* Back to Login */}
              <div className="mt-8 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
          {/* Additional Help */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 backdrop-blur-sm border border-slate-700/30"
          >
            <div className="text-center space-y-3">
              <h3 className="text-slate-300 font-semibold">Need Help?</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Check your spam folder or try resending the code. If you
                continue to have issues, please contact our support team.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
