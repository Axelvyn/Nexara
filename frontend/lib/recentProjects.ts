// Recently viewed projects utilities
export interface RecentProject {
  id: string
  name: string
  description?: string
  viewedAt: string
}

const RECENT_PROJECTS_KEY = 'nexara_recent_projects'
const MAX_RECENT_PROJECTS = 5

export function addToRecentProjects(project: Omit<RecentProject, 'viewedAt'>) {
  if (typeof window === 'undefined') return // SSR safety

  try {
    const recentProjects = getRecentProjects()

    // Remove if already exists to avoid duplicates
    const filtered = recentProjects.filter(p => p.id !== project.id)

    // Add to beginning with current timestamp
    const updated = [
      { ...project, viewedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, MAX_RECENT_PROJECTS) // Keep only the most recent N projects

    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(updated))
  } catch (error) {
    console.error('Error saving recent project:', error)
  }
}

export function getRecentProjects(): RecentProject[] {
  if (typeof window === 'undefined') return [] // SSR safety

  try {
    const stored = localStorage.getItem(RECENT_PROJECTS_KEY)
    if (!stored) return []

    const projects = JSON.parse(stored) as RecentProject[]

    // Filter out projects older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const filtered = projects.filter(p => new Date(p.viewedAt) > thirtyDaysAgo)

    // If we filtered any out, update localStorage
    if (filtered.length !== projects.length) {
      localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(filtered))
    }

    return filtered
  } catch (error) {
    console.error('Error loading recent projects:', error)
    return []
  }
}

export function removeFromRecentProjects(projectId: string) {
  if (typeof window === 'undefined') return // SSR safety

  try {
    const recentProjects = getRecentProjects()
    const filtered = recentProjects.filter(p => p.id !== projectId)
    localStorage.setItem(RECENT_PROJECTS_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error removing recent project:', error)
  }
}

export function clearRecentProjects() {
  if (typeof window === 'undefined') return // SSR safety

  try {
    localStorage.removeItem(RECENT_PROJECTS_KEY)
  } catch (error) {
    console.error('Error clearing recent projects:', error)
  }
}
