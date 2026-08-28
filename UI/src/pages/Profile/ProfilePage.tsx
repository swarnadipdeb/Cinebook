import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../store/AuthContext'
import { getUserInfo } from '../../services/userService'
import { getMyBookings, deleteBooking } from '../../services/bookingService'
import type { UserInfo, PaginatedResponse, BookingResponseDTO } from '../../types'

const PAGE_SIZE = 10

export default function ProfilePage() {
  const { user, logout } = useAuth()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [bookingsPage, setBookingsPage] = useState<PaginatedResponse<BookingResponseDTO> | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  // Edit state
  const [editing, setEditing] = useState(false)
  const [formFirstName, setFormFirstName] = useState('')
  const [formLastName, setFormLastName] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [saving, setSaving] = useState(false)
  const [picFile, setPicFile] = useState<File | null>(null)
  const [picPreview, setPicPreview] = useState<string | null>(null)
  const [removePic, setRemovePic] = useState(false)
  const picInputRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)

    try {
      const [userRes, bookingsRes] = await Promise.all([
        getUserInfo(),
        getMyBookings(0, PAGE_SIZE),
      ])
      setUserInfo(userRes)
      setBookingsPage(bookingsRes)
      if (userRes.profilePic) {
        localStorage.setItem('profilePic', userRes.profilePic)
      } else {
        localStorage.removeItem('profilePic')
      }
      window.dispatchEvent(new Event('profile-pic-updated'))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const startEdit = () => {
    if (!userInfo) return
    setFormFirstName(userInfo.firstName || '')
    setFormLastName(userInfo.lastName || '')
    setFormPhone(userInfo.phoneNumber?.toString() || '')
    setFormEmail(userInfo.email || '')
    setPicFile(null)
    setPicPreview(userInfo.profilePic || null)
    setRemovePic(false)
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setPicFile(null)
    setPicPreview(null)
    setRemovePic(false)
  }

  const handlePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPicFile(file)
    setPicPreview(URL.createObjectURL(file))
  }

  const saveEdit = async () => {
    if (!userInfo) return
    setSaving(true)
    setError(null)
    try {
      let profilePic: string | undefined
      if (removePic) {
        profilePic = ''
      } else if (picFile) {
        const reader = new FileReader()
        profilePic = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(picFile)
        })
      }

      const body: Record<string, unknown> = {
        first_name: formFirstName,
        last_name: formLastName,
        phone_number: formPhone ? parseInt(formPhone, 10) : null,
        email: formEmail,
      }
      if (profilePic !== undefined) {
        body.profile_pic = profilePic
      }

      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/v1/createUpdate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(body),
      })
      if (!res.ok) throw new Error((await res.text()) || 'Update failed')
      const updated = await getUserInfo()
      setUserInfo(updated)
      if (updated.profilePic) {
        localStorage.setItem('profilePic', updated.profilePic)
      } else {
        localStorage.removeItem('profilePic')
      }
      window.dispatchEvent(new Event('profile-pic-updated'))
      setEditing(false)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const loadPage = async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await getMyBookings(p, PAGE_SIZE)
      setBookingsPage(res)
      setPage(p)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    const ok = window.confirm('Are you sure you want to cancel this booking?')
    if (!ok) return
    setCancellingId(bookingId)
    setError(null)
    try {
      await deleteBooking(bookingId)
      // refresh current page
      await loadPage(page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel booking')
    } finally {
      setCancellingId(null)
    }
  }

  if (!user) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-[var(--color-text-heading)] mb-8">My Profile</h1>
        <div className="text-center py-16 text-[var(--color-text-muted)]">
          <p>You are not signed in.</p>
        </div>
      </div>
    )
  }

  const firstName = userInfo?.firstName || ''
  const lastName = userInfo?.lastName || ''
  const fullName = `${firstName} ${lastName}`.trim() || user.name

  if (loading && !userInfo) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold text-[var(--color-text-heading)] mb-8">My Profile</h1>
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <h1 className="text-4xl font-extrabold text-[var(--color-text-heading)] mb-8">My Profile</h1>

      {error && (
        <div className="mb-6 p-4 bg-[var(--color-error)]/20 rounded-lg text-[var(--color-error)]">
          {error}
        </div>
      )}

      <div className="max-w-[600px]">
        {/* User Card */}
        <div className="bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-elevated)] rounded-xl p-6 flex items-center gap-5 mb-8">
          <div className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-2xl font-extrabold flex-shrink-0 overflow-hidden bg-[var(--color-primary)] text-white">
            {userInfo?.profilePic ? (
              <img src={userInfo.profilePic} alt={fullName} className="w-full h-full object-cover" />
            ) : (
              fullName?.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold text-[var(--color-text-heading)] mb-0.5 truncate">{fullName}</h2>
            <p className="text-[var(--color-text-muted)]">{userInfo?.email || user.email}</p>
          </div>
        </div>

        {/* Account Details */}
        {userInfo && !editing && (
          <div className="bg-[var(--color-bg-card)] rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[var(--color-text-heading)]">Account Details</h3>
              <button
                onClick={startEdit}
                className="text-sm text-[var(--color-primary)] hover:underline font-medium"
              >
                Edit
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Username</span>
                <span className="text-[var(--color-text)]">{userInfo.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">First Name</span>
                <span className="text-[var(--color-text)]">{firstName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Last Name</span>
                <span className="text-[var(--color-text)]">{lastName || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Email</span>
                <span className="text-[var(--color-text)]">{userInfo.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-text-muted)]">Phone</span>
                <span className="text-[var(--color-text)]">{userInfo.phoneNumber || '—'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form */}
        {editing && (
          <div className="bg-[var(--color-bg-card)] rounded-xl p-6 mb-8">
            <h3 className="text-lg font-bold text-[var(--color-text-heading)] mb-4">Edit Profile</h3>
            <div className="space-y-4">
              {/* Profile Picture */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--color-bg)] border-2 border-[rgba(255,255,255,0.1)] flex items-center justify-center">
                  {picPreview && !removePic ? (
                    <img src={picPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-[var(--color-text-muted)]">
                      {fullName?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex gap-3">
                  <input
                    ref={picInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePicChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => { setRemovePic(false); picInputRef.current?.click() }}
                    className="text-sm text-[var(--color-primary)] hover:underline font-medium"
                  >
                    {picPreview && !removePic ? 'Change photo' : 'Upload photo'}
                  </button>
                  {picPreview && !removePic && (
                    <button
                      type="button"
                      onClick={() => setRemovePic(true)}
                      className="text-sm text-[var(--color-error)] hover:underline font-medium"
                    >
                      Remove
                    </button>
                  )}
                  {removePic && (
                    <button
                      type="button"
                      onClick={() => { setRemovePic(false); setPicPreview(userInfo?.profilePic || null) }}
                      className="text-sm text-[var(--color-primary)] hover:underline font-medium"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-1">First Name</label>
                <input
                  type="text"
                  value={formFirstName}
                  onChange={(e) => setFormFirstName(e.target.value)}
                  className="w-full bg-[var(--color-bg)] rounded-lg px-3 py-2 text-[var(--color-text)] border border-[rgba(255,255,255,0.1)] focus:border-[var(--color-primary)] outline-none"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-1">Last Name</label>
                <input
                  type="text"
                  value={formLastName}
                  onChange={(e) => setFormLastName(e.target.value)}
                  className="w-full bg-[var(--color-bg)] rounded-lg px-3 py-2 text-[var(--color-text)] border border-[rgba(255,255,255,0.1)] focus:border-[var(--color-primary)] outline-none"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-1">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full bg-[var(--color-bg)] rounded-lg px-3 py-2 text-[var(--color-text)] border border-[rgba(255,255,255,0.1)] focus:border-[var(--color-primary)] outline-none"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm text-[var(--color-text-muted)] mb-1">Phone</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full bg-[var(--color-bg)] rounded-lg px-3 py-2 text-[var(--color-text)] border border-[rgba(255,255,255,0.1)] focus:border-[var(--color-primary)] outline-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={saveEdit}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-semibold disabled:opacity-50 transition-colors hover:opacity-90"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-[var(--color-bg-elevated)] text-[var(--color-text)] rounded-lg font-semibold disabled:opacity-50 transition-colors hover:bg-[var(--color-bg-card)]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking History */}
        <div className="mb-8">
          <h3 className="text-lg font-bold text-[var(--color-text-heading)] mb-4 pb-3">Booking History</h3>

          {(bookingsPage?.content?.length ?? 0) > 0 ? (
            <>
              <div className="space-y-4 mb-6">
                {bookingsPage.content.map((booking) => {
                  const seatCount = booking.seats?.length ?? 0
                  return (
                    <div key={booking.id} className="bg-[var(--color-bg-card)] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-[var(--color-text-heading)]">
                          #{booking.bookingId}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          booking.status === 'CONFIRMED' || booking.status === 'ACTIVE'
                            ? 'bg-[var(--color-seat-available)]/20 text-[var(--color-seat-available)]'
                            : 'bg-[var(--color-text-muted)]/20 text-[var(--color-text-muted)]'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--color-text-muted)]">
                          {seatCount} seat{seatCount > 1 ? 's' : ''}
                        </span>
                        <span className="font-bold text-[var(--color-primary)]">
                          ₹{booking.totalPrice.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)] mt-1">
                        {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                      {(booking.status === 'confirmed' || booking.status === 'ACTIVE') && (
                        <div className="flex items-center justify-end mt-3">
                          <button
                            onClick={() => handleCancelBooking(booking.bookingId)}
                            disabled={cancellingId === booking.bookingId}
                            className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-[var(--color-error)] text-white disabled:opacity-50 transition-colors hover:opacity-90"
                          >
                            {cancellingId === booking.bookingId ? 'Cancelling...' : 'Cancel'}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {(bookingsPage?.totalPages ?? 0) > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => loadPage(page - 1)}
                    disabled={page === 0}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--color-bg-card)] text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-bg-elevated)] transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-[var(--color-text-muted)]">
                    {page + 1} / {bookingsPage.totalPages}
                  </span>
                  <button
                    onClick={() => loadPage(page + 1)}
                    disabled={page >= bookingsPage.totalPages - 1}
                    className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--color-bg-card)] text-[var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-bg-elevated)] transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-[var(--color-text-muted)] py-8">No bookings yet</p>
          )}
        </div>

        <button
          onClick={logout}
          className="px-6 py-3 bg-[var(--color-error)] text-white rounded-lg font-semibold transition-all duration-150 hover:opacity-90"
        >
          Sign Out
        </button>
      </div>
    </div>
  )
}
