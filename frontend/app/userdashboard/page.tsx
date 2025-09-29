'use client'

import { useState, useEffect } from 'react'
import { PageLoading, ContentLoading } from '@/components/ui/page-loading'
import { Loading } from '@/components/ui/loading'
import Threads from '@/app/landingpage/components/Threads'
import { ProtectedRoute } from '@/components/protected-route'
import { useToastMessage } from '@/hooks/useToastMessage'
import { authManager } from '@/lib/auth'
import { apiService } from '@/lib/api'

export default function UserDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const showToast = useToastMessage()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const authState = authManager.getAuthState()
        if (!authState.token) {
          setError('No authentication token found')
          setIsLoading(false)
          return
        }

        // Fetch user profile from API
        const profileResponse = await apiService.getProfile()
        setUserData({
          name:
            profileResponse.data.user.username ||
            profileResponse.data.user.email,
          email: profileResponse.data.user.email,
          projects: [
            { id: 1, name: 'Project Alpha', status: 'active' },
            { id: 2, name: 'Project Beta', status: 'completed' },
            { id: 3, name: 'Project Gamma', status: 'pending' },
          ],
        })
      } catch (error) {
        console.error('Error loading user data:', error)
        setError('Failed to load user data')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [])

  if (isLoading) {
    return <PageLoading message="Loading your dashboard..." />
  }

  if (error) {
    return (
      <main className="bg-black min-h-screen relative">
        <div className="fixed inset-0 w-full h-full z-0">
          <Threads amplitude={1} distance={0} enableMouseInteraction={true} />
        </div>
        <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
          <div className="bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-md border border-white/15 rounded-2xl p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Error Loading Dashboard
            </h1>
            <p className="text-white/70 mb-6">{error}</p>
            <button
              onClick={() => (window.location.href = '/login')}
              className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
            >
              Back to Login
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <ProtectedRoute>
      <main className="bg-black min-h-screen relative">
        <div className="fixed inset-0 w-full h-full z-0">
          <Threads amplitude={1} distance={0} enableMouseInteraction={true} />
        </div>
        <div className="relative z-10">
          <div className="container mx-auto px-6 py-8">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    Welcome back, {userData?.name}
                  </h1>
                  <p className="text-white/70">
                    Here&apos;s what&apos;s happening with your projects
                  </p>
                </div>
                <button
                  onClick={() => {
                    showToast.success(
                      'Logged out successfully',
                      'Come back soon!'
                    )
                    setTimeout(() => {
                      authManager.logout()
                      window.location.href = '/login'
                    }, 1000)
                  }}
                  className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl hover:bg-white/20 transition-all duration-300"
                >
                  Logout
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-md border border-white/15 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Active Projects</p>
                      <p className="text-3xl font-bold text-white">3</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-md border border-white/15 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">Completed</p>
                      <p className="text-3xl font-bold text-white">12</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-md border border-white/15 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white/60 text-sm">In Progress</p>
                      <p className="text-3xl font-bold text-white">5</p>
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Projects Section */}
              <div className="bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-md border border-white/15 rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Your Projects
                  </h2>
                  <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300">
                    + New Project
                  </button>
                </div>

                <div className="space-y-4">
                  {userData?.projects.map((project: any) => (
                    <div
                      key={project.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-semibold">
                            {project.name}
                          </h3>
                          <p className="text-white/60 text-sm">
                            Last updated 2 hours ago
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              project.status === 'active'
                                ? 'bg-green-500/20 text-green-400'
                                : project.status === 'completed'
                                  ? 'bg-blue-500/20 text-blue-400'
                                  : 'bg-orange-500/20 text-orange-400'
                            }`}
                          >
                            {project.status}
                          </span>
                          <button className="text-white/60 hover:text-white transition-colors">
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  )
}
