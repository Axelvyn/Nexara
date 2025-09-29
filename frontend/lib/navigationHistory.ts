// Navigation history utility for smart back routing
const NAVIGATION_HISTORY_KEY = 'nexara_navigation_history'
const MAX_HISTORY_SIZE = 10

export interface NavigationEntry {
  path: string
  timestamp: string
  title?: string
}

export function addToNavigationHistory(path: string, title?: string) {
  if (typeof window === 'undefined') return // SSR safety

  try {
    const history = getNavigationHistory()

    // Don't add duplicate consecutive entries
    if (history.length > 0 && history[0].path === path) {
      return
    }

    // Add to beginning
    const updated = [
      { path, timestamp: new Date().toISOString(), title },
      ...history,
    ].slice(0, MAX_HISTORY_SIZE) // Keep only the most recent N entries

    localStorage.setItem(NAVIGATION_HISTORY_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error saving navigation history:', error)
  }
}

export function getNavigationHistory(): NavigationEntry[] {
  if (typeof window === 'undefined') return [] // SSR safety

  try {
    const stored = localStorage.getItem(NAVIGATION_HISTORY_KEY)
    if (!stored) return []

    return JSON.parse(stored) as NavigationEntry[]
  } catch (error) {
    console.error('Error loading navigation history:', error)
    return []
  }
}

export function getPreviousRoute(currentPath: string): string | null {
  const history = getNavigationHistory()

  // Find the most recent entry that's not the current path
  const previousEntry = history.find(entry => entry.path !== currentPath)

  return previousEntry?.path || null
}

export function getSmartBackRoute(
  currentPath: string,
  defaultRoute: string = '/'
): string {
  const previousRoute = getPreviousRoute(currentPath)

  // If we have a previous route and it's not the same as current, use it
  if (previousRoute && previousRoute !== currentPath) {
    return previousRoute
  }

  // Otherwise use the default route
  return defaultRoute
}

export function clearNavigationHistory() {
  if (typeof window === 'undefined') return // SSR safety

  try {
    localStorage.removeItem(NAVIGATION_HISTORY_KEY)
  } catch (error) {
    console.error('Error clearing navigation history:', error)
  }
}
