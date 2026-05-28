import { useState, useEffect, useCallback } from 'react'
import { getMovies } from '../services/movieService'
import type { Movie, MoviePageResponse, MovieQueryParams } from '../types'

export function useMovies(initialParams: MovieQueryParams = {}) {
  const [response, setResponse] = useState<MoviePageResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params, setParams] = useState<MovieQueryParams>(initialParams)

  const fetchMovies = useCallback((queryParams: MovieQueryParams) => {
    setLoading(true)
    getMovies(queryParams)
      .then((data) => {
        setResponse(data)
        setError(null)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    fetchMovies(params)
  }, [fetchMovies, params])

  const movies = response?.content ?? []
  const totalPages = response?.totalPages ?? 0
  const totalElements = response?.totalElements ?? 0
  const currentPage = response?.currentPage ?? 0

  const setPage = (page: number) => setParams((p) => ({ ...p, page }))
  const setGenre = (genre: string) => setParams((p) => ({ ...p, page: 0, genre: genre || undefined }))
  const setSize = (size: number) => setParams((p) => ({ ...p, size }))

  return {
    movies,
    loading,
    error,
    totalPages,
    totalElements,
    currentPage,
    params,
    setPage,
    setGenre,
    setSize,
    setParams,
  }
}
