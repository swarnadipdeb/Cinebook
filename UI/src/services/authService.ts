import { UserRoles } from '../types'
import { decodeJwt } from '../utils/jwtDecode'

export interface SignupRequest {
  user_name: string
  email: string
  password: string
  roles?: UserRoles
}

export interface OtpVerifyRequest {
  first_name?: string
  last_name?: string
  phone_number?: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface JwtResponse {
  accessToken: string
  token: string
  username: string | null
}

export interface RefreshTokenRequest {
  token: string
}

export interface TokenClaims {
  roles?: string[]
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const TIMEOUT_MS = 150000

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    return response
  } finally {
    clearTimeout(timeout)
  }
}

export const authService = {
  decodeToken(token: string): TokenClaims | null {
    return decodeJwt(token) as TokenClaims | null
  },

  async signup(data: SignupRequest): Promise<{ userName: string }> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        let errorMessage = `Signup failed ${response.status.toString()} (${response.statusText})`

        try {
          const errorText = await response.text()
          if (errorText) {
            errorMessage = errorText
          }
        } catch {
          errorMessage = `Unknown Error ${response.status.toString()} (${response.statusText})`
        }

        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Signup failed')
    }
  },

  async verifyOtp(userName: string, otp: string, data?: OtpVerifyRequest): Promise<JwtResponse> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/v1/signup-otp-verify?otp=${otp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        UserName: userName,
      },
      body: JSON.stringify(data || {}),
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'OTP verification failed')
    }
    return response.json()
  },

  async login(credentials: LoginRequest): Promise<JwtResponse> {
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/auth/v1/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      })

      if (!response.ok) {
        let errorMessage = 'Login failed ' + `${response.status.toString()} (${response.statusText})`

        try {
          const errorText = await response.text()
          if (errorText) {
            errorMessage = `${errorText} ${response.status.toString()} (${response.statusText})`
          }
        } catch {
          errorMessage = `Unkonwn Error ${response.status.toString()} (${response.statusText})`
        }

        throw new Error(errorMessage)
      }

      return response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('An unknown error occurred during login')
    }
  },

  async refreshToken(data: RefreshTokenRequest): Promise<JwtResponse> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/v1/refreshToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Token refresh failed')
    }
    return response.json()
  },
}
