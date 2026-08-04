import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { User, AuthContextValue, UserRoles } from '../types'
import { authService } from '../services/authService'
import { decodeJwt } from '../utils/jwtDecode'

const extractRoles = (token: string): string[] => {
  const payload = decodeJwt(token)
  if (!payload || !payload.roles || !Array.isArray(payload.roles)) return []
  return (payload.roles as Array<{ name: string }>).map((r) => r.name)
}

const extractUserName = (token: string): string | null => {
  const payload = decodeJwt(token)
  if (!payload) return null
  return (payload.sub as string) || null
}

const isTokenExpired = (token: string): boolean => {
  const payload = decodeJwt(token)
  if (!payload || !payload.exp) return true
  return (payload.exp as number) < Date.now() / 1000
}

const clearAuthStorage = (): void => {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  localStorage.removeItem('userName')
  localStorage.removeItem('userId')
  localStorage.removeItem('user')
}

const getErrorMessage = (err: unknown, fallback = 'Request failed'): string => {
  if (typeof err === 'string' && err.trim()) return err

  if (err instanceof Error && err.message) return err.message

  if (typeof err === 'object' && err !== null) {
    const maybeResponse = (err as { response?: { data?: { message?: string; error?: string } } }).response
    const message = maybeResponse?.data?.message || maybeResponse?.data?.error || (err as { message?: string }).message

    if (typeof message === 'string' && message.trim()) return message
  }

  return fallback
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const isAdmin = (user?.roles ?? []).includes('ROLE_ADMIN')

  useEffect(() => {
    const handleLogout = () => {
      setUser(null)
    }
    window.addEventListener('auth:logout', handleLogout)
    return () => window.removeEventListener('auth:logout', handleLogout)
  }, [])

  // Restore session on mount with token validation
  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem('access_token')
      if (!accessToken) return

      // Access token is valid — restore user with roles from token
      if (!isTokenExpired(accessToken)) {
        const stored = localStorage.getItem('user')
        if (stored) {
          const parsed = JSON.parse(stored)
          const roles = extractRoles(accessToken)
          const subName = extractUserName(accessToken)
          setUser({ ...parsed, id: subName || parsed.id, roles: roles.length ? roles : parsed.roles })
        }
        return
      }

      // Access token expired — try refresh
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        clearAuthStorage()
        setUser(null)
        return
      }

      try {
        const response = await authService.refreshToken({ token: refreshToken })
        localStorage.setItem('access_token', response.accessToken)
        localStorage.setItem('refresh_token', response.token)
        const stored = localStorage.getItem('user')
        const roles = extractRoles(response.accessToken)
        const subName = extractUserName(response.accessToken)
        const userData = stored
          ? { ...JSON.parse(stored), id: subName || JSON.parse(stored).id, roles: roles.length ? roles : JSON.parse(stored).roles }
          : { id: subName || response.username, name: (subName || response.username) || 'User', email: '', roles }
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
      } catch {
        clearAuthStorage()
        setUser(null)
      }
    }

    restoreSession()
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    try {
      const response = await authService.login({ username, password })
      localStorage.setItem('access_token', response.accessToken)
      localStorage.setItem('refresh_token', response.token)
      const roles = extractRoles(response.accessToken)
      const subName = extractUserName(response.accessToken)
      const userName = response.username || subName
      const userData = { id: userName, name: userName, email: '', roles }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      return { success: true }
    } catch (err) {
      const message = getErrorMessage(err, 'Login failed')
      console.log(err)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string, roles: UserRoles): Promise<{ success: boolean; userName?: string; error?: string }> => {
    setLoading(true)
    try {
      const response = await authService.signup({ user_name: name, email, password, roles })
      return { success: true, userName: response.userName }
    } catch (err) {
      const message = getErrorMessage(err, 'Signup failed')
      console.error('Signup error:', message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }, [])

  const verifyOtp = useCallback(async (userName: string, otp: string, firstName?: string, lastName?: string, phoneNumber?: string): Promise<{ success: boolean; error?: string }> => {
    setLoading(true)
    try {
      const response = await authService.verifyOtp(userName, otp, { first_name: firstName, last_name: lastName, phone_number: phoneNumber ? parseInt(phoneNumber, 10) : undefined })
      localStorage.setItem('access_token', response.accessToken)
      localStorage.setItem('refresh_token', response.token)
      localStorage.setItem('userName', response.username || '')
      const roles = extractRoles(response.accessToken)
      const resolvedUserName = response.username || extractUserName(response.accessToken)
      const userData = { id: resolvedUserName, name: firstName ? `${firstName} ${lastName || ''}`.trim() : 'User', email: '', roles }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      setLoading(false)
      return { success: true }
    } catch (err) {
      setLoading(false)
      const message = err instanceof Error ? err.message : 'OTP verification failed'
      console.error('OTP verification error:', message)
      return { success: false, error: message }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    clearAuthStorage()
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isAdmin, loading, login, register, logout, verifyOtp }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
