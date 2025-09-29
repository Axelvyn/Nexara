import { useCallback } from 'react'
import { useToast } from '@/components/ui/toast'

export function useToastMessage() {
  const { addToast } = useToast()

  const success = useCallback(
    (title: string, message?: string) => {
      addToast({
        type: 'success',
        title,
        message,
        duration: 4000,
      })
    },
    [addToast]
  )

  const error = useCallback(
    (title: string, message?: string) => {
      addToast({
        type: 'error',
        title,
        message,
        duration: 6000, // Errors stay longer
      })
    },
    [addToast]
  )

  const warning = useCallback(
    (title: string, message?: string) => {
      addToast({
        type: 'warning',
        title,
        message,
        duration: 5000,
      })
    },
    [addToast]
  )

  const info = useCallback(
    (title: string, message?: string) => {
      addToast({
        type: 'info',
        title,
        message,
        duration: 4000,
      })
    },
    [addToast]
  )

  const custom = useCallback(
    (
      type: 'success' | 'error' | 'warning' | 'info',
      title: string,
      message?: string,
      duration?: number
    ) => {
      addToast({
        type,
        title,
        message,
        duration: duration || 5000,
      })
    },
    [addToast]
  )

  const withAction = useCallback(
    (
      type: 'success' | 'error' | 'warning' | 'info',
      title: string,
      message: string,
      actionLabel: string,
      actionHandler: () => void
    ) => {
      addToast({
        type,
        title,
        message,
        duration: Infinity, // Stay until user takes action
        action: {
          label: actionLabel,
          onClick: actionHandler,
        },
      })
    },
    [addToast]
  )

  return {
    success,
    error,
    warning,
    info,
    custom,
    withAction,
  }
}
