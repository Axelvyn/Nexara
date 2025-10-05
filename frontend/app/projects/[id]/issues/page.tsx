'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import {
  ArrowLeft,
  Plus,
  Layers,
  Grid3x3,
  ListFilter,
  BarChart3,
} from 'lucide-react'
import { apiService, type Project, type Board } from '@/lib/api'
import { useToastMessage } from '@/hooks/useToastMessage'
import { ProtectedRoute } from '@/components/protected-route'
import { PageLoading } from '@/components/ui/page-loading'
import { IssueList } from '@/components/issue-list'
import { IssueStatsWidget } from '@/components/issue-stats-widget'
import { CreateIssueModal } from '@/components/create-issue-modal'
import {
  addToNavigationHistory,
  getSmartBackRoute,
} from '@/lib/navigationHistory'

export default function ProjectIssues({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const [project, setProject] = useState<Project | null>(null)
  const [boards, setBoards] = useState<Board[]>([])
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null)
  const [selectedColumn, setSelectedColumn] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backRoute, setBackRoute] = useState<string>('/projects')
  const router = useRouter()
  const toast = useToastMessage()

  const loadProjectData = useCallback(async () => {
    try {
      setIsLoading(true)
      const resolvedParams = await params
      const projectId = resolvedParams.id

      // Load project details
      const projectResponse = await apiService.getProject(projectId)
      setProject(projectResponse.data.project)

      // Load boards for the project
      const boardsResponse = await apiService.getBoardsByProject(projectId)
      setBoards(boardsResponse.data.boards)

      // Select first board by default
      if (boardsResponse.data.boards.length > 0) {
        const firstBoard = boardsResponse.data.boards[0]
        setSelectedBoard(firstBoard)

        // Load board details to get columns
        const boardResponse = await apiService.getBoard(firstBoard.id)
        if (
          boardResponse.data.board.columns &&
          boardResponse.data.board.columns.length > 0
        ) {
          setSelectedColumn(boardResponse.data.board.columns[0].id)
        }
      }

      // Track navigation
      addToNavigationHistory(
        `/projects/${projectId}/issues`,
        `${projectResponse.data.project.name} - Issues`
      )

      // Determine smart back route
      const smartBack = getSmartBackRoute(
        `/projects/${projectId}/issues`,
        `/projects/${projectId}`
      )
      setBackRoute(smartBack)
    } catch (error) {
      console.error('Error loading project data:', error)
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
    loadProjectData()
  }, [loadProjectData])

  const handleBoardChange = async (board: Board) => {
    setSelectedBoard(board)
    setSelectedColumn(null)

    try {
      // Load board details to get columns
      const boardResponse = await apiService.getBoard(board.id)
      if (
        boardResponse.data.board.columns &&
        boardResponse.data.board.columns.length > 0
      ) {
        setSelectedColumn(boardResponse.data.board.columns[0].id)
      }
    } catch (error) {
      console.error('Error loading board details:', error)
      toast.error('Error', 'Failed to load board details')
    }
  }

  if (isLoading) {
    return <PageLoading message="Loading project issues..." />
  }

  if (error || !project) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" />
          </div>
          <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <h1 className="text-3xl font-bold text-white">
                Project Not Found
              </h1>
              <p className="text-slate-400">
                {error || 'The project could not be loaded.'}
              </p>
              <Button onClick={() => router.push(backRoute)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
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
              Back to Project
            </Button>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <ListFilter className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                    {project.name} Issues
                  </h1>
                  <p className="text-slate-400 text-lg mt-2">
                    Manage and track project issues
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowCreateModal(true)}
                  disabled={!selectedColumn}
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-black font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Issue
                </Button>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Board Selector */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl border border-slate-700/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5" />
                <div className="relative z-10 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Boards
                  </h3>
                  {boards.length === 0 ? (
                    <p className="text-slate-400 text-sm">
                      No boards available
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {boards.map(board => (
                        <button
                          key={board.id}
                          onClick={() => handleBoardChange(board)}
                          className={`w-full text-left p-3 rounded-xl transition-all ${
                            selectedBoard?.id === board.id
                              ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-white border border-cyan-500/30'
                              : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                          }`}
                        >
                          <div className="font-medium">{board.name}</div>
                          {board.description && (
                            <div className="text-sm text-slate-400 mt-1">
                              {board.description}
                            </div>
                          )}
                          <div className="text-xs text-slate-500 mt-1">
                            {board._count?.columns || 0} columns
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Column Selector */}
              {selectedBoard && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl border border-slate-700/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5" />
                  <div className="relative z-10 p-6">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <Grid3x3 className="w-5 h-5" />
                      Columns
                    </h3>
                    {selectedBoard.columns &&
                    selectedBoard.columns.length > 0 ? (
                      <div className="space-y-2">
                        {selectedBoard.columns.map(column => (
                          <button
                            key={column.id}
                            onClick={() => setSelectedColumn(column.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all ${
                              selectedColumn === column.id
                                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30'
                                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                            }`}
                          >
                            <div className="font-medium">{column.name}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {column._count?.issues || 0} issues
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-400 text-sm">
                        No columns available
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Issue Stats */}
              <IssueStatsWidget />
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <IssueList
                  columnId={selectedColumn || undefined}
                  projectId={project.id}
                  showCreateButton={false}
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Create Issue Modal */}
        <CreateIssueModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          columnId={selectedColumn || undefined}
          onIssueCreated={() => {
            // Refresh the issue list by re-rendering the IssueList component
            window.location.reload()
          }}
        />
      </div>
    </ProtectedRoute>
  )
}
