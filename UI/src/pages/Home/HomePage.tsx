import { useState, useEffect, useMemo, useCallback } from 'react'
import MovieGrid from '../../components/features/movies/MovieGrid'
import MovieFilters from '../../components/features/movies/MovieFilters'
import MoviePagination from '../../components/features/movies/MoviePagination'
import { useMovies } from '../../hooks/useMovies'
import { searchMovies } from '../../services/movieService'
import type { Movie } from '../../types'

const PAGE_SIZE = 12
const SEARCH_DEBOUNCE = 300

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Movie[] | null>(null)
  const [searching, setSearching] = useState(false)

  const {
    movies,
    loading,
    totalPages,
    totalElements,
    currentPage,
    params,
    setPage,
    setGenre,
  } = useMovies({ page: 0, size: PAGE_SIZE })

  const selectedGenre = params.genre ?? ''
  const isSearching = searchQuery.trim().length > 0

  // Debounced search API call
  const doSearch = useCallback((q: string) => {
    if (!q.trim()) {
      setSearchResults(null)
      setSearching(false)
      return
    }
    setSearching(true)
    searchMovies(q)
      .then((data) => {
        setSearchResults(data)
        setSearching(false)
      })
      .catch(() => setSearching(false))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => doSearch(searchQuery), SEARCH_DEBOUNCE)
    return () => clearTimeout(timer)
  }, [searchQuery, doSearch])

  // Collect unique genres from current movies for the dropdown
  const allGenres = useMemo(() => {
    const genres = new Set<string>()
    movies.forEach((m) => m.genre.forEach((g) => genres.add(g)))
    return Array.from(genres).sort()
  }, [movies])

  const displayedMovies = searchResults !== null ? searchResults : movies
  const displayLoading = isSearching ? searching : loading

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <section>
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[var(--color-text-heading)] mb-2">
            Now Showing
          </h1>
          <p className="text-[var(--color-text-muted)]">
            Book tickets for the latest movies
          </p>
        </header>

        <MovieFilters
          allGenres={allGenres}
          selectedGenre={selectedGenre}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onGenreChange={setGenre}
        />

        <MovieGrid movies={displayedMovies} loading={displayLoading} />

        {!isSearching && (
          <MoviePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalElements={totalElements}
            onPageChange={(page) => {
              setPage(page)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}
      </section>
    </div>
  )
}
