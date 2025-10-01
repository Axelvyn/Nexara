'use client'

import { useState, useEffect } from 'react'
import { X, AlertCircle, User, Flag, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { motion, AnimatePresence } from 'framer-motion'
import {
  apiService,
  type CreateIssueRequest,
  type IssueType,
  type Priority,
} from '@/lib/api'
import { useToastMessage } from '@/hooks/useToastMessage'

interface CreateIssueModalProps {
  isOpen: boolean
  onClose: () => void
  columnId?: string
  onIssueCreated?: () => void
}

const issueTypes: { value: IssueType; label: string; color: string }[] = [
  { value: 'BUG', label: 'Bug', color: 'from-red-500 to-red-600' },
  { value: 'FEATURE', label: 'Feature', color: 'from-blue-500 to-blue-600' },
  { value: 'TASK', label: 'Task', color: 'from-green-500 to-green-600' },
  { value: 'STORY', label: 'Story', color: 'from-purple-500 to-purple-600' },
  { value: 'EPIC', label: 'Epic', color: 'from-orange-500 to-orange-600' },
]

const priorities: { value: Priority; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low', color: 'from-gray-500 to-gray-600' },
  { value: 'MEDIUM', label: 'Medium', color: 'from-yellow-500 to-yellow-600' },
  { value: 'HIGH', label: 'High', color: 'from-orange-500 to-orange-600' },
  { value: 'URGENT', label: 'Urgent', color: 'from-red-500 to-red-600' },
]

export function CreateIssueModal({
  isOpen,
  onClose,
  columnId,
  onIssueCreated,
}: CreateIssueModalProps) {
  const [formData, setFormData] = useState<CreateIssueRequest>({
    title: '',
    description: '',
    type: 'TASK',
    priority: 'MEDIUM',
    columnId: columnId || '',
    assigneeId: undefined,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToastMessage()

  useEffect(() => {
    if (columnId) {
      setFormData(prev => ({ ...prev, columnId }))
    }
  }, [columnId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.columnId) {
      newErrors.columnId = 'Column is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await apiService.createIssue({
        ...formData,
        description: formData.description?.trim() || undefined,
      })

      toast.success('Success', 'Issue created successfully')
      onIssueCreated?.()
      onClose()

      // Reset form
      setFormData({
        title: '',
        description: '',
        type: 'TASK',
        priority: 'MEDIUM',
        columnId: columnId || '',
        assigneeId: undefined,
      })
    } catch (error) {
      console.error('Error creating issue:', error)
      if (error instanceof Error) {
        toast.error('Error', `Failed to create issue: ${error.message}`)
      } else {
        toast.error('Error', 'Failed to create issue')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl mx-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl border border-slate-700/50 shadow-2xl shadow-cyan-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5 rounded-3xl" />

            <div className="relative z-10 p-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <Tag className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Create New Issue
                    </h2>
                    <p className="text-slate-400">
                      Add a new issue to track work
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter issue title..."
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-cyan-500"
                    disabled={isSubmitting}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.title}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe the issue..."
                    rows={3}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 focus:border-cyan-500"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Type and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Issue Type */}
                  <div className="space-y-2">
                    <Label className="text-white">Issue Type</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {issueTypes.map(type => (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() =>
                            setFormData(prev => ({ ...prev, type: type.value }))
                          }
                          disabled={isSubmitting}
                          className={`p-3 rounded-xl border transition-all ${
                            formData.type === type.value
                              ? `bg-gradient-to-r ${type.color} text-white border-transparent`
                              : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <span className="text-sm font-medium">
                            {type.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="space-y-2">
                    <Label className="text-white">Priority</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {priorities.map(priority => (
                        <button
                          key={priority.value}
                          type="button"
                          onClick={() =>
                            setFormData(prev => ({
                              ...prev,
                              priority: priority.value,
                            }))
                          }
                          disabled={isSubmitting}
                          className={`p-3 rounded-xl border transition-all ${
                            formData.priority === priority.value
                              ? `bg-gradient-to-r ${priority.color} text-white border-transparent`
                              : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <Flag className="w-4 h-4 mx-auto mb-1" />
                          <span className="text-xs font-medium">
                            {priority.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-700/50">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="text-slate-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-black font-semibold min-w-24"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Issue'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
