import MovieCard from './MovieCard'
import type { Movie } from '../../../types'

interface MovieGridProps {
  movies: Movie[]
  loading: boolean
}

export default function MovieGrid({ movies, loading }: MovieGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-[var(--color-bg-card)] rounded-xl aspect-[2/3] animate-pulse" />
        ))}
      </div>
    )
  }

  if (!movies || movies.length === 0) {
    return (
      <p className="text-center col-span-full py-16 text-[var(--color-text-muted)]">No movies found</p>
    )
  }

  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-6">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}
