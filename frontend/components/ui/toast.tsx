'use client'
import { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Toast types and their configurations
export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastConfig {
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  borderColor: string
  textColor: string
  iconColor: string
  borderRadius: string
  borderStyle: string
  shadowStyle: string
}

const toastConfigs: Record<ToastType, ToastConfig> = {
  success: {
    icon: CheckCircle,
    bgColor:
      'bg-gradient-to-br from-green-900/80 via-green-800/70 to-green-900/80',
    borderColor: 'border-green-500/30',
    textColor: 'text-green-100',
    iconColor: 'text-green-400',
    borderRadius: 'rounded-2xl',
    borderStyle: 'border border-green-500/20',
    shadowStyle: 'shadow-lg shadow-green-500/10',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-gradient-to-br from-red-900/80 via-red-800/70 to-red-900/80',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-100',
    iconColor: 'text-red-400',
    borderRadius: 'rounded-2xl',
    borderStyle: 'border border-red-500/20',
    shadowStyle: 'shadow-lg shadow-red-500/10',
  },
  warning: {
    icon: AlertTriangle,
    bgColor:
      'bg-gradient-to-br from-yellow-900/80 via-yellow-800/70 to-yellow-900/80',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-100',
    iconColor: 'text-yellow-400',
    borderRadius: 'rounded-2xl',
    borderStyle: 'border border-yellow-500/20',
    shadowStyle: 'shadow-lg shadow-yellow-500/10',
  },
  info: {
    icon: Info,
    bgColor:
      'bg-gradient-to-br from-blue-900/80 via-blue-800/70 to-blue-900/80',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-100',
    iconColor: 'text-blue-400',
    borderRadius: 'rounded-2xl',
    borderStyle: 'border border-blue-500/20',
    shadowStyle: 'shadow-lg shadow-blue-500/10',
  },
}

// Toast interface
export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  isRemoving?: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

// Toast context
interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

// Toast provider component
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev =>
      prev.map(toast =>
        toast.id === id ? { ...toast, isRemoving: true } : toast
      )
    )

    // Remove from DOM after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 250)
  }, [])

  const addToast = useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newToast: Toast = {
        id,
        duration: 5000, // Default 5 seconds
        ...toast,
      }

      setToasts(prev => [...prev, newToast])

      // Auto-remove toast after duration
      if (newToast.duration !== Infinity) {
        setTimeout(() => {
          removeToast(id)
        }, newToast.duration)
      }
    },
    [removeToast]
  )

  const clearToasts = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, clearToasts }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Individual toast component
function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast
  onRemove: (id: string) => void
}) {
  const config = toastConfigs[toast.type]
  const Icon = config.icon

  return (
    <div
      className={cn(
        'relative flex items-start gap-4 p-6 backdrop-blur-md transition-all duration-300 ease-out transform',
        toast.isRemoving
          ? 'slide-out-to-top-center'
          : 'animate-in slide-in-from-top-center',
        config.bgColor,
        config.borderRadius,
        config.borderStyle,
        config.borderColor,
        'hover:scale-[1.02] hover:shadow-xl',
        toast.isRemoving ? '' : config.shadowStyle
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 mt-1 p-2 rounded-lg bg-white/5 backdrop-blur-sm',
          config.iconColor
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className={cn('font-semibold text-base mb-1', config.textColor)}>
          {toast.title}
        </h4>
        {toast.message && (
          <p
            className={cn(
              'text-sm opacity-90 leading-relaxed',
              config.textColor
            )}
          >
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className={cn(
              'mt-2 text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors',
              config.textColor
            )}
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={() => onRemove(toast.id)}
        className={cn(
          'flex-shrink-0 p-1.5 rounded-md hover:bg-white/10 transition-colors',
          config.textColor
        )}
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      {toast.duration !== Infinity && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 rounded-b-2xl overflow-hidden">
          <div
            className={cn(
              'h-full transition-all duration-300 ease-linear',
              config.borderColor.replace('/20', '/50')
            )}
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  )
}

// Toast container
function ToastContainer() {
  const { toasts, removeToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}

// Convenience hook for different toast types
export function useToastHelpers() {
  const { addToast } = useToast()

  return {
    success: (title: string, message?: string, options?: Partial<Toast>) => {
      addToast({ type: 'success', title, message, ...options })
    },
    error: (title: string, message?: string, options?: Partial<Toast>) => {
      addToast({ type: 'error', title, message, ...options })
    },
    warning: (title: string, message?: string, options?: Partial<Toast>) => {
      addToast({ type: 'warning', title, message, ...options })
    },
    info: (title: string, message?: string, options?: Partial<Toast>) => {
      addToast({ type: 'info', title, message, ...options })
    },
  }
}
