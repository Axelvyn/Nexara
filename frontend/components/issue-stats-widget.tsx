'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3,
  TrendingUp,
  Bug,
  Star,
  Target,
  Layers,
  Zap,
  Flag,
  CheckCircle,
  Clock,
  PlayCircle,
  Eye,
} from 'lucide-react'
import { apiService, type IssueStats } from '@/lib/api'
import { useToastMessage } from '@/hooks/useToastMessage'

interface IssueStatsWidgetProps {
  className?: string
}

const typeIcons = {
  BUG: Bug,
  FEATURE: Star,
  TASK: Target,
  STORY: Layers,
  EPIC: Zap,
}

const statusIcons = {
  TODO: Clock,
  IN_PROGRESS: PlayCircle,
  IN_REVIEW: Eye,
  DONE: CheckCircle,
}

const priorityColors = {
  LOW: 'from-gray-500 to-gray-600',
  MEDIUM: 'from-yellow-500 to-yellow-600',
  HIGH: 'from-orange-500 to-orange-600',
  URGENT: 'from-red-500 to-red-600',
}

const statusColors = {
  TODO: 'from-slate-500 to-slate-600',
  IN_PROGRESS: 'from-blue-500 to-blue-600',
  IN_REVIEW: 'from-yellow-500 to-yellow-600',
  DONE: 'from-green-500 to-green-600',
}

const typeColors = {
  BUG: 'from-red-500 to-red-600',
  FEATURE: 'from-blue-500 to-blue-600',
  TASK: 'from-green-500 to-green-600',
  STORY: 'from-purple-500 to-purple-600',
  EPIC: 'from-orange-500 to-orange-600',
}

export function IssueStatsWidget({ className }: IssueStatsWidgetProps) {
  const [stats, setStats] = useState<IssueStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const toast = useToastMessage()

  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoading(true)
        const response = await apiService.getIssueStats()
        setStats(response.data.stats)
      } catch (error) {
        console.error('Error loading issue stats:', error)
        if (error instanceof Error) {
          toast.error(
            'Error',
            `Failed to load issue statistics: ${error.message}`
          )
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  if (isLoading) {
    return (
      <div
        className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl border border-slate-700/30 ${className}`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5" />
        <div className="relative z-10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white">Issue Statistics</h3>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="h-4 bg-slate-700/50 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return null
  }

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl border border-slate-700/30 ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5" />
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Issue Statistics</h3>
            <p className="text-slate-400 text-sm">
              Overview of all your issues
            </p>
          </div>
        </div>

        {/* Total Issues */}
        <div className="mb-6">
          <div className="text-center p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20">
            <div className="text-3xl font-bold text-white mb-1">
              {stats.totalIssues}
            </div>
            <div className="text-sm text-slate-400">Total Issues</div>
          </div>
        </div>

        {/* Status Breakdown */}
        {stats.issuesByStatus.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              By Status
            </h4>
            <div className="space-y-2">
              {stats.issuesByStatus.map(item => {
                const StatusIcon = statusIcons[item.status] || Clock
                const color = statusColors[item.status] || statusColors.TODO
                const percentage =
                  stats.totalIssues > 0
                    ? Math.round((item._count.status / stats.totalIssues) * 100)
                    : 0

                return (
                  <motion.div
                    key={item.status}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}
                      >
                        <StatusIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-300 capitalize">
                        {item.status.replace('_', ' ').toLowerCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {item._count.status}
                      </div>
                      <div className="text-xs text-slate-400">
                        {percentage}%
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Type Breakdown */}
        {stats.issuesByType.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Target className="w-5 h-5" />
              By Type
            </h4>
            <div className="space-y-2">
              {stats.issuesByType.map(item => {
                const TypeIcon = typeIcons[item.type] || Target
                const color = typeColors[item.type] || typeColors.TASK
                const percentage =
                  stats.totalIssues > 0
                    ? Math.round((item._count.type / stats.totalIssues) * 100)
                    : 0

                return (
                  <motion.div
                    key={item.type}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}
                      >
                        <TypeIcon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-300 capitalize">
                        {item.type.toLowerCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {item._count.type}
                      </div>
                      <div className="text-xs text-slate-400">
                        {percentage}%
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Priority Breakdown */}
        {stats.issuesByPriority.length > 0 && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Flag className="w-5 h-5" />
              By Priority
            </h4>
            <div className="space-y-2">
              {stats.issuesByPriority.map(item => {
                const color =
                  priorityColors[item.priority] || priorityColors.MEDIUM
                const percentage =
                  stats.totalIssues > 0
                    ? Math.round(
                        (item._count.priority / stats.totalIssues) * 100
                      )
                    : 0

                return (
                  <motion.div
                    key={item.priority}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center`}
                      >
                        <Flag className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-slate-300 capitalize">
                        {item.priority.toLowerCase()}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        {item._count.priority}
                      </div>
                      <div className="text-xs text-slate-400">
                        {percentage}%
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {stats.totalIssues === 0 && (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-400">No issues found</p>
            <p className="text-slate-500 text-sm">
              Create your first issue to see statistics
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
