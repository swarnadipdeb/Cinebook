import api from './api'
import type { Booking, BookingData, PaginatedResponse, Seat, Reservation, BookingRequestDTO, BookingResponseDTO } from '../types'


export const createBooking = (bookingData: BookingRequestDTO): Promise<BookingResponseDTO> => {
  return api.post('/bookings/confirm', bookingData).then((r) => r.data)
}


export const getBookingById = (id: string): Promise<Booking | null> => {
  return api.get(`/bookings/${id}`).then((r) => r.data).catch(() => null)
}


export const getBookingsByUser = (userId: string): Promise<Booking[]> => {
  return api.get(`/bookings/user/${userId}`).then((r) => r.data)
}

// GET /booking/movies/{movieId}/screens/{screenId}/seats
export const getSeatsByScreen = (movieId: string, screenId: string): Promise<Seat[][]> => {
  return api.get(`/bookings/movies/${movieId}/screens/${screenId}/seats`)
    .then((r) => {
      const data = r.data
      
      // Handle various response formats
      if (Array.isArray(data)) {
        return data
      }
      
      if (data?.seats && Array.isArray(data.seats)) {
        return data.seats
      }
      
      if (data?.data && Array.isArray(data.data)) {
        return data.data
      }
      
      // Return empty array on unexpected format
      console.warn('Unexpected seat response format:', data)
      return []
    })
    .catch((error) => {
      console.error('Error fetching seats:', error.message)
      return []
    })
}

// POST /bookings
export const confirmBooking = (data: BookingRequestDTO): Promise<BookingResponseDTO> => {
  return api.post('/bookings', data).then((r) => r.data)
}

// POST /booking/reservations
export const createReservation = (data: { showtimeId: string; screenId: string; seats: string[] }): Promise<Reservation> => {
  return api.post('/bookings/reservations', data).then((r) => r.data)
}


// DELETE /booking/reservations/{id}
export const cancelReservation = (id: string): Promise<void> => {
  return api.delete(`/bookings/reservations/${id}`).then(() => undefined)
}

// GET /booking/{bookingId}
export const getBookingByBookingId = (bookingId: string): Promise<BookingResponseDTO> => {
  return api.get(`/bookings/${bookingId}`).then((r) => r.data)
}

// GET /booking/user/me
export const getMyBookings = (page = 0, size = 10): Promise<PaginatedResponse<BookingResponseDTO>> => {
  return api.get('/bookings/user/me', { params: { page, size } }).then((r) => r.data)
}
