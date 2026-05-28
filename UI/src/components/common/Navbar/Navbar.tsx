import { Link } from 'react-router-dom'
import { useState, useRef, useEffect, useCallback } from 'react'
import { ROUTES } from '../../../constants/routes'
import { APP_NAME } from '../../../constants/config'
import { useAuth } from '../../../store/AuthContext'

const getProfilePic = (): string | null => localStorage.getItem('profilePic')

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user) {
      setProfilePic(getProfilePic())
    }
  }, [user])

  useEffect(() => {
    const handleUpdate = () => setProfilePic(getProfilePic())
    window.addEventListener('profile-pic-updated', handleUpdate)
    return () => window.removeEventListener('profile-pic-updated', handleUpdate)
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  return (
    <nav className="sticky top-0 z-50 h-[72px] bg-[rgba(13,13,18,0.95)] backdrop-blur-[12px]">
      <div className="max-w-[1280px] h-full mx-auto px-4 flex items-center justify-between">
        <Link to={ROUTES.HOME} className="text-2xl font-extrabold text-[var(--color-text-heading)] tracking-tight">
          Cine<span className="text-[var(--color-primary)]">Book</span>
        </Link>

        <div className="flex items-center gap-6">
          {isAdmin && (
            <Link
              to={ROUTES.ADMIN}
              className="relative text-[var(--color-text)] text-[15px] font-medium transition-colors duration-150 hover:text-[var(--color-text-heading)] before:absolute before:bottom-[-4px] before:left-0 before:w-0 before:h-[2px] before:bg-[var(--color-primary)] before:transition-all before:duration-150 hover:before:w-full"
            >
              Admin
            </Link>
          )}
          {isLoggedIn ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 text-[var(--color-text)] text-[15px] font-medium transition-colors duration-150 hover:text-[var(--color-text-heading)]"
              >
                <span className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                  {profilePic ? (
                    <img src={profilePic} alt="" className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase()
                  )}
                </span>
                <span>{user?.name}</span>
                <svg className={`w-4 h-4 transition-transform duration-150 ${showProfileMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--color-bg-card)] border border-[rgba(255,255,255,0.1)] rounded-lg shadow-xl overflow-hidden">
                  <Link
                    to={ROUTES.PROFILE}
                    onClick={() => setShowProfileMenu(false)}
                    className="block px-4 py-3 text-[var(--color-text)] text-sm hover:bg-[rgba(170,59,255,0.1)] transition-colors duration-150"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => { logout(); setShowProfileMenu(false) }}
                    className="w-full text-left px-4 py-3 text-[var(--color-text)] text-sm hover:bg-[rgba(170,59,255,0.1)] transition-colors duration-150"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to={ROUTES.LOGIN}
              className="px-5 py-2 bg-[var(--color-primary)] text-white rounded-lg font-semibold text-sm transition-colors duration-150 hover:bg-[var(--color-primary-hover)]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
