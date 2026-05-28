import { useState, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import SeatMap from '../../components/features/seats/SeatMap'
import SeatLegend from '../../components/features/seats/SeatLegend'
import BookingSummary from '../../components/features/booking/BookingSummary'
import { createReservation, getSeatsByScreen } from '../../services/bookingService'
import { useAuth } from '../../store/AuthContext'
import { ROUTES } from '../../constants/routes'
import type { Movie, ShowtimeResponseDTO, ShowSlot, Seat, Reservation } from '../../types'

export default function SeatSelectionPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { movie, showtime, slot } = (location.state || {}) as {
    movie: Movie
    showtime: ShowtimeResponseDTO
    slot: ShowSlot
  }

  const [seatGrid, setSeatGrid] = useState<Seat[][]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [reservationError, setReservationError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn) {
      if (!movie || !slot) return
      navigate(ROUTES.LOGIN, {
        state: {
          redirect: location.pathname,
        },
      })
    }
  }, [isLoggedIn, movie, slot, navigate, location.pathname])

  useEffect(() => {
    if (!movie || !slot) return
    setLoading(true)
    getSeatsByScreen(movie.id, slot.screenId)
      .then((grid) => {
        setSeatGrid(grid)
        setLoading(false)
      })
      .catch(() => {
        setSeatGrid([])
        setLoading(false)
      })
  }, [movie, slot])

  const totalPrice = useMemo(
    () => selectedSeats.reduce((sum, s) => sum + s.price, 0),
    [selectedSeats]
  )

  const matchSeat = (a: Seat, b: Seat) =>
    a.row === b.row && a.col === b.col && (a.idx ?? 0) === (b.idx ?? 0)

  const toggleSeat = (seat: Seat) => {
    setSelectedSeats((prev) => {
      const found = prev.find((s) => matchSeat(s, seat))
      if (found) {
        return prev.filter((s) => !matchSeat(s, seat))
      }
      return [...prev, seat]
    })
  }

  const handleConfirm = async () => {
    if (!movie || !showtime || selectedSeats.length === 0) return
    setReservationError(null)
    try {
      const reservation: Reservation = await createReservation({
        showtimeId: showtime.id,
        screenId: slot.screenId,
        seats: selectedSeats.map((s) => `${s.row}${s.col}`),
      })
      navigate(ROUTES.BOOKING_CONFIRM, {
        state: {
          reservation,
          movie,
          showtime,
          slot,
          selectedSeats,
          totalPrice,
        },
      })
    } catch {
      setReservationError('Failed to reserve seats. Please try again.')
    }
  }

  if (!movie || !slot) {
    return (
      <div className="text-center py-16 text-[var(--color-text-muted)]">
        <p>No showtime selected. Please go back and choose a showtime.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-16 text-[var(--color-text-muted)]">
        <p>Loading seat map...</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-[var(--color-text-heading)] mb-6">Select Your Seats</h1>
        <SeatLegend />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div className="bg-[var(--color-bg-card)] rounded-xl overflow-hidden shadow-[var(--shadow-card)]">
          <SeatMap
            seatGrid={seatGrid}
            selectedSeats={selectedSeats}
            onToggle={toggleSeat}
          />
        </div>

        <div className="min-w-0">
          {reservationError && (
            <div className="mb-4 p-4 bg-[var(--color-bg)] rounded-lg text-[var(--color-error)] text-sm border border-[var(--color-error)]/30">
              {reservationError}
            </div>
          )}
          <BookingSummary
            movie={movie}
            showtime={showtime}
            slot={slot}
            selectedSeats={selectedSeats}
            totalPrice={totalPrice}
            onConfirm={handleConfirm}
          />
        </div>
      </div>
    </div>
  )
}
