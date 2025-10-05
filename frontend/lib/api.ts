import { authManager } from './auth'

const API_BASE_URL = '/api' // Use Next.js API routes

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  firstName: string
  lastName: string
  username: string
  email: string
  password: string
  confirmPassword: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    token: string
    refreshToken: string
    user: {
      id: string
      email: string
      username: string
      firstName: string
      lastName: string
      createdAt: string
    }
  }
}

export interface ApiError {
  success: false
  message: string
}

export interface AvailabilityResponse {
  success: boolean
  available: boolean
  message: string
  username?: string
  email?: string
}

export interface VerifyEmailRequest {
  email: string
  otp: string
}

export interface ResendOTPRequest {
  email: string
}

export interface Project {
  id: string
  name: string
  description?: string
  ownerId: string
  createdAt: string
  updatedAt: string
  owner: {
    id: string
    username: string
    firstName: string
    lastName: string
  }
  _count: {
    members: number
    boards: number
  }
  userRole?: string
}

export interface CreateProjectRequest {
  name: string
  description?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
}

export interface ProjectsResponse {
  success: boolean
  data: {
    projects: Project[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export interface ProjectResponse {
  success: boolean
  data: {
    project: Project
  }
  message?: string
}

export type IssueType = 'BUG' | 'FEATURE' | 'TASK' | 'STORY' | 'EPIC'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type IssueStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE'

export interface Issue {
  id: string
  title: string
  description?: string
  type: IssueType
  priority: Priority
  status: IssueStatus
  columnId: string
  assigneeId?: string
  reporterId: string
  createdAt: string
  updatedAt: string
  assignee?: {
    id: string
    email: string
    username: string
  }
  reporter: {
    id: string
    email: string
    username: string
  }
  column?: {
    id: string
    name: string
    board?: {
      id: string
      name: string
      project?: {
        id: string
        name: string
      }
    }
  }
}

export interface CreateIssueRequest {
  title: string
  description?: string
  type?: IssueType
  priority?: Priority
  columnId: string
  assigneeId?: string
}

export interface UpdateIssueRequest {
  title?: string
  description?: string
  type?: IssueType
  priority?: Priority
  status?: IssueStatus
  assigneeId?: string
}

export interface IssuesResponse {
  success: boolean
  data: {
    issues: Issue[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export interface IssueResponse {
  success: boolean
  data: {
    issue: Issue
  }
  message?: string
}

export interface IssueStats {
  totalIssues: number
  issuesByStatus: Array<{
    status: IssueStatus
    _count: { status: number }
  }>
  issuesByType: Array<{
    type: IssueType
    _count: { type: number }
  }>
  issuesByPriority: Array<{
    priority: Priority
    _count: { priority: number }
  }>
}

export interface IssueStatsResponse {
  success: boolean
  data: {
    stats: IssueStats
  }
}

export interface Board {
  id: string
  name: string
  description?: string
  projectId: string
  createdAt: string
  updatedAt: string
  project?: {
    id: string
    name: string
  }
  columns?: Column[]
  _count?: {
    columns: number
  }
}

export interface Column {
  id: string
  name: string
  boardId: string
  orderIndex: number
  createdAt: string
  updatedAt: string
  issues?: Issue[]
  _count?: {
    issues: number
  }
}

export interface CreateColumnRequest {
  name: string
  boardId: string
  orderIndex?: number
}

export interface UpdateColumnRequest {
  name?: string
  orderIndex?: number
}

export interface ColumnsResponse {
  success: boolean
  data: {
    columns: Column[]
  }
}

export interface ColumnResponse {
  success: boolean
  data: {
    column: Column
  }
  message?: string
}

export interface ReorderColumnsRequest {
  boardId: string
  columnIds: string[]
}

export interface CreateBoardRequest {
  name: string
  description?: string
  projectId: string
}

export interface UpdateBoardRequest {
  name?: string
  description?: string
}

export interface BoardsResponse {
  success: boolean
  data: {
    boards: Board[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

export interface BoardResponse {
  success: boolean
  data: {
    board: Board
  }
  message?: string
}

class ApiService {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred')
      }

      return data
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error occurred')
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    const token = authManager.getToken()
    return this.request('/auth/logout', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  }

  async getProfile(): Promise<any> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request('/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async checkEmailAvailability(email: string): Promise<AvailabilityResponse> {
    return this.request<AvailabilityResponse>(
      `/auth/check-email/${encodeURIComponent(email)}`,
      {
        method: 'GET',
      }
    )
  }

  async checkUsernameAvailability(
    username: string
  ): Promise<AvailabilityResponse> {
    return this.request<AvailabilityResponse>(
      `/auth/check-username/${encodeURIComponent(username)}`,
      {
        method: 'GET',
      }
    )
  }

  async verifyEmail(data: VerifyEmailRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async resendOTP(
    data: ResendOTPRequest
  ): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(
      '/auth/resend-otp',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    )
  }

  // Project Management Methods
  async getProjects(params?: {
    page?: number
    limit?: number
    search?: string
  }): Promise<ProjectsResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)

    const url = `/projects${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

    return this.request<ProjectsResponse>(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async getProject(projectId: string): Promise<ProjectResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<ProjectResponse>(`/projects/${projectId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async createProject(data: CreateProjectRequest): Promise<ProjectResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<ProjectResponse>('/projects', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  }

  async updateProject(
    projectId: string,
    data: UpdateProjectRequest
  ): Promise<ProjectResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<ProjectResponse>(`/projects/${projectId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  }

  async deleteProject(
    projectId: string
  ): Promise<{ success: boolean; message: string }> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<{ success: boolean; message: string }>(
      `/projects/${projectId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  }

  async getProjectStats(projectId: string): Promise<{
    success: boolean
    data: {
      stats: {
        totalBoards: number
        totalColumns: number
        projectCreated: string
        lastUpdated: string
      }
    }
  }> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request(`/projects/${projectId}/stats`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  // Issue Management Methods
  async getIssuesByColumn(
    columnId: string,
    params?: {
      page?: number
      limit?: number
      search?: string
    }
  ): Promise<IssuesResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const searchParams = new URLSearchParams()
    searchParams.set('columnId', columnId)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)

    const url = `/issues${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

    return this.request<IssuesResponse>(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async getIssue(issueId: string): Promise<IssueResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<IssueResponse>(`/issues/${issueId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async createIssue(data: CreateIssueRequest): Promise<IssueResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<IssueResponse>('/issues', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  }

  async updateIssue(
    issueId: string,
    data: UpdateIssueRequest
  ): Promise<IssueResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<IssueResponse>(`/issues/${issueId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  }

  async deleteIssue(
    issueId: string
  ): Promise<{ success: boolean; message: string }> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<{ success: boolean; message: string }>(
      `/issues/${issueId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  }

  async moveIssue(issueId: string, columnId: string): Promise<IssueResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<IssueResponse>(`/issues/${issueId}/move`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ columnId }),
    })
  }

  async getIssueStats(): Promise<IssueStatsResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<IssueStatsResponse>('/issues/stats', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  // Board Management Methods
  async getBoardsByProject(
    projectId: string,
    params?: {
      page?: number
      limit?: number
      search?: string
    }
  ): Promise<BoardsResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    const searchParams = new URLSearchParams()
    searchParams.set('projectId', projectId)
    if (params?.page) searchParams.set('page', params.page.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.search) searchParams.set('search', params.search)

    const url = `/boards${searchParams.toString() ? `?${searchParams.toString()}` : ''}`

    return this.request<BoardsResponse>(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async getBoard(boardId: string): Promise<BoardResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<BoardResponse>(`/boards/${boardId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async createBoard(data: CreateBoardRequest): Promise<BoardResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<BoardResponse>('/boards', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  }

  async updateBoard(
    boardId: string,
    data: UpdateBoardRequest
  ): Promise<BoardResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<BoardResponse>(`/boards/${boardId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  }

  async deleteBoard(
    boardId: string
  ): Promise<{ success: boolean; message: string }> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<{ success: boolean; message: string }>(
      `/boards/${boardId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  }

  // Column Management Methods
  async getColumnsByBoard(boardId: string): Promise<ColumnsResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<ColumnsResponse>(`/columns/board/${boardId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async getColumn(columnId: string): Promise<ColumnResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<ColumnResponse>(`/columns/${columnId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async createColumn(data: CreateColumnRequest): Promise<ColumnResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<ColumnResponse>('/columns', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  }

  async updateColumn(
    columnId: string,
    data: UpdateColumnRequest
  ): Promise<ColumnResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<ColumnResponse>(`/columns/${columnId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  }

  async deleteColumn(
    columnId: string
  ): Promise<{ success: boolean; message: string }> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<{ success: boolean; message: string }>(
      `/columns/${columnId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
  }

  async reorderColumns(data: ReorderColumnsRequest): Promise<ColumnsResponse> {
    const token = authManager.getToken()
    if (!token) {
      throw new Error('No authentication token found')
    }

    return this.request<ColumnsResponse>('/columns', {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  }
}

export const apiService = new ApiService(API_BASE_URL)
