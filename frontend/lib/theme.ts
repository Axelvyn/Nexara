/**
 * Nexara Theme System
 * Centralized theme configuration matching the landing page design
 */

export const theme = {
  // Core color palette inspired by landing page
  colors: {
    // Primary gradient colors (cyan to emerald)
    primary: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee', // cyan-400 - main accent
      500: '#06b6d4', // cyan-500 - primary
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
    },
    secondary: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399', // emerald-400 - secondary accent
      500: '#10b981', // emerald-500 - secondary
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    },
    // Neutral grays with slight blue undertone
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8', // slate-400 - text secondary
      500: '#64748b',
      600: '#475569',
      700: '#334155', // slate-700 - borders
      800: '#1e293b', // slate-800 - card backgrounds
      900: '#0f172a', // slate-900 - darker backgrounds
      950: '#020617',
    },
    // Accent colors for variety
    purple: {
      400: '#a855f7',
      500: '#9333ea',
      600: '#7c3aed',
    },
    // Status colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },

  // Background patterns and gradients
  backgrounds: {
    // Main app background
    primary: 'bg-black',

    // Landing page style gradients
    heroGradient:
      'bg-gradient-to-br from-black via-slate-900 via-cyan-900/20 to-black',
    cardGradient: 'bg-gradient-to-r from-slate-900/50 to-slate-800/50',
    glassCard: 'bg-slate-800/50 backdrop-blur-sm',

    // Button gradients
    primaryButton: 'bg-gradient-to-r from-cyan-500 to-emerald-500',
    primaryButtonHover: 'hover:from-cyan-600 hover:to-emerald-600',

    // Interactive elements
    interactive: 'bg-slate-800/80 hover:bg-cyan-500/20',
    border: 'border-slate-700/50',
    activeBorder: 'border-cyan-500/50',
  },

  // Text color combinations
  text: {
    primary: 'text-white',
    secondary: 'text-slate-400',
    accent: 'text-cyan-400',
    gradient:
      'bg-gradient-to-r from-cyan-400 via-emerald-400 to-purple-400 bg-clip-text text-transparent',
    muted: 'text-slate-500',
    success: 'text-emerald-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
  },

  // Spacing and sizing
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
    '4xl': '6rem', // 96px
  },

  // Border radius
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  },

  // Shadows
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
    glow: 'shadow-2xl shadow-cyan-500/25',
    none: 'shadow-none',
  },

  // Animation durations
  animation: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '1000ms',
  },

  // Component variants
  components: {
    // Card styles matching landing page
    card: {
      default:
        'bg-slate-800/50 border border-slate-700 rounded-xl backdrop-blur-sm',
      glass:
        'bg-slate-800/30 border border-slate-700/50 rounded-xl backdrop-blur-sm',
      interactive:
        'bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all duration-300 cursor-pointer rounded-xl',
      gradient:
        'bg-gradient-to-r from-slate-900/50 to-slate-800/50 border border-slate-700/50 rounded-xl backdrop-blur-sm',
    },

    // Button styles
    button: {
      primary:
        'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-black font-semibold shadow-2xl hover:shadow-cyan-500/25 transform hover:-translate-y-1 transition-all duration-300 border-0 rounded-xl',
      secondary:
        'border-2 border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 backdrop-blur-sm rounded-xl',
      ghost:
        'text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-300 rounded-xl',
      outline:
        'border-slate-600 text-slate-300 hover:bg-slate-700 transition-all duration-300 rounded-xl',
    },

    // Input styles
    input: {
      default:
        'bg-slate-800/50 border border-slate-700 text-white placeholder-slate-400 focus:border-cyan-500 focus:ring-cyan-500/20 rounded-xl',
      error:
        'bg-slate-800/50 border border-red-500 text-white placeholder-slate-400 focus:border-red-400 focus:ring-red-500/20 rounded-xl',
    },

    // Icon containers (matching landing page stats)
    iconContainer: {
      cyan: 'w-12 h-12 bg-cyan-600/20 rounded-xl flex items-center justify-center',
      emerald:
        'w-12 h-12 bg-emerald-600/20 rounded-xl flex items-center justify-center',
      purple:
        'w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center',
      blue: 'w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center',
    },
  },

  // Layout components
  layout: {
    container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-8 lg:py-12',
    grid: {
      responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
      stats: 'grid grid-cols-1 md:grid-cols-3 gap-6',
      projects: 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6',
    },
  },

  // Interactive effects (matching landing page)
  effects: {
    // Hover animations
    hover: {
      lift: 'hover:transform hover:-translate-y-1 transition-all duration-300',
      scale: 'hover:scale-105 transition-transform duration-300',
      glow: 'hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300',
    },

    // Background patterns
    gridPattern:
      'bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]',
    animatedGrid:
      'bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]',

    // Glass morphism effects
    glass: 'backdrop-blur-sm bg-slate-800/50 border border-slate-700/50',
    glassCard:
      'backdrop-blur-md bg-gradient-to-br from-black/70 via-black/60 to-black/70 border border-white/15',
  },
}

// Helper functions for consistent styling
export const themeUtils = {
  // Combine multiple theme classes
  cn: (...classes: (string | undefined)[]) => {
    return classes.filter(Boolean).join(' ')
  },

  // Generate consistent card classes
  card: (
    variant: keyof typeof theme.components.card = 'default',
    interactive?: boolean
  ) => {
    const base = theme.components.card[variant]
    const hover = interactive ? theme.effects.hover.lift : ''
    return themeUtils.cn(base, hover)
  },

  // Generate consistent button classes
  button: (
    variant: keyof typeof theme.components.button = 'primary',
    size?: 'sm' | 'md' | 'lg'
  ) => {
    const base = theme.components.button[variant]
    const sizeClass =
      size === 'sm'
        ? 'px-4 py-2 text-sm'
        : size === 'lg'
          ? 'px-8 py-4 text-lg'
          : 'px-6 py-3'
    return themeUtils.cn(base, sizeClass)
  },

  // Generate consistent icon container classes
  iconContainer: (
    color: keyof typeof theme.components.iconContainer = 'cyan'
  ) => {
    return theme.components.iconContainer[color]
  },

  // Generate page layout with background
  pageLayout: (withPattern?: boolean) => {
    const base = `${theme.backgrounds.primary} min-h-screen relative`
    const pattern = withPattern ? theme.effects.gridPattern : ''
    return themeUtils.cn(base, pattern)
  },

  // Generate consistent text gradients
  textGradient: () => theme.text.gradient,

  // Generate consistent glass effects
  glass: (opacity?: 'light' | 'medium' | 'heavy') => {
    switch (opacity) {
      case 'light':
        return 'backdrop-blur-sm bg-slate-800/30 border border-slate-700/30'
      case 'heavy':
        return 'backdrop-blur-lg bg-slate-800/70 border border-slate-700/70'
      default:
        return theme.effects.glass
    }
  },
}

// Export default theme for easy importing
export default theme
