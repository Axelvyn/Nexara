'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { X, Plus, Kanban } from 'lucide-react'
import { apiService } from '@/lib/api'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useLoadingState } from '@/hooks/useLoadingState'

interface CreateBoardModalProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  onBoardCreated?: (board: any) => void
}

export function CreateBoardModal({
  isOpen,
  onClose,
  projectId,
  onBoardCreated,
}: CreateBoardModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const toast = useToastMessage()
  const { isLoading, withLoading } = useLoadingState()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Board name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Board name must be at least 2 characters'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Board name must be less than 50 characters'
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    await withLoading(async () => {
      try {
        const response = await apiService.createBoard({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
          projectId,
        })

        toast.success('Success', 'Board created successfully!')
        onBoardCreated?.(response.data.board)
        handleClose()
      } catch (error) {
        console.error('Error creating board:', error)
        if (error instanceof Error) {
          toast.error('Error', error.message)
        } else {
          toast.error('Error', 'Failed to create board')
        }
      }
    })
  }

  const handleClose = () => {
    setFormData({ name: '', description: '' })
    setErrors({})
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="relative p-6 border-b border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Kanban className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Create New Board
                    </h2>
                    <p className="text-sm text-slate-400">
                      Add a new board to organize your project tasks
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="absolute top-6 right-6 w-8 h-8 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Board Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-slate-300 text-sm font-medium"
                  >
                    Board Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Development Board, Marketing Tasks"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20"
                    required
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm">{errors.name}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-slate-300 text-sm font-medium"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Optional description for your board..."
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    className="bg-slate-800/50 border-slate-700 text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/20 resize-none"
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm">{errors.description}</p>
                  )}
                  <p className="text-xs text-slate-500">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1 bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Board
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
