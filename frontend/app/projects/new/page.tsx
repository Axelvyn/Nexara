'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Folder, Plus, CheckCircle, Zap, Users } from 'lucide-react'
import { apiService } from '@/lib/api'
import { useToastMessage } from '@/hooks/useToastMessage'
import { useLoadingState } from '@/hooks/useLoadingState'
import { ProtectedRoute } from '@/components/protected-route'

export default function NewProjectPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const router = useRouter()
  const toast = useToastMessage()
  const { isLoading, withLoading } = useLoadingState()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Project name must be at least 2 characters'
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Project name must be less than 50 characters'
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
        const response = await apiService.createProject({
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        })

        toast.success('Success', 'Project created successfully!')
        router.push(`/projects/${response.data.project.id}`)
      } catch (error) {
        console.error('Error creating project:', error)
        if (error instanceof Error) {
          toast.error('Error', error.message)
        } else {
          toast.error('Error', 'Failed to create project')
        }
      }
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/projects')}
              className="text-slate-400 hover:text-white mb-6 p-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3">
              Create New Project
            </h1>
            <p className="text-slate-400 text-lg">
              Set up a new project to organize your work and collaborate with
              your team
            </p>
          </motion.div>

          {/* Project Creation Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900/70 to-slate-800/70 backdrop-blur-xl border border-slate-700/30 shadow-2xl shadow-cyan-500/25"
          >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-emerald-500/5" />

            <div className="relative z-10 p-8">
              {/* Form Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <Folder className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    Project Details
                  </h2>
                  <p className="text-slate-400">
                    Enter the basic information for your new project
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Project Name */}
                <div className="space-y-3">
                  <Label
                    htmlFor="name"
                    className="text-slate-300 text-lg font-medium"
                  >
                    Project Name *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={e => handleInputChange('name', e.target.value)}
                    placeholder="Enter project name..."
                    className={`h-12 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl backdrop-blur-sm ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                    maxLength={50}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-sm">{errors.name}</p>
                  )}
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>Choose a descriptive name for your project</span>
                    <span>{formData.name.length}/50</span>
                  </div>
                </div>

                {/* Project Description */}
                <div className="space-y-3">
                  <Label
                    htmlFor="description"
                    className="text-slate-300 text-lg font-medium"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={e =>
                      handleInputChange('description', e.target.value)
                    }
                    placeholder="Describe what this project is about... (optional)"
                    className={`min-h-[120px] bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl backdrop-blur-sm ${
                      errors.description ? 'border-red-500' : ''
                    }`}
                    maxLength={500}
                  />
                  {errors.description && (
                    <p className="text-red-400 text-sm">{errors.description}</p>
                  )}
                  <div className="flex justify-between text-sm text-slate-500">
                    <span>
                      Optional: Add a description to help team members
                      understand the project&apos;s purpose
                    </span>
                    <span>{formData.description.length}/500</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 h-12 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-black font-semibold text-lg"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />
                        Creating Project...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Create Project
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/projects')}
                    disabled={isLoading}
                    className="h-12 px-6 border-slate-700 text-slate-300 hover:bg-slate-800/50 backdrop-blur-sm"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-emerald-400 font-semibold">
                    What happens next?
                  </h3>
                </div>
                <ul className="text-slate-400 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />A
                    default board will be created
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    You&apos;ll be able to add team members
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                    Start creating issues and tasks
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
              <div className="relative p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-cyan-400" />
                  </div>
                  <h3 className="text-cyan-400 font-semibold">
                    Best Practices
                  </h3>
                </div>
                <ul className="text-slate-400 space-y-2">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    Use clear, descriptive names
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    Add meaningful descriptions
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    Set up proper project structure
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
