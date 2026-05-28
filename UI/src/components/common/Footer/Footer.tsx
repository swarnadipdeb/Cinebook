import { Link } from 'react-router-dom'
import { ROUTES } from '../../../constants/routes'
import { APP_NAME, APP_TAGLINE } from '../../../constants/config'

export default function Footer() {
  return (
    <footer className="bg-[var(--color-bg-card)] py-8 px-4 mt-auto">
      <div className="max-w-[1280px] mx-auto text-center">
        <p className="text-xl font-bold text-[var(--color-text-heading)] mb-1">{APP_NAME}</p>
        <p className="text-sm text-[var(--color-text-muted)]">{APP_TAGLINE}</p>
        <div className="flex justify-center gap-6 mt-6 flex-wrap">
          <Link to={ROUTES.HOME} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors duration-150">Movies</Link>
          <Link to={ROUTES.PROFILE} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors duration-150">My Bookings</Link>
          <Link to={ROUTES.ADMIN} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors duration-150">Admin</Link>
        </div>
        <p className="mt-6 pt-6 border-t border-[var(--color-border)] text-xs text-[var(--color-text-muted)]">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
