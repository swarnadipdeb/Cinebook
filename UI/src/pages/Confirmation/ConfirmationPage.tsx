import { useState } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '../../constants/routes'
import { formatPrice } from '../../utils/formatPrice'
import { confirmBooking, cancelReservation, createBooking } from '../../services/bookingService'
import type { Movie, ShowtimeResponseDTO, ShowSlot, Seat, Booking, Reservation, BookingResponseDTO, BookingRequestDTO } from '../../types'

interface LocationState {
  booking?: Booking
  reservation?: Reservation
  movie?: Movie
  showtime?: ShowtimeResponseDTO
  slot?: ShowSlot
  selectedSeats?: Seat[]
  totalPrice?: number
}

export default function ConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = (location.state || {}) as LocationState

  const {
    booking,
    reservation,
    movie,
    showtime,
    slot,
    selectedSeats = [],
    totalPrice,
  } = state

  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState<BookingResponseDTO | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [log, setLog] = useState<any>(null) // unused state for logging purposes

  const handleCancel = async () => {
    if (!reservation) return
    try {
      await cancelReservation(reservation.id)
    } finally {
      navigate(ROUTES.HOME)
    }
  }

  const handleConfirmBooking = async () => {
    if (!reservation || !movie || !showtime || !slot) return
    setConfirming(true)
    setError(null)
    try {
      const bookingSeats: BookingRequestDTO['seats'] = selectedSeats.map((s) => ({
        row: s.row,
        col: s.col,
        type: s.type,
        price: s.price,
      }))

      

      const request: BookingRequestDTO = {
        reservationId: reservation.id,
        showtimeId: showtime.id,
        movieId: movie.id,
        theaterId: showtime.theaterId,
        screenId: slot.screenId,
        time: slot.time,
        seats: bookingSeats,
        totalPrice: totalPrice || 0,
      }

      const response = await createBooking(request)
      setConfirmed(response)
    } catch(error: any) {
      setError(`Failed to confirm booking. Your seat reservation is still active. ${error.message}`)
    } finally {
      setConfirming(false)
    }
  }

  const seatList = (selectedSeats || []).map((s) => `${s.row}${s.col}`).join(', ')

  if (!movie || !slot || (!booking && !reservation)) {
    return (
      <div className="max-w-[800px] mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-[var(--color-text-heading)] mb-2">Booking not found</h2>
          <Link to={ROUTES.HOME} className="text-[var(--color-primary)] hover:underline">Back to Home</Link>
        </div>
      </div>
    )
  }

  const total = totalPrice ?? booking?.totalPrice ?? 0

  const renderTicket = () => (
    <div className="bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-elevated)] rounded-xl flex overflow-hidden relative mb-8 shadow-[var(--shadow-elevated)]">
      <div className="flex-1 p-6">
        <div className="flex gap-4 mb-6 pb-6">
          <img src={movie.poster} alt={movie.title} className="w-20 rounded-lg flex-shrink-0" />
          <div className="flex flex-col justify-center">
            <h2 className="text-xl font-extrabold text-[var(--color-text-heading)] mb-0.5">{movie.title}</h2>
            <p className="text-[var(--color-text-muted)] text-sm">{showtime?.theater?.name} &middot; {showtime?.format}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Date</span>
            <span className="font-bold text-[var(--color-text-heading)]">{slot?.date}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Time</span>
            <span className="font-bold text-[var(--color-text-heading)]">{slot?.time}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Seats</span>
            <span className="font-bold text-[var(--color-text-heading)]">{seatList}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">Total</span>
            <span className="font-bold text-[var(--color-text-heading)]">{formatPrice(total)}</span>
          </div>
        </div>
      </div>

      <div className="w-[200px] bg-[var(--color-bg-elevated)] p-6 flex flex-col items-center justify-center gap-4">
        <div className="text-center">
          <div className="w-[120px] h-[120px] text-[var(--color-text-heading)] mb-1 mx-auto">
            <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
              <rect x="10" y="10" width="25" height="25" rx="2" />
              <rect x="65" y="10" width="25" height="25" rx="2" />
              <rect x="10" y="65" width="25" height="25" rx="2" />
              <rect x="40" y="40" width="20" height="20" rx="2" />
              <rect x="15" y="15" width="15" height="15" rx="1" fill="white" />
              <rect x="70" y="15" width="15" height="15" rx="1" fill="white" />
              <rect x="15" y="70" width="15" height="15" rx="1" fill="white" />
              <rect x="45" y="45" width="10" height="10" rx="1" fill="white" />
            </svg>
          </div>
          <p className="text-xs text-[var(--color-text-muted)]">Scan at venue</p>
        </div>

        {confirmed && (
          <div className="text-center">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-0.5">
              Booking ID
            </span>
            <span className="font-mono text-sm font-bold text-[var(--color-primary)] break-all">
              {confirmed.bookingId}
            </span>
          </div>
        )}
      </div>

      <div className="absolute top-0 bottom-0 left-[calc(100%-200px)] w-px bg-[var(--color-border)]" />
    </div>
  )

  const renderConfirmedView = () => (
    <>
      <div className="text-center mb-10">
        <div className="w-[72px] h-[72px] bg-[var(--color-success)] rounded-full flex items-center justify-center mx-auto mb-5 text-white">
          <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-[var(--color-text-heading)] mb-1">Booking Confirmed!</h1>
        <p className="text-lg text-[var(--color-text-muted)]">Your tickets have been sent to your registered email.</p>
      </div>
      {renderTicket()}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => window.print()}
          className="px-8 py-3 bg-[var(--color-bg-elevated)] text-[var(--color-text)] rounded-lg font-semibold transition-all duration-150 hover:bg-[var(--color-primary)] hover:text-white"
        >
          Print Ticket
        </button>
        <Link
          to={ROUTES.HOME}
          className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-lg font-bold transition-colors duration-150 hover:bg-[var(--color-primary-hover)]"
        >
          Book More
        </Link>
      </div>
    </>
  )

  const renderAwaitingConfirmation = () => (
    <>
      <div className="text-center mb-10">
        <div className="w-[72px] h-[72px] bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-5 text-white">
          <svg className="w-9 h-9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold text-[var(--color-text-heading)] mb-1">Confirm Your Booking</h1>
        <p className="text-lg text-[var(--color-text-muted)]">Review your details and confirm to complete your booking.</p>
      </div>
      {renderTicket()}
      {error && (
        <div className="mb-6 p-4 bg-[var(--color-bg)] rounded-lg text-[var(--color-error)] text-sm border border-[var(--color-error)]/30 text-center">
          {error}
        </div>
      )}
      <div className="flex justify-center gap-4">
        <button
          onClick={handleCancel}
          className="px-8 py-3 bg-[var(--color-bg-elevated)] text-[var(--color-text)] rounded-lg font-semibold transition-all duration-150 hover:bg-[var(--color-bg-card)]"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmBooking}
          disabled={confirming}
          className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-lg font-bold transition-colors duration-150 hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {confirming ? 'Confirming...' : 'Confirm Booking'}
        </button>
      </div>
    </>
  )

  return (
    <div className="max-w-[800px] mx-auto px-4 py-8">
      {confirmed ? renderConfirmedView() : (booking ? renderConfirmedView() : renderAwaitingConfirmation())}
    </div>
  )
}
