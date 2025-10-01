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
  ListFilter,
  BarChart3,
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
import { CreateIssueModal } from '@/components/create-issue-modal'

interface ProjectStats {
  totalBoards: number
  totalColumns: number
  projectCreated: string
  lastUpdated: string
}

interface IssueStats {
  totalIssues: number
  issuesByStatus: Array<{
    status: string
    _count: { status: number }
  }>
}

export default function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [project, setProject] = useState<Project | null>(null)
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null)
  const [issueStats, setIssueStats] = useState<IssueStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [backRoute, setBackRoute] = useState<string>('/projects')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [defaultColumnId, setDefaultColumnId] = useState<string | null>(null)
  const [isSettingUpBoard, setIsSettingUpBoard] = useState(false)
  const router = useRouter()
  const toast = useToastMessage()

  const createDefaultBoard = async () => {
    if (!project) return

    setIsSettingUpBoard(true)
    try {
      const setupResponse = await fetch(
        `/api/projects/${project.id}/setup-default-board`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('nexara_auth_token')}`,
          },
        }
      )

      if (setupResponse.ok) {
        toast.success(
          'Success',
          'Default board created! You can now create issues.'
        )
        // Reload the project data to get the new board
        await loadProject()
      } else {
        const error = await setupResponse.json()
        toast.error('Error', error.message || 'Failed to create default board')
      }
    } catch (error) {
      console.error('Error creating default board:', error)
      toast.error('Error', 'Failed to create default board')
    } finally {
      setIsSettingUpBoard(false)
    }
  }

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

      // Fetch issue stats
      try {
        const issueStatsResponse = await fetch('/api/issues/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('nexara_auth_token')}`,
          },
        })
        if (issueStatsResponse.ok) {
          const issueStatsData = await issueStatsResponse.json()
          setIssueStats(issueStatsData.data.stats)
        }
      } catch (issueStatsError) {
        console.error('Error fetching issue stats:', issueStatsError)
      }

      // Get default column for creating issues
      try {
        const boardsResponse = await apiService.getBoardsByProject(projectId)
        console.log('Boards response:', boardsResponse)

        if (boardsResponse.data.boards.length === 0) {
          // No boards exist, create a default board
          console.log('No boards found, creating default board...')
          try {
            const setupResponse = await fetch(
              `/api/projects/${projectId}/setup-default-board`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${localStorage.getItem('nexara_auth_token')}`,
                },
              }
            )

            if (setupResponse.ok) {
              console.log('Default board created successfully')
              // Retry fetching boards
              const retryBoardsResponse =
                await apiService.getBoardsByProject(projectId)
              if (retryBoardsResponse.data.boards.length > 0) {
                const firstBoard = retryBoardsResponse.data.boards[0]
                const boardResponse = await apiService.getBoard(firstBoard.id)
                if (
                  boardResponse.data.board.columns &&
                  boardResponse.data.board.columns.length > 0
                ) {
                  const firstColumnId = boardResponse.data.board.columns[0].id
                  console.log(
                    'Setting default column ID after creation:',
                    firstColumnId
                  )
                  setDefaultColumnId(firstColumnId)
                }
              }
            } else {
              console.error(
                'Failed to create default board:',
                await setupResponse.text()
              )
            }
          } catch (setupError) {
            console.error('Error creating default board:', setupError)
          }
        } else {
          // Boards exist, use the first one
          const firstBoard = boardsResponse.data.boards[0]
          console.log('First board:', firstBoard)
          const boardResponse = await apiService.getBoard(firstBoard.id)
          console.log('Board details:', boardResponse)
          if (
            boardResponse.data.board.columns &&
            boardResponse.data.board.columns.length > 0
          ) {
            const firstColumnId = boardResponse.data.board.columns[0].id
            console.log('Setting default column ID:', firstColumnId)
            setDefaultColumnId(firstColumnId)
          }
        }
      } catch (boardError) {
        console.error('Error fetching boards for default column:', boardError)
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
                  {!defaultColumnId ? (
                    <div className="grid grid-cols-1 gap-4">
                      <div className="text-center p-6 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                        <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                          Setup Required
                        </h3>
                        <p className="text-yellow-300 mb-4">
                          This project needs a board to organize issues. Create
                          a default board to get started.
                        </p>
                        <Button
                          onClick={createDefaultBoard}
                          disabled={isSettingUpBoard}
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                        >
                          {isSettingUpBoard ? (
                            <>
                              <Clock className="w-5 h-5 mr-2 animate-spin" />
                              Setting up...
                            </>
                          ) : (
                            <>
                              <Plus className="w-5 h-5 mr-2" />
                              Setup Default Board
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        onClick={() =>
                          router.push(`/projects/${project.id}/issues`)
                        }
                        className="h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold"
                      >
                        <ListFilter className="w-5 h-5 mr-2" />
                        Manage Issues
                      </Button>
                      <Button
                        onClick={() => {
                          console.log(
                            'Create Issue clicked, defaultColumnId:',
                            defaultColumnId
                          )
                          if (defaultColumnId) {
                            setShowCreateModal(true)
                          } else {
                            toast.error(
                              'Error',
                              'Please create a board and column first before adding issues'
                            )
                          }
                        }}
                        disabled={!defaultColumnId}
                        className="h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-black font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        title={
                          !defaultColumnId
                            ? 'Create a board first to add issues'
                            : 'Create a new issue'
                        }
                      >
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
                  )}
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
                    Issue Overview
                  </h2>
                  {issueStats && issueStats.totalIssues > 0 ? (
                    <div className="space-y-4">
                      <div className="text-center p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20">
                        <div className="text-2xl font-bold text-white mb-1">
                          {issueStats.totalIssues}
                        </div>
                        <div className="text-sm text-slate-400">
                          Total Issues
                        </div>
                      </div>

                      {issueStats.issuesByStatus.map(statusItem => (
                        <div
                          key={statusItem.status}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50"
                        >
                          <span className="text-slate-300 capitalize">
                            {statusItem.status.replace('_', ' ').toLowerCase()}
                          </span>
                          <span className="text-white font-semibold">
                            {statusItem._count.status}
                          </span>
                        </div>
                      ))}

                      <Button
                        onClick={() =>
                          router.push(`/projects/${project.id}/issues`)
                        }
                        variant="outline"
                        className="w-full border-slate-700 text-slate-300 hover:bg-slate-800/50"
                      >
                        <ListFilter className="w-4 h-4 mr-2" />
                        View All Issues
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400 mb-4">No issues yet</p>
                      {defaultColumnId ? (
                        <Button
                          onClick={() => setShowCreateModal(true)}
                          className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-black font-semibold"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Issue
                        </Button>
                      ) : (
                        <Button
                          onClick={createDefaultBoard}
                          disabled={isSettingUpBoard}
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                        >
                          {isSettingUpBoard ? (
                            <>
                              <Clock className="w-4 h-4 mr-2 animate-spin" />
                              Setting up...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Setup Board First
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Recent Activity */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
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
                      <span className="text-white font-semibold">
                        {issueStats?.totalIssues || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Boards</span>
                      <span className="text-white font-semibold">
                        {projectStats?.totalBoards || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Columns</span>
                      <span className="text-white font-semibold">
                        {projectStats?.totalColumns || 0}
                      </span>
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

        {/* Create Issue Modal */}
        <CreateIssueModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          columnId={defaultColumnId || undefined}
          onIssueCreated={() => {
            setShowCreateModal(false)
            loadProject() // Reload to update stats
            toast.success(
              'Success',
              'Issue created successfully! Go to Issues page to manage it.'
            )
          }}
        />
      </div>
    </ProtectedRoute>
  )
}
