'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ThemeMode = 'dark' | 'light'
type AccentColor = 'cyan' | 'emerald' | 'purple' | 'blue'

interface ThemeContextType {
  mode: ThemeMode
  accentColor: AccentColor
  setMode: (mode: ThemeMode) => void
  setAccentColor: (color: AccentColor) => void
  toggleMode: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
  defaultMode?: ThemeMode
  defaultAccentColor?: AccentColor
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultMode = 'dark',
  defaultAccentColor = 'cyan',
  storageKey = 'nexara-theme',
}: ThemeProviderProps) {
  const [mode, setModeState] = useState<ThemeMode>(defaultMode)
  const [accentColor, setAccentColorState] =
    useState<AccentColor>(defaultAccentColor)
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const { mode: storedMode, accentColor: storedAccent } =
          JSON.parse(stored)
        if (storedMode) setModeState(storedMode)
        if (storedAccent) setAccentColorState(storedAccent)
      }
    } catch (error) {
      console.warn('Failed to load theme from localStorage:', error)
    }
    setMounted(true)
  }, [storageKey])

  // Save theme to localStorage when it changes
  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode)
    try {
      const current = localStorage.getItem(storageKey)
      const existing = current ? JSON.parse(current) : {}
      localStorage.setItem(
        storageKey,
        JSON.stringify({ ...existing, mode: newMode })
      )
    } catch (error) {
      console.warn('Failed to save theme mode to localStorage:', error)
    }
  }

  const setAccentColor = (color: AccentColor) => {
    setAccentColorState(color)
    try {
      const current = localStorage.getItem(storageKey)
      const existing = current ? JSON.parse(current) : {}
      localStorage.setItem(
        storageKey,
        JSON.stringify({ ...existing, accentColor: color })
      )
    } catch (error) {
      console.warn('Failed to save accent color to localStorage:', error)
    }
  }

  const toggleMode = () => {
    setMode(mode === 'dark' ? 'light' : 'dark')
  }

  // Apply theme classes to document
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    root.classList.remove(
      'theme-cyan',
      'theme-emerald',
      'theme-purple',
      'theme-blue'
    )

    // Add new theme classes
    root.classList.add(mode)
    root.classList.add(`theme-${accentColor}`)

    // Set CSS custom properties for dynamic theming
    const accentColors = {
      cyan: {
        primary: '6 182 212', // cyan-500
        primaryLight: '34 211 238', // cyan-400
        secondary: '16 185 129', // emerald-500
        secondaryLight: '52 211 153', // emerald-400
      },
      emerald: {
        primary: '16 185 129', // emerald-500
        primaryLight: '52 211 153', // emerald-400
        secondary: '6 182 212', // cyan-500
        secondaryLight: '34 211 238', // cyan-400
      },
      purple: {
        primary: '147 51 234', // purple-600
        primaryLight: '168 85 247', // purple-400
        secondary: '6 182 212', // cyan-500
        secondaryLight: '34 211 238', // cyan-400
      },
      blue: {
        primary: '59 130 246', // blue-500
        primaryLight: '96 165 250', // blue-400
        secondary: '16 185 129', // emerald-500
        secondaryLight: '52 211 153', // emerald-400
      },
    }

    const colors = accentColors[accentColor]
    root.style.setProperty('--theme-primary', colors.primary)
    root.style.setProperty('--theme-primary-light', colors.primaryLight)
    root.style.setProperty('--theme-secondary', colors.secondary)
    root.style.setProperty('--theme-secondary-light', colors.secondaryLight)
  }, [mode, accentColor, mounted])

  const value = {
    mode,
    accentColor,
    setMode,
    setAccentColor,
    toggleMode,
  }

  return (
    <ThemeContext.Provider value={value}>
      {!mounted ? (
        <div className="bg-black min-h-screen">{children}</div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={`${mode}-${accentColor}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`theme-${accentColor} ${mode}`}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      )}
    </ThemeContext.Provider>
  )
}
