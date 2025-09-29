'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Palette, Settings, Moon, Sun, Check } from 'lucide-react'
import { useTheme } from '@/components/providers/ThemeProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ThemeCustomizerProps {
  className?: string
}

export function ThemeCustomizer({ className }: ThemeCustomizerProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Always call the hook first, then handle errors in the render
  const themeContext = useTheme()

  // If no theme context available, don't render the customizer
  if (!themeContext) {
    return null
  }

  const { mode, accentColor, setMode, setAccentColor, toggleMode } =
    themeContext

  const accentOptions = [
    {
      name: 'Cyan',
      value: 'cyan' as const,
      gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-400',
      preview: 'bg-cyan-500',
    },
    {
      name: 'Emerald',
      value: 'emerald' as const,
      gradient: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
      preview: 'bg-emerald-500',
    },
    {
      name: 'Purple',
      value: 'purple' as const,
      gradient: 'bg-gradient-to-r from-purple-500 to-purple-400',
      preview: 'bg-purple-500',
    },
    {
      name: 'Blue',
      value: 'blue' as const,
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-400',
      preview: 'bg-blue-500',
    },
  ]

  return (
    <div className={className}>
      {/* Floating Theme Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, duration: 0.5, ease: 'backOut' }}
      >
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 rounded-full flex items-center justify-center border border-slate-600 shadow-2xl backdrop-blur-sm transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <Palette className="w-6 h-6 text-cyan-400" />
          </motion.div>
        </motion.button>
      </motion.div>

      {/* Theme Customizer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="absolute right-0 top-0 h-full w-96 max-w-[90vw]"
              onClick={e => e.stopPropagation()}
            >
              <Card className="h-full bg-slate-900/95 border-slate-700 rounded-none border-r-0 backdrop-blur-lg">
                <CardHeader className="border-b border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      <Settings className="w-5 h-5 text-cyan-400" />
                      Theme Settings
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-8">
                  {/* Theme Mode */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">Mode</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button
                        onClick={() => setMode('dark')}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          mode === 'dark'
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-8 bg-slate-800 rounded border border-slate-600 flex items-center justify-center">
                            <Moon className="w-4 h-4 text-slate-400" />
                          </div>
                          <span className="text-sm text-white">Dark</span>
                          {mode === 'dark' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-black" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>

                      <motion.button
                        onClick={() => setMode('light')}
                        className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                          mode === 'light'
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-8 bg-white rounded border border-slate-300 flex items-center justify-center">
                            <Sun className="w-4 h-4 text-slate-600" />
                          </div>
                          <span className="text-sm text-white">Light</span>
                          {mode === 'light' && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center"
                            >
                              <Check className="w-3 h-3 text-black" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    </div>
                  </div>

                  {/* Accent Colors */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Accent Color
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {accentOptions.map(option => (
                        <motion.button
                          key={option.value}
                          onClick={() => setAccentColor(option.value)}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                            accentColor === option.value
                              ? 'border-cyan-500 bg-cyan-500/10'
                              : 'border-slate-700 hover:border-slate-600'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <div
                              className={`w-12 h-8 ${option.gradient} rounded shadow-lg`}
                            />
                            <span className="text-sm text-white">
                              {option.name}
                            </span>
                            {accentColor === option.value && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-4 h-4 bg-cyan-500 rounded-full flex items-center justify-center"
                              >
                                <Check className="w-3 h-3 text-black" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Preview Section */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Preview
                    </h3>
                    <motion.div
                      key={`${mode}-${accentColor}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">
                          Sample Card
                        </span>
                        <div className="w-8 h-8 bg-emerald-600/20 rounded-lg flex items-center justify-center">
                          <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                        </div>
                      </div>
                      <p className="text-slate-400 text-sm">
                        This is how your interface will look with the selected
                        theme.
                      </p>
                      <div className="flex gap-2">
                        <div
                          className={`px-3 py-1 ${accentOptions.find(o => o.value === accentColor)?.gradient} text-black text-xs rounded-lg font-medium`}
                        >
                          Primary
                        </div>
                        <div className="px-3 py-1 border border-slate-600 text-slate-300 text-xs rounded-lg">
                          Secondary
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white">
                      Quick Actions
                    </h3>
                    <div className="space-y-2">
                      <Button
                        onClick={toggleMode}
                        variant="outline"
                        className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        {mode === 'dark' ? (
                          <Sun className="w-4 h-4 mr-2" />
                        ) : (
                          <Moon className="w-4 h-4 mr-2" />
                        )}
                        Switch to {mode === 'dark' ? 'Light' : 'Dark'} Mode
                      </Button>

                      <Button
                        onClick={() => {
                          setMode('dark')
                          setAccentColor('cyan')
                        }}
                        variant="outline"
                        className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        <Palette className="w-4 h-4 mr-2" />
                        Reset to Default
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
