import api from './api'
import type { Theater } from '../types'

// GET /catalog/v1/theaters
export const getTheaters = (): Promise<Theater[]> => {
  return api.get('/catalog/v1/theaters').then((r) => r.data)
}

// GET /catalog/v1/theaters/{id}
export const getTheater = (id: string): Promise<Theater | null> => {
  return api.get(`/catalog/v1/theaters/${id}`).then((r) => r.data).catch(() => null)
}

// POST /catalog/v1/theaters
export const createTheater = (data: { name: string; address: string; screens: number; amenities: string[] }): Promise<Theater> => {
  return api.post('/catalog/v1/theaters', data).then((r) => r.data)
}

// PUT /catalog/v1/theaters/{id}
export const updateTheater = (id: string, data: { name: string; address: string; screens: number; amenities: string[] }): Promise<Theater> => {
  return api.put(`/catalog/v1/theaters/${id}`, data).then((r) => r.data)
}

// DELETE /catalog/v1/theaters/{id}
export const deleteTheater = (id: string): Promise<void> => {
  return api.delete(`/catalog/v1/theaters/${id}`).then(() => undefined)
}
