import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../store/AuthContext'
import { useFormValidation } from '../../hooks/useFormValidation'

export default function LoginPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const redirect = location.state?.redirect || ROUTES.HOME
  const { login } = useAuth()
  const envUserUsername = (import.meta.env.VITE_LOGIN_USER_USERNAME as string | undefined)?.trim() || ''
  const envUserPassword = (import.meta.env.VITE_LOGIN_USER_PASSWORD as string | undefined)?.trim() || ''
  const envAdminUsername = (import.meta.env.VITE_LOGIN_ADMIN_USERNAME as string | undefined)?.trim() || ''
  const envAdminPassword = (import.meta.env.VITE_LOGIN_ADMIN_PASSWORD as string | undefined)?.trim() || ''
  const { form, errors, handleChange, setErrors } = useFormValidation<{ username: string; password: string }>({ username: '', password: '' })
  const [submitting, setSubmitting] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)

  const hasUserLoginEnv = Boolean(envUserUsername && envUserPassword)
  const hasAdminLoginEnv = Boolean(envAdminUsername && envAdminPassword)

  const handleAutoLogin = async (username: string, password: string) => {
    setRequestError(null)
    setSubmitting(true)

    try {
      const result = await login(username, password)
      if (result.success) {
        navigate(redirect)
      } else {
        setRequestError(result.error || 'Invalid username or password')
      }
    } catch {
      setRequestError('An unexpected error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.username.trim()) errs.username = 'Username is required'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6)
      errs.password = 'Password must be at least 6 characters'
    return errs
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setRequestError(null)
      setErrors(errs as Partial<Record<keyof typeof form, string>>)
      return
    }

    setRequestError(null)
    setSubmitting(true)

    try {
      const result = await login(form.username, form.password)
      if (result.success) {
        navigate(redirect)
      } else {
        setRequestError(result.error || 'Invalid username or password')
      }
    } catch {
      setRequestError('An unexpected error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px-200px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-elevated)] rounded-xl p-8 shadow-[var(--shadow-elevated)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--color-text-heading)] mb-1">Welcome Back</h1>
          <p className="text-[var(--color-text-muted)]">Sign in to continue booking</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="username" className="text-sm font-semibold text-[var(--color-text)]">Username</label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={form.username}
              onChange={handleChange}
              className={`px-4 py-3 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base transition-all duration-150 outline-none placeholder:text-[var(--color-text-muted)] ${
                errors.username ? 'ring-2 ring-[var(--color-error)]' : 'focus:ring-2 focus:ring-[var(--color-primary)]'
              }`}
              placeholder="johndoe"
              aria-describedby={errors.username ? 'username-error' : undefined}
            />
            {errors.username && (
              <span id="username-error" className="text-[13px] text-[var(--color-error)]">{errors.username}</span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-[var(--color-text)]">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              className={`px-4 py-3 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base transition-all duration-150 outline-none placeholder:text-[var(--color-text-muted)] ${
                errors.password ? 'ring-2 ring-[var(--color-error)]' : 'focus:ring-2 focus:ring-[var(--color-primary)]'
              }`}
              placeholder="Enter your password"
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <span id="password-error" className="text-[13px] text-[var(--color-error)]">{errors.password}</span>
            )}
          </div>

          {requestError ? (
            <div className="rounded-lg border border-[var(--color-error)]/20 bg-[var(--color-error)]/10 px-3 py-2 text-sm text-[var(--color-error)]">
              {requestError}
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => handleAutoLogin(envUserUsername, envUserPassword)}
              disabled={submitting || !hasUserLoginEnv}
              className="mt-1 py-4 bg-[var(--color-blue)] text-white rounded-lg font-bold text-base transition-colors duration-150 hover:bg-[var(--color-blue-hover)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Login as User
            </button>
            <button
              type="button"
              onClick={() => handleAutoLogin(envAdminUsername, envAdminPassword)}
              disabled={submitting || !hasAdminLoginEnv}
              className="mt-1 py-4 bg-[var(--color-primary)] text-white rounded-lg font-bold text-base transition-colors duration-150 hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Login as Admin
            </button>
          </div>

          <button
            type="submit"
            className="mt-1 py-4 bg-[var(--color-primary)] text-white rounded-lg font-bold text-base transition-colors duration-150 hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-[var(--color-text-muted)] text-[15px]">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.REGISTER} className="text-[var(--color-primary)] font-semibold hover:underline">Create one</Link>
        </p>
      </div>
    </div>
  )
}
