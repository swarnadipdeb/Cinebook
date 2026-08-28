import api from './api'
import type { ScreenLayout, ShowSlot, ShowtimeResponseDTO } from '../types'

// ---- GET endpoints ----

// GET /catalog/v1/movies/{movieId}/showtimes?embed=true
export const getShowtimesByMovie = (
  movieId: string,
  date?: string,
  startdate?: string,
  enddate?: string
): Promise<ShowtimeResponseDTO[]> => {
  return api
    .get(`/catalog/v1/movies/${movieId}/showtimes`, {
      params: { embed: true, date: date || undefined, startdate: startdate || undefined, enddate: enddate || undefined  },
    })
    .then((r) => r.data)
}

// GET /catalog/v1/theaters/{theaterId}/showtimes?embed=true
export const getShowtimesByTheater = (
  theaterId: string,
  date?: string
): Promise<ShowtimeResponseDTO[]> => {
  return api
    .get(`/catalog/v1/theaters/${theaterId}/showtimes`, {
      params: { embed: true, date: date || undefined },
    })
    .then((r) => r.data)
}

// GET /catalog/v1/showtimes/{id}?embed=true
export const getShowtime = (id: string): Promise<ShowtimeResponseDTO | null> => {
  return api
    .get(`/catalog/v1/showtimes/${id}`, { params: { embed: true } })
    .then((r) => r.data)
    .catch(() => null)
}

// ---- Admin endpoints ----

export interface ShowtimeSlotRequest {
  time: string
  date: string
  premiumPrice: number
  regularPrice: number
  rows: number
  cols: number
  premiumCols: number[]
  aisleAfterCol: number
}

export interface ShowtimeRequest {
  movieId: string
  theaterId: string
  format: string
  slots: ShowtimeSlotRequest[]
}

// POST /catalog/v1/showtimes
export const createShowtime = (data: ShowtimeRequest): Promise<ShowtimeResponseDTO> => {
  return api.post('/catalog/v1/showtimes', data).then((r) => r.data)
}

// PUT /catalog/v1/showtimes/{id}
export const updateShowtime = (id: string, data: ShowtimeRequest): Promise<ShowtimeResponseDTO> => {
  return api.put(`/catalog/v1/showtimes/${id}`, data).then((r) => r.data)
}

// DELETE /catalog/v1/showtimes/{id}
export const deleteShowtime = (id: string): Promise<void> => {
  return api.delete(`/catalog/v1/showtimes/${id}`).then(() => undefined)
}

// GET /bookings/movies/{movieId}/screens/{screenId}/slots
export const getSlotDetails = (
  movieId: string,
  screenId: string
): Promise<ScreenLayout> => {
  return api
    .get(`/bookings/movies/${movieId}/screens/${screenId}/slots`)
    .then((r) => r.data)
}
