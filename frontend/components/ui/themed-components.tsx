'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { theme, themeUtils } from '@/lib/theme'

// Themed Card Component
interface ThemedCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag'> {
  variant?: 'default' | 'glass' | 'interactive' | 'gradient'
  interactive?: boolean
  children: React.ReactNode
}

export function ThemedCard({
  variant = 'default',
  interactive = false,
  className,
  children,
  ...props
}: ThemedCardProps) {
  return (
    <motion.div
      className={cn(themeUtils.card(variant, interactive), className)}
      whileHover={interactive ? { scale: 1.02, y: -2 } : undefined}
      transition={{ duration: 0.2 }}
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
}

// Themed Button Component
interface ThemedButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
  asChild?: boolean
}

export function ThemedButton({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ThemedButtonProps) {
  return (
    <motion.button
      className={cn(themeUtils.button(variant, size), className)}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.1 }}
      disabled={disabled}
      {...(props as any)}
    >
      {children}
    </motion.button>
  )
}

// Themed Icon Container
interface ThemedIconContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  color?: 'cyan' | 'emerald' | 'purple' | 'blue'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function ThemedIconContainer({
  color = 'cyan',
  size = 'md',
  className,
  children,
  ...props
}: ThemedIconContainerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div
      className={cn(
        themeUtils.iconContainer(color).replace('w-12 h-12', sizeClasses[size]),
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Themed Section Container
interface ThemedSectionProps extends React.HTMLAttributes<HTMLElement> {
  withPattern?: boolean
  children: React.ReactNode
}

export function ThemedSection({
  withPattern = false,
  className,
  children,
  ...props
}: ThemedSectionProps) {
  return (
    <section
      className={cn(
        theme.backgrounds.primary,
        'relative',
        withPattern && theme.effects.gridPattern,
        className
      )}
      {...props}
    >
      {withPattern && (
        <div className="absolute inset-0 opacity-30 z-0">
          <div className={theme.effects.gridPattern} />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </section>
  )
}

// Themed Container
interface ThemedContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
}

export function ThemedContainer({
  size = 'lg',
  className,
  children,
  ...props
}: ThemedContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }

  return (
    <div
      className={cn(
        sizeClasses[size],
        'mx-auto px-4 sm:px-6 lg:px-8',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Themed Text Components
interface ThemedTextProps extends React.HTMLAttributes<HTMLElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span'
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'gradient'
    | 'muted'
    | 'success'
    | 'warning'
    | 'error'
  children: React.ReactNode
}

export function ThemedText({
  as: Component = 'p',
  variant = 'primary',
  className,
  children,
  ...props
}: ThemedTextProps) {
  return (
    <Component className={cn(theme.text[variant], className)} {...props}>
      {children}
    </Component>
  )
}

// Themed Heading with Gradient Support
interface ThemedHeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  level: 1 | 2 | 3 | 4 | 5 | 6
  gradient?: boolean
  children: React.ReactNode
}

export function ThemedHeading({
  level,
  gradient = false,
  className,
  children,
  ...props
}: ThemedHeadingProps) {
  const sizeClasses = {
    1: 'text-4xl md:text-6xl lg:text-7xl font-bold',
    2: 'text-3xl md:text-4xl lg:text-5xl font-bold',
    3: 'text-2xl md:text-3xl font-bold',
    4: 'text-xl md:text-2xl font-semibold',
    5: 'text-lg md:text-xl font-semibold',
    6: 'text-base md:text-lg font-medium',
  }

  const baseProps = {
    className: cn(
      sizeClasses[level],
      gradient ? theme.text.gradient : theme.text.primary,
      className
    ),
    ...props,
  }

  switch (level) {
    case 1:
      return <h1 {...baseProps}>{children}</h1>
    case 2:
      return <h2 {...baseProps}>{children}</h2>
    case 3:
      return <h3 {...baseProps}>{children}</h3>
    case 4:
      return <h4 {...baseProps}>{children}</h4>
    case 5:
      return <h5 {...baseProps}>{children}</h5>
    case 6:
      return <h6 {...baseProps}>{children}</h6>
    default:
      return <h1 {...baseProps}>{children}</h1>
  }
}

// Themed Input
interface ThemedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

export function ThemedInput({
  error = false,
  className,
  ...props
}: ThemedInputProps) {
  return (
    <input
      className={cn(
        theme.components.input[error ? 'error' : 'default'],
        'px-4 py-3 w-full transition-all duration-300',
        className
      )}
      {...props}
    />
  )
}

// Themed Textarea
interface ThemedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

export function ThemedTextarea({
  error = false,
  className,
  ...props
}: ThemedTextareaProps) {
  return (
    <textarea
      className={cn(
        theme.components.input[error ? 'error' : 'default'],
        'px-4 py-3 w-full min-h-[120px] resize-y transition-all duration-300',
        className
      )}
      {...props}
    />
  )
}

// Themed Glass Modal/Dialog Background
interface ThemedGlassProps extends React.HTMLAttributes<HTMLDivElement> {
  opacity?: 'light' | 'medium' | 'heavy'
  children: React.ReactNode
}

export function ThemedGlass({
  opacity = 'medium',
  className,
  children,
  ...props
}: ThemedGlassProps) {
  return (
    <div className={cn(themeUtils.glass(opacity), className)} {...props}>
      {children}
    </div>
  )
}

// Themed Stats/Metric Card
interface ThemedStatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  icon?: React.ReactNode
  color?: 'cyan' | 'emerald' | 'purple' | 'blue'
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function ThemedStatCard({
  title,
  value,
  icon,
  color = 'cyan',
  trend,
  className,
  ...props
}: ThemedStatCardProps) {
  return (
    <ThemedCard
      variant="glass"
      interactive
      className={cn('p-6', className)}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div>
          <ThemedText variant="secondary" className="text-sm">
            {title}
          </ThemedText>
          <ThemedText as="h3" className="text-3xl font-bold mt-1">
            {value}
          </ThemedText>
          {trend && (
            <div
              className={cn(
                'text-sm mt-1',
                trend.isPositive ? 'text-emerald-400' : 'text-red-400'
              )}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </div>
          )}
        </div>
        {icon && (
          <ThemedIconContainer color={color}>{icon}</ThemedIconContainer>
        )}
      </div>
    </ThemedCard>
  )
}

// Export all components
export { theme, themeUtils }
