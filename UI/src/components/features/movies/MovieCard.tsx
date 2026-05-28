import { Link } from 'react-router-dom'
import type { Movie } from '../../../types'

interface MovieCardProps {
  movie: Movie
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link
      to={`/movie/${movie.id}`}
      className="group block bg-[var(--color-bg-card)] rounded-xl overflow-hidden transition-all duration-250 hover:translate-y-[-4px] hover:shadow-[var(--shadow-elevated)] hover:bg-[var(--color-bg-hover)] cursor-pointer"
      aria-label={`View ${movie.title}`}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.poster}
          alt={`${movie.title} movie poster`}
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
          loading="lazy"
        />
        <div
          className="absolute top-3 right-3 bg-black/70 text-[var(--color-warning)] text-sm font-bold px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm"
          aria-label={`Rating: ${movie.rating}`}
        >
          ★ {movie.rating}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-[17px] font-bold text-[var(--color-text-heading)] mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
          {movie.title}
        </h3>
        <div className="flex items-center gap-3 text-[var(--color-text-muted)] text-[13px]">
          <span>{movie.language}</span>
          <span>·</span>
          <span>{movie.duration} min</span>
        </div>
        <div className="flex gap-2 flex-wrap mt-2">
          {movie.genre.slice(0, 3).map((g) => (
            <span
              key={g}
              className="inline-block bg-[var(--color-primary-bg)] text-[var(--color-primary)] text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
