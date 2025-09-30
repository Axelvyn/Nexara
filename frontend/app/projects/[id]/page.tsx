'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Settings,
  Users,
  Plus,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  FolderOpen,
} from 'lucide-react'
import { apiService, type Project } from '@/lib/api'
import { useToastMessage } from '@/hooks/useToastMessage'
import { ProtectedRoute } from '@/components/protected-route'
import { PageLoading } from '@/components/ui/page-loading'
import { addToRecentProjects } from '@/lib/recentProjects'
import {
  addToNavigationHistory,
  getSmartBackRoute,
} from '@/lib/navigationHistory'
import { formatTimeAgo } from '@/lib/timeUtils'

interface ProjectStats {
  totalBoards: number
  totalColumns: number
  projectCreated: string
  lastUpdated: string
}

export default function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [project, setProject] = useState<Project | null>(null)
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [backRoute, setBackRoute] = useState<string>('/projects')
  const router = useRouter()
  const toast = useToastMessage()

  const loadProject = useCallback(async () => {
    try {
      setIsLoading(true)
      const resolvedParams = await params
      const projectId = resolvedParams.id

      const response = await apiService.getProject(projectId)
      setProject(response.data.project)

      // Fetch project stats
      try {
        const statsResponse = await fetch(`/api/projects/${projectId}/stats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('nexara_auth_token')}`,
          },
        })
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setProjectStats(statsData.data.stats)
        }
      } catch (statsError) {
        console.error('Error fetching project stats:', statsError)
      }

      // Add to recent projects
      addToRecentProjects({
        id: response.data.project.id,
        name: response.data.project.name,
        description: response.data.project.description,
      })

      // Track navigation to this project
      addToNavigationHistory(
        `/projects/${projectId}`,
        response.data.project.name
      )

      // Determine smart back route
      const smartBack = getSmartBackRoute(`/projects/${projectId}`, '/projects')
      setBackRoute(smartBack)
    } catch (error) {
      console.error('Error loading project:', error)
      if (error instanceof Error) {
        setError(error.message)
        toast.error('Error', `Failed to load project: ${error.message}`)
      } else {
        setError('Failed to load project')
        toast.error('Error', 'Failed to load project')
      }
    } finally {
      setIsLoading(false)
    }
  }, [params])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  if (isLoading) {
    return <PageLoading message="Loading project..." />
  }

  if (error || !project) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          </div>

          <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3">
                  Project Not Found
                </h1>
                <p className="text-slate-400 text-lg mb-6">
                  {error ||
                    "The project you're looking for doesn't exist or you don't have access to it."}
                </p>
                <Button
                  onClick={() => router.push(getSmartBackRoute('/projects'))}
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-black font-semibold"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {getSmartBackRoute('/projects') === '/userdashboard'
                    ? 'Back to Dashboard'
                    : 'Back to Projects'}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.push(backRoute)}
              className="text-slate-400 hover:text-white mb-6 p-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {backRoute === '/userdashboard'
                ? 'Back to Dashboard'
                : 'Back to Projects'}
            </Button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <FolderOpen className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {project.name}
                  </h1>
                  {project.description && (
                    <p className="text-slate-400 text-lg mt-2">
                      {project.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Members
                </Button>
                <Button
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Project Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl border border-slate-700/30 shadow-2xl shadow-cyan-500/25"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5" />
                <div className="relative z-10 p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Quick Actions
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button className="h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-semibold">
                      <Plus className="w-5 h-5 mr-2" />
                      Create Issue
                    </Button>
                    <Button
                      variant="outline"
                      className="h-16 border-slate-700 text-slate-300 hover:bg-slate-800/50"
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      View Boards
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl border border-slate-700/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
                <div className="relative z-10 p-6">
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Recent Activity
                  </h2>
                  <div className="space-y-4">
                    {projectStats && (
                      <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                        <div className="flex-1">
                          <p className="text-slate-300">Project created</p>
                          <p className="text-sm text-slate-500">
                            {formatTimeAgo(projectStats.projectCreated)}
                          </p>
                        </div>
                      </div>
                    )}
                    {projectStats &&
                      projectStats.lastUpdated !==
                        projectStats.projectCreated && (
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50">
                          <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          <div className="flex-1">
                            <p className="text-slate-300">Project updated</p>
                            <p className="text-sm text-slate-500">
                              {formatTimeAgo(projectStats.lastUpdated)}
                            </p>
                          </div>
                        </div>
                      )}
                    <div className="text-center py-8 text-slate-500">
                      No recent activity yet. Start by creating some issues or
                      boards!
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Project Stats */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl border border-slate-700/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5" />
                <div className="relative z-10 p-6">
                  <h3 className="text-xl font-bold text-white mb-6">
                    Project Stats
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Issues</span>
                      <span className="text-white font-semibold">0</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Boards</span>
                      <span className="text-white font-semibold">1</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Members</span>
                      <span className="text-white font-semibold">1</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Created</span>
                      <span className="text-white font-semibold">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Project Members */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl border border-slate-700/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
                <div className="relative z-10 p-6">
                  <h3 className="text-xl font-bold text-white mb-6">
                    Project Members
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {project.owner?.username?.[0]?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {project.owner?.username || 'Unknown User'}
                        </p>
                        <p className="text-sm text-slate-400">Owner</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-slate-700 text-slate-300 hover:bg-slate-800/50"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Invite Members
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
