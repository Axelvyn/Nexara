'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  MoreVertical,
  Edit,
  Trash2,
  User,
  Flag,
  Clock,
  Bug,
  Star,
  Zap,
  Target,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatTimeAgo } from '@/lib/timeUtils'
import {
  type Issue,
  type IssueType,
  type Priority,
  type IssueStatus,
} from '@/lib/api'

interface IssueCardProps {
  issue: Issue
  onEdit?: (issue: Issue) => void
  onDelete?: (issueId: string) => void
  onView?: (issue: Issue) => void
  className?: string
}

const issueTypeConfig: Record<
  IssueType,
  {
    icon: React.ComponentType<{ className?: string }>
    color: string
    bg: string
  }
> = {
  BUG: { icon: Bug, color: 'text-red-500', bg: 'bg-red-500/10' },
  FEATURE: { icon: Star, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  TASK: { icon: Target, color: 'text-green-500', bg: 'bg-green-500/10' },
  STORY: { icon: Layers, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  EPIC: { icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' },
}

const priorityConfig: Record<Priority, { color: string; bg: string }> = {
  LOW: { color: 'text-gray-400', bg: 'bg-gray-500/10' },
  MEDIUM: { color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  HIGH: { color: 'text-orange-500', bg: 'bg-orange-500/10' },
  URGENT: { color: 'text-red-500', bg: 'bg-red-500/10' },
}

const statusConfig: Record<
  IssueStatus,
  { color: string; bg: string; label: string }
> = {
  TODO: { color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'To Do' },
  IN_PROGRESS: {
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    label: 'In Progress',
  },
  IN_REVIEW: {
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    label: 'In Review',
  },
  DONE: { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Done' },
}

export function IssueCard({
  issue,
  onEdit,
  onDelete,
  onView,
  className,
}: IssueCardProps) {
  const [showActions, setShowActions] = useState(false)

  const typeConfig = issueTypeConfig[issue.type]
  const priorityConfig_ = priorityConfig[issue.priority]
  const statusConfig_ = statusConfig[issue.status]
  const TypeIcon = typeConfig.icon

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ scale: 1.02 }}
      className={`group relative bg-gradient-to-br from-slate-800/70 to-slate-700/50 backdrop-blur-sm rounded-2xl border border-slate-600/30 p-4 cursor-pointer hover:border-slate-500/50 transition-all ${className}`}
      onClick={() => onView?.(issue)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative z-10 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${typeConfig.bg}`}>
              <TypeIcon className={`w-4 h-4 ${typeConfig.color}`} />
            </div>
            <Badge
              variant="outline"
              className={`text-xs ${priorityConfig_.color} ${priorityConfig_.bg} border-transparent`}
            >
              <Flag className="w-3 h-3 mr-1" />
              {issue.priority}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Badge
              variant="outline"
              className={`text-xs ${statusConfig_.color} ${statusConfig_.bg} border-transparent`}
            >
              {statusConfig_.label}
            </Badge>

            {showActions && (onEdit || onDelete) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1"
              >
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation()
                      onEdit(issue)
                    }}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation()
                      onDelete(issue.id)
                    }}
                    className="h-8 w-8 p-0 text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-white text-sm leading-tight line-clamp-2 group-hover:text-cyan-400 transition-colors">
          {issue.title}
        </h3>

        {/* Description */}
        {issue.description && (
          <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
            {issue.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-600/30">
          {/* Assignee */}
          <div className="flex items-center gap-2">
            {issue.assignee ? (
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-semibold">
                    {issue.assignee.username[0].toUpperCase()}
                  </span>
                </div>
                <span className="text-slate-300 text-xs">
                  {issue.assignee.username}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-slate-400" />
                </div>
                <span className="text-slate-500 text-xs">Unassigned</span>
              </div>
            )}
          </div>

          {/* Created time */}
          <div className="flex items-center gap-1 text-slate-500">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{formatTimeAgo(issue.createdAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
