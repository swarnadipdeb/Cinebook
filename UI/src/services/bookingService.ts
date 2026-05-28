import api from './api'
import type { Booking, BookingData, PaginatedResponse, Seat, Reservation, BookingRequestDTO, BookingResponseDTO } from '../types'

// POST /bookings/v1/bookings
export const createBooking = (bookingData: BookingData): Promise<Booking> => {
  return api.post('/bookings/v1/bookings', bookingData).then((r) => r.data)
}

// GET /bookings/v1/bookings/{id}
export const getBookingById = (id: string): Promise<Booking | null> => {
  return api.get(`/bookings/v1/bookings/${id}`).then((r) => r.data).catch(() => null)
}

// GET /bookings/v1/bookings/user/{userId}
export const getBookingsByUser = (userId: string): Promise<Booking[]> => {
  return api.get(`/bookings/v1/bookings/user/${userId}`).then((r) => r.data)
}

// GET /bookings/movies/{movieId}/screens/{screenId}/seats
export const getSeatsByScreen = (movieId: string, screenId: string): Promise<Seat[][]> => {
  return api.get(`/bookings/movies/${movieId}/screens/${screenId}/seats`).then((r) => r.data)
}

// POST /bookings/reservations
export const createReservation = (data: { showtimeId: string; screenId: string; seats: string[] }): Promise<Reservation> => {
  return api.post('/bookings/reservations', data).then((r) => r.data)
}

// POST /bookings
export const confirmBooking = (data: BookingRequestDTO): Promise<BookingResponseDTO> => {
  return api.post('/bookings', data).then((r) => r.data)
}

// DELETE /bookings/reservations/{id}
export const cancelReservation = (id: string): Promise<void> => {
  return api.delete(`/bookings/reservations/${id}`).then(() => undefined)
}

// GET /bookings/{bookingId}
export const getBookingByBookingId = (bookingId: string): Promise<BookingResponseDTO> => {
  return api.get(`/bookings/${bookingId}`).then((r) => r.data)
}

// GET /bookings/user/me
export const getMyBookings = (page = 0, size = 10): Promise<PaginatedResponse<BookingResponseDTO>> => {
  return api.get('/bookings/user/me', { params: { page, size } }).then((r) => r.data)
}
