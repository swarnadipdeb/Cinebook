import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { Movie, ShowtimeResponseDTO, ShowSlot, Seat, BookingContextValue } from '../types'

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: { children: ReactNode }) {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [selectedShowtime, setSelectedShowtime] = useState<ShowtimeResponseDTO | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<ShowSlot | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [bookingId, setBookingId] = useState<string | null>(null)

  const selectMovie = useCallback((movie: Movie) => {
    setSelectedMovie(movie)
    setSelectedShowtime(null)
    setSelectedSlot(null)
    setSelectedSeats([])
    setTotalPrice(0)
  }, [])

  const selectShowtime = useCallback((showtime: ShowtimeResponseDTO, slot: ShowSlot) => {
    setSelectedShowtime(showtime)
    setSelectedSlot(slot)
    setSelectedSeats([])
    setTotalPrice(0)
  }, [])

  const toggleSeat = useCallback((seat: Seat) => {
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.row === seat.row && s.col === seat.col)
      if (exists) {
        setTotalPrice((p) => p - seat.price)
        return prev.filter((s) => !(s.row === seat.row && s.col === seat.col))
      }
      setTotalPrice((p) => p + seat.price)
      return [...prev, seat]
    })
  }, [])

  const clearBooking = useCallback(() => {
    setSelectedMovie(null)
    setSelectedShowtime(null)
    setSelectedSlot(null)
    setSelectedSeats([])
    setTotalPrice(0)
    setBookingId(null)
  }, [])

  const confirmBooking = useCallback((id: string) => {
    setBookingId(id)
  }, [])

  return (
    <BookingContext.Provider
      value={{
        selectedMovie,
        selectedShowtime,
        selectedSlot,
        selectedSeats,
        totalPrice,
        bookingId,
        selectMovie,
        selectShowtime,
        toggleSeat,
        clearBooking,
        confirmBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking(): BookingContextValue {
  const context = useContext(BookingContext)
  if (!context) throw new Error('useBooking must be used within BookingProvider')
  return context
}
