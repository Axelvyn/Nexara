'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Mail, ArrowLeft, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import { apiService } from '@/lib/api'
import { authManager } from '@/lib/auth'
import { useToastMessage } from '@/hooks/useToastMessage'

export default function VerifyEmailPage() {
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
    <main className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 via-emerald-900/20 to-black" />

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400 rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.6, 0.2, 0.6],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl border-slate-700/50 shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="mx-auto w-16 h-16 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl flex items-center justify-center"
              >
                <Mail className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <CardTitle className="text-2xl font-bold text-white mb-2">
                  Verify Your Email
                </CardTitle>
                <CardDescription className="text-slate-300">
                  We've sent a 6-digit verification code to{' '}
                  <span className="text-emerald-400 font-medium">{email}</span>
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="otp"
                    className="text-slate-300 text-sm font-medium"
                  >
                    Verification Code
                  </Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={e => handleOtpInput(e.target.value)}
                    className="text-center text-2xl font-mono tracking-widest bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 transition-all duration-200"
                    maxLength={6}
                    autoComplete="one-time-code"
                    required
                  />
                  <p className="text-xs text-slate-400 text-center">
                    Enter the 6-digit code from your email
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      />
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Verify Email
                    </div>
                  )}
                </Button>
              </form>

              {/* Resend Section */}
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  Didn't receive the code?
                </div>

                {countdown > 0 ? (
                  <p className="text-sm text-slate-500">
                    Resend available in {countdown} seconds
                  </p>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all duration-200"
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
                        >
                          <RefreshCw className="w-4 h-4" />
                        </motion.div>
                        Sending...
                      </div>
                    ) : (
                      'Resend Code'
                    )}
                  </Button>
                )}
              </div>

              {/* Back to Signup */}
              <div className="text-center pt-4 border-t border-slate-700/50">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-400 transition-colors duration-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Signup
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </main>
  )
}
