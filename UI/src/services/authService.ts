import { decodeJwt } from '../utils/jwtDecode'

export interface SignupRequest {
  user_name: string
  email: string
  password: string
  roles?: string[]
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

  async signup(data: SignupRequest): Promise<{ user_name: string }> {
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Signup failed')
    }
    return response.json()
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/auth/v1/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Login failed')
    }
    return response.json()
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
