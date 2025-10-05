'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Calendar,
  Plus,
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { LoadingOverlay } from '@/components/ui/loading-overlay'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useLoadingState } from '@/hooks/useLoadingState'
import { CreateBoardModal } from '@/components/create-board-modal'
import { getSmartBackRoute } from '@/lib/navigationHistory'
import { apiService, Board, BoardsResponse, Project } from '@/lib/api'

export default function ProjectBoardsPage() {
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string

  const [boards, setBoards] = useState<Board[]>([])
  const [project, setProject] = useState<Project | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const { isLoading, startLoading, stopLoading } = useLoadingState()
  const toast = useToastMessage()

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await apiService.getProject(projectId)
        setProject(data.data.project)
      } catch (error) {
        console.error('Error fetching project:', error)
      }
    }

    if (projectId) {
      fetchProject()
    }
  }, [projectId])

  // Fetch boards
  const fetchBoards = useCallback(
    async (page = 1, search = '') => {
      startLoading()
      try {
        const data = await apiService.getBoardsByProject(projectId, {
          page,
          limit: 12,
          ...(search && { search }),
        })

        setBoards(data.data.boards)
        setTotalPages(data.data.pagination.pages)
        setCurrentPage(data.data.pagination.page)
      } catch (error) {
        console.error('Error fetching boards:', error)
        toast.error('Error fetching boards')
      } finally {
        stopLoading()
      }
    },
    [projectId]
  ) // Only depend on projectId since hooks are stable

  useEffect(() => {
    if (projectId) {
      fetchBoards(currentPage, searchTerm)
    }
  }, [projectId, currentPage, fetchBoards])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchBoards(1, searchTerm)
  }

  // Handle board creation success
  const handleBoardCreated = (newBoard: Board) => {
    setBoards(prev => [newBoard, ...prev])
    setIsCreateModalOpen(false)
    toast.success('Board created successfully!')
  }

  // Handle view board
  const handleViewBoard = (boardId: string) => {
    router.push(`/projects/${projectId}/boards/${boardId}`)
  }

  // Handle back navigation
  const handleBackClick = () => {
    // Always go back to project detail from boards list
    router.push(`/projects/${projectId}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <LoadingOverlay isLoading={isLoading} />

      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="text-slate-400 hover:text-slate-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <Calendar className="w-8 h-8 mr-3 text-blue-400" />
                  Project Boards
                </h1>
                {project && (
                  <p className="text-slate-400 mt-1">
                    Boards for {project.name}
                  </p>
                )}
              </div>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Board
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-4">
            <input
              type="text"
              placeholder="Search boards..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </div>

        {/* Boards Grid */}
        {boards.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No boards found
            </h3>
            <p className="text-slate-400 mb-6">
              {searchTerm
                ? 'No boards match your search criteria'
                : 'Get started by creating your first board'}
            </p>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Board
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {boards.map((board, index) => (
                <motion.div
                  key={board.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-300 cursor-pointer group">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {board.name}
                          </h3>
                          {board.description && (
                            <p className="text-slate-400 text-sm mt-1 line-clamp-2">
                              {board.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-slate-400">
                          <Calendar className="w-4 h-4 mr-2" />
                          {board._count?.columns || 0} columns
                        </div>
                        <div className="text-xs text-slate-500">
                          Created{' '}
                          {new Date(board.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleViewBoard(board.id)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Board
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <Button
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  Previous
                </Button>
                <span className="text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Board Modal */}
      <CreateBoardModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onBoardCreated={handleBoardCreated}
        projectId={projectId}
      />
    </div>
  )
}
