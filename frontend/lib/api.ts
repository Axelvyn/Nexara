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
}

export const apiService = new ApiService(API_BASE_URL)
