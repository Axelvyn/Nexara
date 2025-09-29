'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageLoading } from '@/components/ui/page-loading'
import { Button } from '@/components/ui/button'
import { ProtectedRoute } from '@/components/protected-route'
import { useToastMessage } from '@/hooks/useToastMessage'
import { authManager } from '@/lib/auth'
import { apiService, type Project } from '@/lib/api'
import { getRecentProjects, type RecentProject } from '@/lib/recentProjects'
import { addToNavigationHistory } from '@/lib/navigationHistory'
import { motion } from 'framer-motion'
import {
  Plus,
  Folder,
  Users,
  ArrowRight,
  FolderOpen,
  LogOut,
  Sparkles,
  TrendingUp,
  Calendar,
  Clock,
} from 'lucide-react'

export default function UserDashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [error, setError] = useState<string | null>(null)
  const toast = useToastMessage()
  const router = useRouter()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const authState = authManager.getAuthState()
        if (!authState.token) {
          console.log('No auth token found, redirecting to login')
          router.push('/login')
          return
        }

        console.log('Loading user profile...')

        // Fetch user profile first
        const profileResponse = await apiService.getProfile()
        console.log('Profile response:', profileResponse)

        setUserData({
          name:
            profileResponse.data.user.username ||
            profileResponse.data.user.email,
          email: profileResponse.data.user.email,
          user: profileResponse.data.user,
        })

        console.log('Loading projects...')

        // Try to fetch projects, but don&apos;t fail if it doesn&apos;t work
        try {
          const projectsResponse = await apiService.getProjects({ limit: 5 })
          console.log('Projects response:', projectsResponse)
          setProjects(projectsResponse.data.projects)
        } catch (projectError) {
          console.error('Error loading projects:', projectError)
          // Set empty projects array and continue
          setProjects([])
        }

        // Load recent projects from localStorage
        const recent = getRecentProjects()
        setRecentProjects(recent)

        // Track navigation to dashboard
        addToNavigationHistory('/userdashboard', 'Dashboard')
      } catch (error) {
        console.error('Error loading user data:', error)

        // Check if it's an authentication error
        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase()
          if (
            errorMessage.includes('not authorized') ||
            errorMessage.includes('token failed') ||
            errorMessage.includes('unauthorized') ||
            errorMessage.includes('401')
          ) {
            console.log(
              'Authentication failed, clearing session and redirecting to login'
            )
            authManager.logout()
            toast.error('Session Expired', 'Please log in again')
            router.push('/login')
            return
          }
          setError(`Failed to load user data: ${error.message}`)
        } else {
          setError('Failed to load user data')
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadUserData()
  }, [router, toast])

  if (isLoading) {
    return <PageLoading message="Loading your dashboard..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 backdrop-blur-sm">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Error Loading Dashboard
            </h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <Button
              onClick={() => (window.location.href = '/login')}
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-black font-semibold w-full"
            >
              Back to Login
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  const stats = [
    {
      label: 'Projects',
      value: projects.length,
      icon: Folder,
      gradient: 'from-cyan-500 to-blue-500',
      bgGradient: 'from-cyan-500/10 to-blue-500/10',
      borderGradient: 'from-cyan-500/30 to-blue-500/30',
    },
    {
      label: 'Team Members',
      value: projects.reduce(
        (total, project) => total + project._count.members,
        0
      ),
      icon: Users,
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-500/10 to-teal-500/10',
      borderGradient: 'from-emerald-500/30 to-teal-500/30',
    },
    {
      label: 'Active Boards',
      value: projects.reduce(
        (total, project) => total + project._count.boards,
        0
      ),
      icon: FolderOpen,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-500/10 to-pink-500/10',
      borderGradient: 'from-purple-500/30 to-pink-500/30',
    },
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 border-b border-slate-800/50 backdrop-blur-sm"
        >
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                  Welcome back, {userData?.name}
                </h1>
                <p className="text-slate-400 mt-1">
                  Here&apos;s what&apos;s happening with your projects
                </p>
              </div>
              <Button
                onClick={() => {
                  toast.success('Logged out successfully', 'Come back soon!')
                  setTimeout(() => {
                    authManager.logout()
                    window.location.href = '/login'
                  }, 1000)
                }}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800/50 backdrop-blur-sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative group overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgGradient} border border-gradient-to-r ${stat.borderGradient} backdrop-blur-sm`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <TrendingUp className="w-5 h-5 text-slate-400 group-hover:text-slate-300 transition-colors" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-slate-400 text-sm">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Projects Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Section Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Recently Viewed Projects
                </h2>
                <p className="text-slate-400">
                  Quick access to your most recent projects
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => router.push('/projects')}
                  className="border-slate-700 text-slate-300 hover:bg-slate-800/50 backdrop-blur-sm"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  View All Projects
                </Button>
                <Button
                  onClick={() => router.push('/projects/new')}
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-black font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </div>
            </div>

            {/* Projects List */}
            {projects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-slate-800 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FolderOpen className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  No projects yet
                </h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                  Get started by creating your first project to organize your
                  work and collaborate with your team
                </p>
                <Button
                  onClick={() => router.push('/projects/new')}
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-black font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Project
                </Button>
              </motion.div>
            ) : recentProjects.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gradient-to-r from-slate-800 to-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  No recent projects
                </h3>
                <p className="text-slate-400 mb-8 max-w-md mx-auto">
                  You haven&apos;t viewed any projects recently. Visit a project to
                  see it appear here
                </p>
                <Button
                  onClick={() => router.push('/projects')}
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-black font-semibold"
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  View All Projects
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-4">
                {recentProjects.slice(0, 4).map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <Folder className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors">
                              {project.name}
                            </h3>
                            <p className="text-slate-400 text-sm mt-1">
                              {project.description ||
                                'No description available'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-4 h-4" />
                              <span>
                                Viewed{' '}
                                {new Date(
                                  project.viewedAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {recentProjects.length > 4 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center pt-6"
                  >
                    <Button
                      variant="outline"
                      onClick={() => router.push('/projects')}
                      className="border-slate-600 text-slate-300 hover:bg-slate-700/50 backdrop-blur-sm"
                    >
                      View All Projects
                    </Button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
