import api from './api'
import type { Movie, MoviePageResponse, MovieQueryParams } from '../types'

export const getMovies = (params: MovieQueryParams = {}): Promise<MoviePageResponse> => {
  const query: Record<string, string> = {}
  if (params.page !== undefined) query.page = String(params.page)
  if (params.size !== undefined) query.size = String(params.size)
  if (params.genre) query.genre = params.genre
  if (params.language) query.language = params.language
  if (params.sort) query.sort = params.sort
  if (params.sortDir) query.sortDir = params.sortDir
  return api.get('/catalog/v1/movies', { params: query }).then((r) => r.data)
}

export const searchMovies = (q: string): Promise<Movie[]> => {
  if (!q.trim()) return Promise.resolve([])
  return api.get('/catalog/v1/movies/search', { params: { q } }).then((r) => r.data)
}

export const getMovieById = (id: string): Promise<Movie | null> =>
  api.get(`/catalog/v1/movies/${id}`).then((r) => r.data).catch(() => null)

export const createMovie = (data: Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>): Promise<Movie> =>
  api.post('/catalog/v1/movies', data).then((r) => r.data)

export const updateMovie = (id: string, data: Partial<Movie>): Promise<Movie> =>
  api.put(`/catalog/v1/movies/${id}`, data).then((r) => r.data)

export const deleteMovie = (id: string): Promise<void> =>
  api.delete(`/catalog/v1/movies/${id}`).then((r) => r.data as undefined)
