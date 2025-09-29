export interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
}

class AuthManager {
  private readonly TOKEN_KEY = 'nexara_auth_token'
  private readonly REFRESH_TOKEN_KEY = 'nexara_refresh_token'
  private readonly USER_KEY = 'nexara_user'

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.TOKEN_KEY, token)
  }

  removeToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.TOKEN_KEY)
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.REFRESH_TOKEN_KEY)
  }

  setRefreshToken(refreshToken: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken)
  }

  removeRefreshToken(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.REFRESH_TOKEN_KEY)
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem(this.USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  setUser(user: User): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
  }

  removeUser(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.USER_KEY)
  }

  login(token: string, user: User, refreshToken?: string): void {
    this.setToken(token)
    this.setUser(user)
    if (refreshToken) {
      this.setRefreshToken(refreshToken)
    }
  }

  logout(): void {
    this.removeToken()
    this.removeRefreshToken()
    this.removeUser()
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  getAuthState(): AuthState {
    const token = this.getToken()
    const user = this.getUser()

    return {
      user,
      token,
      isAuthenticated: !!token,
    }
  }
}

export const authManager = new AuthManager()
