import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../store/AuthContext'
import { useFormValidation, EMAIL_REGEX } from '../../hooks/useFormValidation'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { form, errors, handleChange, setErrors } = useFormValidation<{ userName: string; email: string; password: string; confirmPassword: string; firstName: string; lastName: string; phone: string }>({
    userName: '', email: '', password: '', confirmPassword: '', firstName: '', lastName: '', phone: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [requestError, setRequestError] = useState<string | null>(null)

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.userName.trim()) errs.userName = 'Username is required'
    if (!form.email) errs.email = 'Email is required'
    else if (!EMAIL_REGEX.test(form.email))
      errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 6)
      errs.password = 'Password must be at least 6 characters'
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = 'Passwords do not match'
    if (!form.firstName.trim()) errs.firstName = 'First name is required'
    if (!form.lastName.trim()) errs.lastName = 'Last name is required'
    if (!form.phone.trim()) errs.phone = 'Phone number is required'
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
      const result = await register(form.userName, form.email, form.password, [{ name: 'ROLE_USER' }])
      if (result.success && result.userName) {
        navigate(ROUTES.OTP_VERIFY, { state: { userName: result.userName, firstName: form.firstName, lastName: form.lastName, phone: form.phone } })
      } else {
        setRequestError(result.error || 'Signup failed. Please try again.')
      }
    } catch {
      setRequestError('An unexpected error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px-200px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-elevated)] rounded-xl p-6 shadow-[var(--shadow-elevated)]">
        <div className="text-center mb-5">
          <h1 className="text-2xl font-extrabold text-[var(--color-text-heading)] mb-1">Create Account</h1>
          <p className="text-[var(--color-text-muted)] text-sm">Join CineBook and start booking</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1">
            <label htmlFor="userName" className="text-sm font-semibold text-[var(--color-text)]">Username</label>
            <input
              id="userName"
              name="userName"
              type="text"
              autoComplete="username"
              value={form.userName}
              onChange={handleChange}
              className={`px-4 py-2.5 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base transition-all duration-150 outline-none placeholder:text-[var(--color-text-muted)] ${
                errors.userName ? 'ring-2 ring-[var(--color-error)]' : 'focus:ring-2 focus:ring-[var(--color-primary)]'
              }`}
              placeholder="johndoe"
              aria-describedby={errors.userName ? 'userName-error' : undefined}
            />
            {errors.userName && (
              <span id="userName-error" className="text-[12px] text-[var(--color-error)]">{errors.userName}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-semibold text-[var(--color-text)]">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              className={`px-4 py-2.5 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base transition-all duration-150 outline-none placeholder:text-[var(--color-text-muted)] ${
                errors.email ? 'ring-2 ring-[var(--color-error)]' : 'focus:ring-2 focus:ring-[var(--color-primary)]'
              }`}
              placeholder="you@example.com"
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && (
              <span id="email-error" className="text-[12px] text-[var(--color-error)]">{errors.email}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-sm font-semibold text-[var(--color-text)]">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              className={`px-4 py-2.5 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base transition-all duration-150 outline-none placeholder:text-[var(--color-text-muted)] ${
                errors.password ? 'ring-2 ring-[var(--color-error)]' : 'focus:ring-2 focus:ring-[var(--color-primary)]'
              }`}
              placeholder="At least 6 characters"
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
            {errors.password && (
              <span id="password-error" className="text-[12px] text-[var(--color-error)]">{errors.password}</span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="confirmPassword" className="text-sm font-semibold text-[var(--color-text)]">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`px-4 py-2.5 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base transition-all duration-150 outline-none placeholder:text-[var(--color-text-muted)] ${
                errors.confirmPassword ? 'ring-2 ring-[var(--color-error)]' : 'focus:ring-2 focus:ring-[var(--color-primary)]'
              }`}
              placeholder="Repeat your password"
              aria-describedby={errors.confirmPassword ? 'confirm-error' : undefined}
            />
            {errors.confirmPassword && (
              <span id="confirm-error" className="text-[12px] text-[var(--color-error)]">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="flex gap-3">
  <div className="flex flex-col gap-1 flex-1 min-w-0">
    <label htmlFor="firstName" className="text-sm font-semibold text-[var(--color-text)]">
      First Name
    </label>
    <input
      id="firstName"
      name="firstName"
      type="text"
      autoComplete="given-name"
      value={form.firstName}
      onChange={handleChange}
      className={`w-full px-4 py-2.5 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base transition-all duration-150 outline-none placeholder:text-[var(--color-text-muted)] ${
        errors.firstName
          ? 'ring-2 ring-[var(--color-error)]'
          : 'focus:ring-2 focus:ring-[var(--color-primary)]'
      }`}
      placeholder="John"
    />
  </div>

  <div className="flex flex-col gap-1 flex-1 min-w-0">
    <label htmlFor="lastName" className="text-sm font-semibold text-[var(--color-text)]">
      Last Name
    </label>
    <input
      id="lastName"
      name="lastName"
      type="text"
      autoComplete="family-name"
      value={form.lastName}
      onChange={handleChange}
      className={`w-full px-4 py-2.5 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base transition-all duration-150 outline-none placeholder:text-[var(--color-text-muted)] ${
        errors.lastName
          ? 'ring-2 ring-[var(--color-error)]'
          : 'focus:ring-2 focus:ring-[var(--color-primary)]'
      }`}
      placeholder="Doe"
    />
  </div>
</div>

          <div className="flex flex-col gap-1">
            <label htmlFor="phone" className="text-sm font-semibold text-[var(--color-text)]">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={form.phone}
              onChange={handleChange}
              className={`px-4 py-2.5 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base transition-all duration-150 outline-none placeholder:text-[var(--color-text-muted)] ${
                errors.phone ? 'ring-2 ring-[var(--color-error)]' : 'focus:ring-2 focus:ring-[var(--color-primary)]'
              }`}
              placeholder="+1 234 567 8900"
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
            {errors.phone && (
              <span id="phone-error" className="text-[12px] text-[var(--color-error)]">{errors.phone}</span>
            )}
          </div>

          {requestError ? (
            <div className="rounded-lg border border-[var(--color-error)]/20 bg-[var(--color-error)]/10 px-3 py-2 text-sm text-[var(--color-error)]">
              {requestError}
            </div>
          ) : null}

          <button
            type="submit"
            className="mt-1 py-3 bg-[var(--color-primary)] text-white rounded-lg font-bold text-base transition-colors duration-150 hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center mt-4 text-[var(--color-text-muted)] text-[14px]">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="text-[var(--color-primary)] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
