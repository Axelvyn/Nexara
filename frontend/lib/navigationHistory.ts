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

    // Don't add if the last two entries would create a ping-pong pattern
    if (history.length >= 2) {
      const [latest, secondLatest] = history
      if (latest.path === path && secondLatest.path === path) {
        return // Skip adding to avoid loops
      }
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
  const history = getNavigationHistory()

  // Extract project ID from current path for better logic
  const projectIdMatch = currentPath.match(/\/projects\/([^\/]+)/)
  const projectId = projectIdMatch?.[1]

  // Define route hierarchy for smart navigation
  const routeHierarchy = {
    projectDetail: projectId ? `/projects/${projectId}` : null,
    projectIssues: projectId ? `/projects/${projectId}/issues` : null,
    allProjects: '/projects',
    dashboard: '/userdashboard',
  }

  // Smart navigation logic based on current page
  if (currentPath === routeHierarchy.projectIssues) {
    // From issues page, always go back to project detail
    return routeHierarchy.projectDetail || defaultRoute
  }

  if (currentPath === routeHierarchy.projectDetail) {
    // From project detail, find the most recent non-project-related page
    const nonProjectEntry = history.find(
      entry =>
        entry.path !== currentPath &&
        entry.path !== routeHierarchy.projectIssues &&
        !entry.path.startsWith(`/projects/${projectId}/`)
    )

    if (nonProjectEntry) {
      return nonProjectEntry.path
    }

    // Fallback to all projects
    return routeHierarchy.allProjects
  }

  // For other pages, use the previous route logic
  const previousRoute = getPreviousRoute(currentPath)

  // Avoid ping-pong between related pages
  if (previousRoute && previousRoute !== currentPath) {
    // Don't go back to issues page from project detail or vice versa
    if (
      (currentPath === routeHierarchy.projectDetail &&
        previousRoute === routeHierarchy.projectIssues) ||
      (currentPath === routeHierarchy.projectIssues &&
        previousRoute === routeHierarchy.projectDetail)
    ) {
      return routeHierarchy.allProjects
    }

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
