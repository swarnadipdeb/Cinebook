import { useState, useMemo } from 'react'
import type { Movie } from '../../../types'

interface MovieFiltersProps {
  allGenres: string[]
  selectedGenre: string
  searchQuery: string
  onSearchChange: (query: string) => void
  onGenreChange: (genre: string) => void
}

export default function MovieFilters({
  allGenres,
  selectedGenre,
  searchQuery,
  onSearchChange,
  onGenreChange,
}: MovieFiltersProps) {
  return (
    <div className="bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-elevated)] rounded-xl p-4 mb-8">
      <div className="flex flex-wrap gap-4">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm text-[var(--color-text-muted)] mb-1">Search</label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by title or genre..."
              className="w-full bg-[var(--color-bg)] rounded-lg px-4 py-2 text-[var(--color-text)] placeholder-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all duration-150"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-sm"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Genre Filter */}
        <div className="min-w-[150px]">
          <label className="block text-sm text-[var(--color-text-muted)] mb-1">Genre</label>
          <select
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
            className="w-full bg-[var(--color-bg)] rounded-lg px-4 py-2 text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all duration-150"
          >
            <option value="">All Genres</option>
            {allGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedGenre && (
        <div className="mt-4 flex justify-end gap-2">
          <span className="text-sm text-[var(--color-text-muted)]">
            Filtering by: <span className="text-[var(--color-primary)]">{selectedGenre}</span>
          </span>
          <button
            onClick={() => onGenreChange('')}
            className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary)]/80"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
