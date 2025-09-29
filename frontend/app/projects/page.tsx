'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Plus,
  Search,
  Folder,
  Users,
  Calendar,
  MoreVertical,
  Trash2,
  Edit,
  ArrowLeft,
  FolderOpen,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { apiService, type Project } from '@/lib/api'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useLoadingState } from '@/hooks/useLoadingState'
import { ProtectedRoute } from '@/components/protected-route'
import { authManager } from '@/lib/auth'
import { addToNavigationHistory } from '@/lib/navigationHistory'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const toast = useToastMessage()
  const { isLoading: actionLoading, withLoading } = useLoadingState()

  const loadProjects = useCallback(
    async (page = 1, search = '') => {
      try {
        setError(null)
        const response = await apiService.getProjects({
          page,
          limit: 12,
          search: search || undefined,
        })

        setProjects(response.data.projects)
        setCurrentPage(response.data.pagination.page)
        setTotalPages(response.data.pagination.pages)
      } catch (error) {
        console.error('Error loading projects:', error)
        setError('Failed to load projects')
        setProjects([])
        setCurrentPage(1)
        setTotalPages(1)
      } finally {
        setIsLoading(false)
      }
    },
    [setProjects, setCurrentPage, setTotalPages, setIsLoading, setError]
  )

  useEffect(() => {
    loadProjects()
    // Track navigation to projects page
    addToNavigationHistory('/projects', 'All Projects')
  }, [loadProjects])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await loadProjects(1, searchQuery)
  }

  const handleDeleteProject = async (
    projectId: string,
    projectName: string
  ) => {
    if (
      !confirm(
        `Are you sure you want to delete "${projectName}"? This action cannot be undone.`
      )
    ) {
      return
    }

    await withLoading(async () => {
      try {
        await apiService.deleteProject(projectId)
        toast.success('Success', 'Project deleted successfully')
        // Reload projects
        await loadProjects(currentPage, searchQuery)
      } catch (error) {
        console.error('Error deleting project:', error)
        if (error instanceof Error) {
          toast.error('Error', error.message)
        } else {
          toast.error('Error', 'Failed to delete project')
        }
      }
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Animated Background Elements */}
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
              onClick={() => router.push('/userdashboard')}
              className="text-slate-400 hover:text-white mb-6 p-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3">
                  Your Projects
                </h1>
                <p className="text-slate-400 text-lg">
                  Manage and organize your project portfolio
                </p>
              </div>
              <Button
                onClick={() => router.push('/projects/new')}
                className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-black font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl backdrop-blur-sm"
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                variant="outline"
                className="h-12 px-6 border-slate-700 text-slate-300 hover:bg-slate-800/50 backdrop-blur-sm rounded-xl"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Search'
                )}
              </Button>
            </form>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center backdrop-blur-sm">
                <p className="text-red-400 mb-4">{error}</p>
                <Button
                  onClick={() => loadProjects(currentPage, searchQuery)}
                  variant="outline"
                  className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                >
                  Try Again
                </Button>
              </div>
            </motion.div>
          )}

          {/* Projects Grid */}
          {projects.length === 0 && !isLoading && !error ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <FolderOpen className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">
                No Projects Found
              </h3>
              <p className="text-slate-400 mb-8 max-w-md mx-auto">
                {searchQuery
                  ? `No projects match "${searchQuery}". Try adjusting your search terms.`
                  : "You haven't created any projects yet. Start by creating your first project to organize your work."}
              </p>
              <div className="flex gap-3 justify-center">
                {searchQuery && (
                  <Button
                    onClick={() => {
                      setSearchQuery('')
                      loadProjects(1, '')
                    }}
                    variant="outline"
                    className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                  >
                    Clear Search
                  </Button>
                )}
                <Button
                  onClick={() => router.push('/projects/new')}
                  className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-black font-semibold"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {projects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-700/50 border border-slate-700/50 hover:border-slate-600/50 backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="relative p-6">
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Folder className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-300 transition-colors truncate">
                            {project.name}
                          </h3>
                          <p className="text-slate-400 text-sm line-clamp-2">
                            {project.description || 'No description provided'}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={e => {
                          e.stopPropagation()
                          // You can implement a dropdown menu here
                        }}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Project Stats */}
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">
                          {project._count.members}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <FolderOpen className="w-4 h-4" />
                        <span className="text-sm">{project._count.boards}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm">Active</span>
                      </div>
                    </div>

                    {/* Project Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(project.createdAt)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-white h-8 w-8 p-0"
                          onClick={e => {
                            e.stopPropagation()
                            router.push(`/projects/${project.id}/edit`)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-slate-400 hover:text-red-400 h-8 w-8 p-0"
                          disabled={actionLoading}
                          onClick={e => {
                            e.stopPropagation()
                            handleDeleteProject(project.id, project.name)
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex justify-center gap-2 mt-12"
            >
              <Button
                onClick={() => loadProjects(currentPage - 1, searchQuery)}
                disabled={currentPage <= 1 || isLoading}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50 backdrop-blur-sm"
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  page => (
                    <Button
                      key={page}
                      onClick={() => loadProjects(page, searchQuery)}
                      disabled={isLoading}
                      variant={page === currentPage ? 'default' : 'outline'}
                      className={
                        page === currentPage
                          ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-black font-semibold'
                          : 'border-slate-600 text-slate-300 hover:bg-slate-700/50 backdrop-blur-sm'
                      }
                      size="sm"
                    >
                      {page}
                    </Button>
                  )
                )}
              </div>
              <Button
                onClick={() => loadProjects(currentPage + 1, searchQuery)}
                disabled={currentPage >= totalPages || isLoading}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700/50 backdrop-blur-sm"
              >
                Next
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
