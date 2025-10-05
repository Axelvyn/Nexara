'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  Plus,
  MoreVertical,
  Settings,
  X,
  Grip,
  Edit2,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { LoadingOverlay } from '@/components/ui/loading-overlay'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useLoadingState } from '@/hooks/useLoadingState'
import { getSmartBackRoute } from '@/lib/navigationHistory'
import { apiService } from '@/lib/api'
import { authManager } from '@/lib/auth'

interface Board {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  projectId: string
  project?: {
    id: string
    name: string
  }
  columns?: Column[]
  _count?: {
    columns: number
  }
}

interface Column {
  id: string
  name: string
  orderIndex: number
  boardId: string
  _count?: {
    issues: number
  }
}

export default function BoardDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string; boardId: string }>
}) {
  const params = use(paramsPromise)
  const router = useRouter()
  const projectId = params.id
  const boardId = params.boardId

  const [board, setBoard] = useState<Board | null>(null)
  const [showAddColumnModal, setShowAddColumnModal] = useState(false)
  const [newColumnName, setNewColumnName] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [draggedColumnId, setDraggedColumnId] = useState<string | null>(null)
  const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null)
  const [renderKey, setRenderKey] = useState(0) // Force re-render key

  const { isLoading, startLoading, stopLoading } = useLoadingState()
  const toast = useToastMessage()

  // Fetch board details
  const fetchBoard = useCallback(async () => {
    startLoading()
    try {
      const data = await apiService.getBoard(boardId)
      setBoard(data.data.board)
    } catch (error) {
      console.error('Error fetching board:', error)
      toast.error('Error fetching board details')
      router.push(`/projects/${projectId}/boards`)
    } finally {
      stopLoading()
    }
  }, [boardId, projectId, router])

  useEffect(() => {
    if (boardId) {
      fetchBoard()
    }
  }, [boardId, fetchBoard])

  // Handle back navigation
  const handleBackClick = () => {
    // Always go back to boards list from board detail
    router.push(`/projects/${projectId}/boards`)
  }

  // Handle add column
  const handleAddColumn = () => {
    setShowAddColumnModal(true)
  }

  // Handle create column
  const handleCreateColumn = async () => {
    if (!newColumnName.trim() || !board) return

    try {
      startLoading()
      const response = await apiService.createColumn({
        name: newColumnName.trim(),
        boardId: board.id,
      })

      // Update board with new column
      setBoard(prev =>
        prev
          ? {
              ...prev,
              columns: [...(prev.columns || []), response.data.column],
            }
          : null
      )

      setShowAddColumnModal(false)
      setNewColumnName('')
      toast.success('Column added successfully!')
    } catch (error) {
      console.error('Error creating column:', error)
      toast.error('Failed to add column')
    } finally {
      stopLoading()
    }
  }

  const handleDragStart = (e: React.DragEvent, columnId: string) => {
    setDraggedColumnId(columnId)
    setIsDragging(true)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', columnId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragEnter = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    if (draggedColumnId && draggedColumnId !== columnId) {
      setDragOverColumnId(columnId)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOverColumnId(null)
  }

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault()

    if (
      !draggedColumnId ||
      draggedColumnId === targetColumnId ||
      !board ||
      !board.columns
    )
      return

    try {
      startLoading()

      const sourceIndex = board.columns.findIndex(
        col => col.id === draggedColumnId
      )
      const targetIndex = board.columns.findIndex(
        col => col.id === targetColumnId
      )

      if (sourceIndex === -1 || targetIndex === -1) return

      // Optimistic update
      const updatedColumns = [...board.columns]
      const [draggedColumn] = updatedColumns.splice(sourceIndex, 1)
      updatedColumns.splice(targetIndex, 0, draggedColumn)

      // Update orderIndex for all columns to match their new positions
      const reorderedColumns = updatedColumns.map((col, index) => ({
        ...col,
        orderIndex: index,
      }))

      // Update local state immediately
      setBoard(prev => (prev ? { ...prev, columns: reorderedColumns } : null))

      // Create reorder request
      const reorderData = {
        boardId: boardId,
        columnIds: reorderedColumns.map(col => col.id),
      }

      // Send API request
      const response = await apiService.reorderColumns(reorderData)

      // Update with server response to ensure consistency
      if (response.data?.columns) {
        setBoard(prev =>
          prev ? { ...prev, columns: response.data.columns } : null
        )
        // Force re-render
        setRenderKey(prev => prev + 1)
      } else {
        // Fallback: refresh board data if response doesn't include columns
        fetchBoard()
      }

      toast.success('Column order updated')
    } catch (error) {
      // Revert on error
      fetchBoard()
      toast.error('Failed to reorder columns')
    } finally {
      setIsDragging(false)
      setDraggedColumnId(null)
      stopLoading()
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDraggedColumnId(null)
    setDragOverColumnId(null)
  }

  // Handle close add column modal
  const handleCloseAddColumnModal = () => {
    setShowAddColumnModal(false)
    setNewColumnName('')
  }

  if (!board) {
    return <LoadingOverlay isLoading={isLoading} />
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
                Back to Boards
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center">
                  <Calendar className="w-8 h-8 mr-3 text-blue-400" />
                  {board.name}
                </h1>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-slate-400">
                    {board.project?.name || 'Unknown Project'}
                  </p>
                  <span className="text-slate-600">•</span>
                  <p className="text-slate-400">
                    {board.columns?.length || 0} columns
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button
                onClick={() => handleAddColumn()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Board Description */}
        {board.description && (
          <div className="mb-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  Description
                </h3>
                <p className="text-slate-400">{board.description}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Board Columns */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">
              Board Columns ({board.columns?.length || 0})
            </h2>
          </div>

          {!board.columns || board.columns.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                No columns found
              </h3>
              <p className="text-slate-400 mb-6">
                Get started by adding your first column to organize issues.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Column
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-6" key={renderKey}>
              {(board.columns || [])
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((column, index) => (
                  <div
                    key={`${column.id}-${renderKey}`}
                    className={`${
                      isDragging && draggedColumnId === column.id
                        ? 'opacity-50 scale-95'
                        : ''
                    } ${
                      dragOverColumnId === column.id
                        ? 'ring-2 ring-blue-400 ring-opacity-50'
                        : ''
                    } transition-all duration-200 group w-full sm:w-80 md:w-72 lg:w-80`}
                    draggable
                    onDragStart={(e: React.DragEvent) =>
                      handleDragStart(e, column.id)
                    }
                    onDragOver={(e: React.DragEvent) => handleDragOver(e)}
                    onDragEnter={(e: React.DragEvent) =>
                      handleDragEnter(e, column.id)
                    }
                    onDragLeave={(e: React.DragEvent) => handleDragLeave(e)}
                    onDrop={(e: React.DragEvent) => handleDrop(e, column.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-300 cursor-move group-hover:shadow-lg">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center flex-1">
                              <Grip className="w-4 h-4 text-slate-500 mr-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white">
                                  {column.name}
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">
                                  Position {column.orderIndex + 1}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-400 hover:text-slate-200 p-1"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-slate-400 hover:text-red-400 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-slate-400">
                              <span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
                              {column._count?.issues || 0} issues
                            </div>
                            <div className="text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                              Drag to reorder columns
                            </div>
                          </div>

                          <div className="flex gap-2 mt-4">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800/50"
                            >
                              View Issues
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Board Stats */}
        <div className="mt-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Board Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {board.columns?.length || 0}
                  </div>
                  <div className="text-sm text-slate-400">Total Columns</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {(board.columns || []).reduce(
                      (total, col) => total + (col._count?.issues || 0),
                      0
                    )}
                  </div>
                  <div className="text-sm text-slate-400">Total Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {new Date(board.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-slate-400">Created</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Column Modal */}
      {showAddColumnModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleCloseAddColumnModal}
          />

          {/* Modal */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
            <Card className="bg-slate-900/95 backdrop-blur-xl border-slate-700/50 shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">
                    Add New Column
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCloseAddColumnModal}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">
                      Column Name
                    </label>
                    <Input
                      placeholder="Enter column name..."
                      value={newColumnName}
                      onChange={e => setNewColumnName(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleCreateColumn()
                        }
                      }}
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleCloseAddColumnModal}
                      className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800/50"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateColumn}
                      disabled={!newColumnName.trim() || isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Column
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
