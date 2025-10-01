'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, Filter, SortAsc, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IssueCard } from './issue-card'
import { CreateIssueModal } from './create-issue-modal'
import { apiService, type Issue } from '@/lib/api'
import { useToastMessage } from '@/hooks/useToastMessage'
import { PageLoading } from '@/components/ui/page-loading'

interface IssueListProps {
  columnId?: string
  projectId?: string
  showCreateButton?: boolean
  className?: string
}

export function IssueList({
  columnId,
  projectId,
  showCreateButton = true,
  className,
}: IssueListProps) {
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })

  const toast = useToastMessage()

  const loadIssues = async () => {
    if (!columnId) return

    setIsLoading(true)
    try {
      const response = await apiService.getIssuesByColumn(columnId, {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
      })

      setIssues(response.data.issues)
      setPagination(response.data.pagination)
    } catch (error) {
      console.error('Error loading issues:', error)
      if (error instanceof Error) {
        toast.error('Error', `Failed to load issues: ${error.message}`)
      } else {
        toast.error('Error', 'Failed to load issues')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (columnId) {
      loadIssues()
    }
  }, [columnId, pagination.page, searchQuery])

  const handleDeleteIssue = async (issueId: string) => {
    try {
      await apiService.deleteIssue(issueId)
      toast.success('Success', 'Issue deleted successfully')
      loadIssues() // Reload the list
    } catch (error) {
      console.error('Error deleting issue:', error)
      if (error instanceof Error) {
        toast.error('Error', `Failed to delete issue: ${error.message}`)
      } else {
        toast.error('Error', 'Failed to delete issue')
      }
    }
  }

  const handleEditIssue = (issue: Issue) => {
    setSelectedIssue(issue)
    // TODO: Open edit modal
    console.log('Edit issue:', issue)
  }

  const handleViewIssue = (issue: Issue) => {
    setSelectedIssue(issue)
    // TODO: Open issue detail modal
    console.log('View issue:', issue)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  if (!columnId) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400">Select a column to view issues</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-cyan-500"
            />
          </div>

          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>

          <Button
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
          >
            <SortAsc className="w-4 h-4 mr-2" />
            Sort
          </Button>
        </div>

        {showCreateButton && (
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-black font-semibold"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Issue
          </Button>
        )}
      </div>

      {/* Issues Grid */}
      {isLoading ? (
        <PageLoading message="Loading issues..." />
      ) : issues.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-r from-slate-700 to-slate-600 rounded-2xl flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Issues Found
          </h3>
          <p className="text-slate-400 mb-6">
            {searchQuery
              ? `No issues match your search for "${searchQuery}"`
              : 'There are no issues in this column yet.'}
          </p>
          {showCreateButton && !searchQuery && (
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-black font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Issue
            </Button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {issues.map(issue => (
              <IssueCard
                key={issue.id}
                issue={issue}
                onEdit={handleEditIssue}
                onDelete={handleDeleteIssue}
                onView={handleViewIssue}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            disabled={pagination.page <= 1}
            onClick={() =>
              setPagination(prev => ({ ...prev, page: prev.page - 1 }))
            }
            className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
          >
            Previous
          </Button>

          <span className="text-slate-400 px-4">
            Page {pagination.page} of {pagination.pages}
          </span>

          <Button
            variant="outline"
            disabled={pagination.page >= pagination.pages}
            onClick={() =>
              setPagination(prev => ({ ...prev, page: prev.page + 1 }))
            }
            className="border-slate-700 text-slate-300 hover:bg-slate-800/50"
          >
            Next
          </Button>
        </div>
      )}

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        columnId={columnId}
        onIssueCreated={loadIssues}
      />
    </div>
  )
}
