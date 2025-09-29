'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Zap,
  Workflow,
  Link,
  Star,
  MessageCircle,
} from 'lucide-react'
import Hero from './components/Hero'
import Features from './components/Features'
import Automation from './components/Automation'
import Integrations from './components/Integrations'
import Pricing from './components/Pricing'
import Testimonials from './components/Testimonials'
import CTA from './components/CTA'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ContactForm from './components/ContactForm'

export default function LandingPage() {
  const [currentPage, setCurrentPage] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const pages = [
    {
      id: 'hero',
      title: 'Home',
      icon: Home,
      component: Hero,
    },
    {
      id: 'features',
      title: 'Features',
      icon: Zap,
      component: Features,
    },
    {
      id: 'automation',
      title: 'Automation',
      icon: Workflow,
      component: Automation,
    },
    {
      id: 'integrations',
      title: 'Integrations',
      icon: Link,
      component: Integrations,
    },
    {
      id: 'pricing',
      title: 'Pricing',
      icon: Star,
      component: Pricing,
    },
    {
      id: 'testimonials',
      title: 'Testimonials',
      icon: MessageCircle,
      component: Testimonials,
    },
  ]

  const handlePageChange = useCallback(
    (newPage: number) => {
      if (isTransitioning || newPage === currentPage) return

      setIsTransitioning(true)
      setCurrentPage(newPage)

      // Reset transition state after animation
      setTimeout(() => setIsTransitioning(false), 500)
    },
    [isTransitioning, currentPage]
  )

  const nextPage = useCallback(() => {
    if (currentPage < pages.length - 1) {
      handlePageChange(currentPage + 1)
    }
  }, [currentPage, pages.length, handlePageChange])

  const prevPage = useCallback(() => {
    if (currentPage > 0) {
      handlePageChange(currentPage - 1)
    }
  }, [currentPage, handlePageChange])

  // Keyboard navigation

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement

      // Allow typing in inputs (all types) and textareas
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextPage()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevPage()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentPage, nextPage, prevPage])

  // Auto-advance (optional - can be disabled)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isTransitioning) {
        // Loop back to first page when reaching the end
        if (currentPage < pages.length - 1) {
          nextPage()
        } else {
          handlePageChange(0) // Go back to first page
        }
      }
    }, 8000) // 8 seconds per page

    return () => clearTimeout(timer)
  }, [currentPage, isTransitioning, nextPage, pages.length, handlePageChange])

  const CurrentComponent = pages[currentPage].component

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Page Navigation */}
      <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
        <div className="flex flex-col space-y-2">
          {pages.map((page, index) => (
            <motion.button
              key={page.id}
              onClick={() => handlePageChange(index)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                currentPage === index
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-black shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50 hover:text-cyan-300 border border-slate-700/50'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <page.icon className="w-5 h-5" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="min-h-screen"
        >
          <CurrentComponent />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Controls */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex items-center space-x-4">
        <motion.button
          onClick={prevPage}
          disabled={currentPage === 0}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            currentPage === 0
              ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
              : 'bg-slate-800/80 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-400 border border-slate-700/50'
          }`}
          whileHover={currentPage > 0 ? { scale: 1.1 } : {}}
          whileTap={currentPage > 0 ? { scale: 0.95 } : {}}
        >
          <ChevronLeft className="w-5 h-5" />
        </motion.button>

        {/* Page Indicators */}
        <div className="flex space-x-2">
          {pages.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => handlePageChange(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                currentPage === index
                  ? 'bg-cyan-400 scale-125'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>

        <motion.button
          onClick={nextPage}
          disabled={currentPage === pages.length - 1}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
            currentPage === pages.length - 1
              ? 'bg-slate-800/30 text-slate-600 cursor-not-allowed'
              : 'bg-slate-800/80 text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-400 border border-slate-700/50'
          }`}
          whileHover={currentPage < pages.length - 1 ? { scale: 1.1 } : {}}
          whileTap={currentPage < pages.length - 1 ? { scale: 0.95 } : {}}
        >
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Page Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="fixed top-24 right-8 z-40 hidden lg:block"
      >
        <div className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-full px-6 py-3">
          <span className="text-cyan-300 font-medium">
            {pages[currentPage].title}
          </span>
        </div>
      </motion.div>

      {/* CTA Section - Always Visible */}
      <div className="relative z-30">
        <CTA />
      </div>

      {/* Contact Form Section */}
      <div className="relative z-30">
        <ContactForm />
      </div>

      <Footer />
    </div>
  )
}
