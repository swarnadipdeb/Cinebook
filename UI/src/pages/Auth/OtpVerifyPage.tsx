import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { useAuth } from '../../store/AuthContext'

export default function OtpVerifyPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { verifyOtp } = useAuth()
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { userName, firstName, lastName, phone } = (location.state as { userName: string; firstName: string; lastName: string; phone: string }) || {}

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP')
      return
    }

    if (!userName) {
      setError('Session expired. Please register again.')
      return
    }

    setSubmitting(true)
    const result = await verifyOtp(userName, otp, firstName, lastName, phone || undefined)
    setSubmitting(false)

    if (result.success) {
      navigate(ROUTES.HOME)
    } else {
      setError(result.error || 'Invalid OTP. Please try again.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-72px-200px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px] bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-elevated)] rounded-xl p-8 shadow-[var(--shadow-elevated)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--color-text-heading)] mb-1">Verify OTP</h1>
          <p className="text-[var(--color-text-muted)]">Enter the 6-digit code sent to your email</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <div className="flex flex-col gap-2">
            <label htmlFor="otp" className="text-sm font-semibold text-[var(--color-text)]">OTP Code</label>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className={`px-4 py-3 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base transition-all duration-150 outline-none text-center text-2xl tracking-[0.5em] placeholder:text-[var(--color-text-muted)] ${
                error ? 'ring-2 ring-[var(--color-error)]' : 'focus:ring-2 focus:ring-[var(--color-primary)]'
              }`}
              placeholder="------"
              aria-describedby={error ? 'otp-error' : undefined}
            />
            {error && (
              <span id="otp-error" className="text-[13px] text-[var(--color-error)] text-center">{error}</span>
            )}
          </div>

          <button
            type="submit"
            className="mt-1 py-4 bg-[var(--color-primary)] text-white rounded-lg font-bold text-base transition-colors duration-150 hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={submitting}
          >
            {submitting ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <p className="text-center mt-6 text-[var(--color-text-muted)] text-[15px]">
          Didn't receive code?{' '}
          <button onClick={() => navigate(ROUTES.REGISTER)} className="text-[var(--color-primary)] font-semibold hover:underline">Resend</button>
        </p>
      </div>
    </div>
  )
}