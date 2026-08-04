import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getMovieById } from '../../services/movieService'
import { getShowtimesByMovie } from '../../services/showtimeService'
import type { Movie, ShowtimeResponseDTO, ShowSlot, Theater } from '../../types'

interface SlotCard {
  showtime: ShowtimeResponseDTO
  slot: ShowSlot
}

interface TheaterGroup {
  theater?: Theater
  formats: { format: string; showtime: ShowtimeResponseDTO; slots: ShowSlot[] }[]
}

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [showtimeData, setShowtimeData] = useState<ShowtimeResponseDTO[]>([])
  const [selectedSlot, setSelectedSlot] = useState<SlotCard | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedFormats, setSelectedFormats] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([getMovieById(id), getShowtimesByMovie(id)]).then(
      ([movieData, showtimeData]) => {
        setMovie(movieData)
        setShowtimeData(showtimeData)
        setLoading(false)
      }
    ).catch(() => setLoading(false))
  }, [id])

  // Available dates sorted by date
  const availableDates = useMemo(() => {
    const dateSet = new Set<string>()
    for (const st of showtimeData) {
      for (const slot of st.slots) {
        dateSet.add(slot.date)
      }
    }
    return Array.from(dateSet).sort()
  }, [showtimeData])

  // Auto-select today's date if showtimes exist, otherwise first available
  useEffect(() => {
    if (availableDates.length && !selectedDate) {
      const today = new Date().toISOString().slice(0, 10)
      setSelectedDate(availableDates.includes(today) ? today : availableDates[0])
    }
  }, [availableDates])

  // Group slots by date, then by theater, then by format
  const slotsByDate = useMemo<[string, TheaterGroup[]][]>(() => {
    const dateMap = new Map<string, Map<string, TheaterGroup>>()
    for (const st of showtimeData) {
      for (const slot of st.slots) {
        const date = slot.date
        const theaterId = st.theaterId
        if (!dateMap.has(date)) dateMap.set(date, new Map())
        const theaterMap = dateMap.get(date)!
        if (!theaterMap.has(theaterId)) {
          theaterMap.set(theaterId, { theater: st.theater, formats: [] })
        }
        const group = theaterMap.get(theaterId)!
        const existing = group.formats.find((f) => f.format === st.format)
        if (existing) {
          existing.slots.push(slot)
        } else {
          group.formats.push({ format: st.format, showtime: st, slots: [slot] })
        }
      }
    }
    return Array.from(dateMap.entries())
      .map(([date, theaterMap]) => [date, Array.from(theaterMap.values())] as [string, TheaterGroup[]])
      .sort(([a], [b]) => a.localeCompare(b))
  }, [showtimeData])

  // Reset selected slot and format when date changes
  useEffect(() => {
    setSelectedSlot(null)
    setSelectedFormats({})
  }, [selectedDate])

  // Reset selected slot when format changes for any theater
  useEffect(() => {
    setSelectedSlot(null)
  }, [selectedFormats])

  const handleProceed = () => {
    if (!selectedSlot || !movie || !id) return
    navigate(`/movie/${id}/seats`, {
      state: {
        movie,
        showtime: selectedSlot.showtime,
        slot: selectedSlot.slot,
      },
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" />
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="text-center py-16 text-[var(--color-text-muted)]">
        <h2>Movie not found</h2>
        <Link to="/" className="text-[var(--color-primary)] mt-4 inline-block">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      <div
        className="absolute top-0 left-0 right-0 h-[60vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${movie.backdrop})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[rgba(13,13,18,0.4)] from-0% via-[rgba(13,13,18,0.85)] via-80% to-[var(--color-bg)] to-100%" />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 pb-16">
        <div className="flex gap-8 pt-[32vh] mb-12">
          <img
            src={movie.poster}
            alt={`${movie.title} poster`}
            className="w-60 rounded-xl shadow-[var(--shadow-elevated)] flex-shrink-0"
          />
          <div className="flex flex-col flex-1">
            <div className="flex gap-2 flex-wrap mb-3">
              {movie.genre.map((g) => (
                <span key={g} className="bg-[var(--color-primary-bg)] text-[var(--color-primary)] text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">{g}</span>
              ))}
            </div>
            <h1 className="text-5xl font-extrabold text-[var(--color-text-heading)] tracking-tight leading-tight mb-2">{movie.title}</h1>
            <p className="text-lg text-[var(--color-text-muted)] italic mb-4">{movie.tagline}</p>

            <div className="flex items-center gap-3 text-[var(--color-text-muted)] text-[15px] mb-5">
              <span className="text-[var(--color-warning)] font-bold">★ {movie.rating}</span>
              <span>&middot;</span>
              <span>{movie.language}</span>
              <span>&middot;</span>
              <span>{movie.duration} min</span>
            </div>

            <p className="text-[var(--color-text)] leading-relaxed max-w-[680px] mb-5">{movie.description}</p>

            <div className="text-[var(--color-text-muted)] text-[15px] mb-1">
              <span className="text-[var(--color-text)] font-semibold">Cast:</span> {movie.cast.join(', ')}
            </div>
            <div className="text-[var(--color-text-muted)] text-[15px]">
              <span className="text-[var(--color-text)] font-semibold">Director:</span> {movie.director}
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-2xl font-bold text-[var(--color-text-heading)] mb-6">Select Showtime</h2>

          {/* Date Picker */}
          {availableDates.length > 0 && (
            <div className="mb-8">
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {availableDates.map((date) => {
                  const isSelected = selectedDate === date
                  const dayName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })
                  const dayNum = new Date(date + 'T00:00:00').getDate()
                  const monthName = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })

                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center justify-center min-w-[64px] px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-150 cursor-pointer flex-shrink-0 ${
                        isSelected
                          ? 'bg-[var(--color-primary)] text-white shadow-[var(--shadow-glow)]'
                          : 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      <span className="text-[11px] uppercase tracking-wide opacity-75">{dayName}</span>
                      <span className="text-xl leading-tight">{dayNum}</span>
                      <span className="text-[11px] uppercase tracking-wide opacity-75">{monthName}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {!selectedDate && availableDates.length === 0 ? (
            <p className="text-[var(--color-text-muted)]">No showtimes available for this movie</p>
          ) : (
            <div className="flex flex-col gap-8">
              {slotsByDate
                .filter(([date]) => date === selectedDate)
                .map(([date, theaters]) => (
                  <div key={date} className="flex flex-col gap-5">
                    {theaters.map((group) => {
                      const theaterId = group.formats[0].showtime.theaterId
                      const activeFormat = selectedFormats[theaterId] || group.formats[0].format
                      const activeFormatData = group.formats.find((f) => f.format === activeFormat)
                      if (!activeFormatData) return null

                      return (
                        <div
                          key={theaterId}
                          className="bg-[var(--color-bg-card)] rounded-xl p-5 flex items-start gap-4"
                        >
                          <div className="flex flex-col gap-1 flex-shrink-0">
                            <span className="font-bold text-[var(--color-text-heading)] text-[17px]">
                              {group.theater?.name || 'Theater'}
                            </span>
                            <span className="text-[var(--color-primary)] text-[13px] font-semibold">
                              {activeFormatData.format}
                            </span>
                            {group.theater?.amenities && group.theater.amenities.length > 0 && (
                              <span className="text-[var(--color-text-muted)] text-[13px]">
                                {group.theater.amenities.slice(0, 3).join(' &middot; ')}
                              </span>
                            )}
                          </div>
                          {group.formats.length > 1 && (
                            <select
                              value={activeFormat}
                              onChange={(e) => setSelectedFormats((p) => ({ ...p, [theaterId]: e.target.value }))}
                              className="bg-[var(--color-bg-elevated)] text-[var(--color-text)] text-sm font-semibold px-3 py-2 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] cursor-pointer"
                            >
                              {group.formats.map((f) => (
                                <option key={f.format} value={f.format}>{f.format}</option>
                              ))}
                            </select>
                          )}
                          <div className="flex flex-wrap gap-3 ml-auto">
                            {activeFormatData.slots.map((slot) => {
                              const isSelected =
                                selectedSlot?.showtime.id === activeFormatData.showtime.id &&
                                selectedSlot?.slot.time === slot.time &&
                                selectedSlot?.slot.date === slot.date

                              return (
                                <button
                                  key={`${activeFormatData.showtime.id}-${slot.time}-${slot.date}`}
                                  onClick={() => setSelectedSlot({ showtime: activeFormatData.showtime, slot })}
                                  className={`flex flex-col items-center gap-1 px-5 py-3 rounded-lg font-semibold text-[15px] transition-all duration-150 cursor-pointer ${
                                    isSelected
                                      ? 'bg-[var(--color-primary)] text-white'
                                      : 'bg-[var(--color-bg-elevated)] text-[var(--color-text)] hover:bg-[var(--color-primary)] hover:text-white'
                                  }`}
                                >
                                  <span className="text-lg">{slot.time}</span>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}

              {selectedDate && slotsByDate.filter(([date]) => date === selectedDate).length === 0 && (
                <p className="text-[var(--color-text-muted)]">No showtimes available for selected date</p>
              )}
            </div>
          )}

          {selectedSlot && (
            <div className="mt-6 bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-primary-bg)] rounded-xl p-5 flex items-center gap-6 flex-wrap shadow-[var(--shadow-glow)]">
              <div className="flex flex-col gap-1">
                <span className="font-bold text-[var(--color-text-heading)]">
                  {selectedSlot.showtime.theater?.name}
                </span>
                <span className="text-2xl font-extrabold text-[var(--color-primary)]">{selectedSlot.slot.time}</span>
                <span className="text-[var(--color-text-muted)] text-sm">
                  {selectedSlot.showtime.format} &middot; Screen {selectedSlot.slot.screenId}
                </span>
              </div>
              <button
                className="ml-auto px-8 py-3 bg-[var(--color-primary)] text-white rounded-lg font-bold text-base transition-colors duration-150 hover:bg-[var(--color-primary-hover)] cursor-pointer"
                onClick={handleProceed}
              >
                Proceed to Seats
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
