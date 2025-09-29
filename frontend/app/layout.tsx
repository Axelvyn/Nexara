import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { LoadingProvider } from '@/components/providers/LoadingProvider'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { ToastProvider } from '@/components/ui/toast'
import { ThemeCustomizer } from '@/components/ui/theme-customizer'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Nexara - AI-Powered Project Management Platform',
  description:
    'Intelligent automation and AI-driven insights for modern development teams.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider defaultMode="dark" defaultAccentColor="cyan">
          <LoadingProvider>
            <ToastProvider>
              {children}
              <ThemeCustomizer />
            </ToastProvider>
          </LoadingProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
