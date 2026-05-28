import { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMovies, createMovie, updateMovie, deleteMovie } from '../../services/movieService'
import { getTheaters, createTheater, updateTheater, deleteTheater } from '../../services/theaterService'
import { getShowtime, getShowtimesByMovie, getSlotDetails, createShowtime, updateShowtime, deleteShowtime } from '../../services/showtimeService'
import { DatePicker } from '../../components/common/DatePicker'
import type { Movie, Theater, ShowtimeResponseDTO, ScreenLayout } from '../../types'
import type { ShowtimeRequest, ShowtimeSlotRequest } from '../../services/showtimeService'

/* ---- Shared helpers ---- */

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

type TabKey = 'movies' | 'theaters' | 'showtimes'

interface SlotForm {
  time: string
  premiumPrice: number
  regularPrice: number
  rows: number
  cols: number
  premiumCols: string
  aisleAfterCol: number
}

interface DateGroup {
  date: string
  slots: SlotForm[]
}

const emptySlot: SlotForm = {
  time: '',
  premiumPrice: 18,
  regularPrice: 12,
  rows: 10,
  cols: 20,
  premiumCols: '',
  aisleAfterCol: 10,
}

const emptyDateGroup: DateGroup = {
  date: new Date().toISOString().slice(0, 10),
  slots: [{ ...emptySlot }],
}

/* ---- Component: AdminPage ---- */

const emptyMovieForm = {
  title: '',
  tagline: '',
  poster: '',
  backdrop: '',
  rating: 0,
  duration: 0,
  genre: '',
  language: '',
  releaseDate: '',
  director: '',
  cast: '',
  description: '',
}

type MovieForm = typeof emptyMovieForm

const emptyTheaterForm = {
  name: '',
  address: '',
  screens: 1,
  amenities: '',
}

type TheaterForm = typeof emptyTheaterForm

export default function AdminPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabKey>('movies')

  /* --- Movie state --- */
  const [movies, setMovies] = useState<Movie[]>([])
  const [movieLoading, setMovieLoading] = useState(true)
  const [movieSearch, setMovieSearch] = useState('')
  const [movieGenreFilter, setMovieGenreFilter] = useState('')
  const [movieModal, setMovieModal] = useState<'create' | 'edit' | null>(null)
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [movieForm, setMovieForm] = useState<MovieForm>(emptyMovieForm)
  const [movieFormError, setMovieFormError] = useState('')
  const [movieSubmitting, setMovieSubmitting] = useState(false)
  const [movieDeleteConfirm, setMovieDeleteConfirm] = useState<string | null>(null)
  const [movieDeletingId, setMovieDeletingId] = useState<string | null>(null)
  const [posterPreview, setPosterPreview] = useState<string>('')
  const [backdropPreview, setBackdropPreview] = useState<string>('')
  const [imageLoading, setImageLoading] = useState(false)
  const posterInputRef = useRef<HTMLInputElement | null>(null)
  const backdropInputRef = useRef<HTMLInputElement | null>(null)
  const movieSearchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* --- Theater state --- */
  const [theaters, setTheaters] = useState<Theater[]>([])
  const [theaterLoading, setTheaterLoading] = useState(true)
  const [theaterModal, setTheaterModal] = useState<'create' | 'edit' | null>(null)
  const [editingTheater, setEditingTheater] = useState<Theater | null>(null)
  const [theaterForm, setTheaterForm] = useState<TheaterForm>(emptyTheaterForm)
  const [theaterFormError, setTheaterFormError] = useState('')
  const [theaterSubmitting, setTheaterSubmitting] = useState(false)
  const [theaterDeleteConfirm, setTheaterDeleteConfirm] = useState<string | null>(null)
  const [theaterDeletingId, setTheaterDeletingId] = useState<string | null>(null)

  /* --- Showtime state --- */
  const [showtimes, setShowtimes] = useState<ShowtimeResponseDTO[]>([])
  const [showtimeLoading, setShowtimeLoading] = useState(true)
  const [showtimeMovieFilter, setShowtimeMovieFilter] = useState('')
  const [showtimeModal, setShowtimeModal] = useState<'create' | 'edit' | null>(null)
  const [editingShowtime, setEditingShowtime] = useState<ShowtimeResponseDTO | null>(null)
  const [showtimeFormMovieId, setShowtimeFormMovieId] = useState('')
  const [showtimeFormTheaterId, setShowtimeFormTheaterId] = useState('')
  const [showtimeFormat, setShowtimeFormat] = useState('2D')
  const [showtimeSlots, setShowtimeSlots] = useState<DateGroup[]>([emptyDateGroup])
  const [showtimeFormError, setShowtimeFormError] = useState('')
  const [showtimeSubmitting, setShowtimeSubmitting] = useState(false)
  const [showtimeDeleteConfirm, setShowtimeDeleteConfirm] = useState<string | null>(null)
  const [showtimeDeletingId, setShowtimeDeletingId] = useState<string | null>(null)
  const [showtimeEditing, setShowtimeEditing] = useState(false)

  /* ---- Fetch data ---- */

  const fetchMovies = useCallback(async () => {
    setMovieLoading(true)
    try {
      const params: Record<string, string | number> = { page: 0, size: 100 }
      if (movieGenreFilter) params.genre = movieGenreFilter
      const res = await getMovies(params as any)
      setMovies(res.content ?? [])
    } catch { setMovies([]) }
    finally { setMovieLoading(false) }
  }, [movieGenreFilter])

  useEffect(() => { fetchMovies() }, [fetchMovies])

  const fetchTheaters = useCallback(async () => {
    setTheaterLoading(true)
    try { const data = await getTheaters(); setTheaters(data ?? []) }
    catch { setTheaters([]) }
    finally { setTheaterLoading(false) }
  }, [])

  useEffect(() => { fetchTheaters() }, [fetchTheaters])

  const fetchShowtimes = useCallback(async () => {
    if (!showtimeMovieFilter) {
      // Fetch all showtimes from all movies
      setShowtimeLoading(true)
      try {
        const allShowtimes: ShowtimeResponseDTO[] = []
        for (const movie of movies) {
          const data = await getShowtimesByMovie(movie.id).catch(() => [])
          allShowtimes.push(...data)
        }
        setShowtimes(allShowtimes)
      } catch { setShowtimes([]) }
      finally { setShowtimeLoading(false) }
    } else {
      setShowtimeLoading(true)
      try {
        const data = await getShowtimesByMovie(showtimeMovieFilter).catch(() => [])
        setShowtimes(data)
      } catch { setShowtimes([]) }
      finally { setShowtimeLoading(false) }
    }
  }, [movies, showtimeMovieFilter])

  useEffect(() => { fetchShowtimes() }, [fetchShowtimes])

  /* ---- Movie handlers ---- */

  const handleMovieSearch = (q: string) => {
    setMovieSearch(q)
    if (movieSearchTimer.current) clearTimeout(movieSearchTimer.current)
    movieSearchTimer.current = setTimeout(async () => {
      if (!q.trim()) { fetchMovies(); return }
      setMovieLoading(true)
      try {
        const res = await getMovies({ page: 0, size: 50 })
        const results = (res.content ?? []).filter(
          (m) => m.title.toLowerCase().includes(q.toLowerCase()) || m.genre.some((g) => g.toLowerCase().includes(q.toLowerCase()))
        )
        setMovies(results)
      } catch { setMovies([]) }
      finally { setMovieLoading(false) }
    }, 300)
  }

  const allGenres = [...new Set(movies.flatMap((m) => m.genre))].sort()

  const openMovieCreate = () => {
    setMovieForm(emptyMovieForm)
    setMovieFormError('')
    setPosterPreview('')
    setBackdropPreview('')
    setEditingMovie(null)
    setMovieModal('create')
  }

  const openMovieEdit = (movie: Movie) => {
    setEditingMovie(movie)
    setMovieForm({
      title: movie.title, tagline: movie.tagline, poster: movie.poster, backdrop: movie.backdrop,
      rating: movie.rating, duration: movie.duration, genre: movie.genre.join(', '),
      language: movie.language, releaseDate: movie.releaseDate, director: movie.director,
      cast: movie.cast.join(', '), description: movie.description,
    })
    setPosterPreview(movie.poster)
    setBackdropPreview(movie.backdrop)
    setMovieFormError('')
    setMovieModal('edit')
  }

  const closeMovieModal = () => {
    setMovieModal(null); setEditingMovie(null); setMovieFormError(''); setPosterPreview(''); setBackdropPreview('')
  }

  const updateMovieField = (field: string, value: string) => setMovieForm((f) => ({ ...f, [field]: value }))

  const handleMovieSubmit = async () => {
    if (movieSubmitting) return
    setMovieFormError('')
    if (!movieForm.title.trim() || !movieForm.description.trim()) { setMovieFormError('Title and description are required'); return }
    setMovieSubmitting(true)
    try {
      const payload = {
        title: movieForm.title.trim(), tagline: movieForm.tagline.trim(),
        poster: movieForm.poster.trim(), backdrop: movieForm.backdrop.trim(),
        rating: movieForm.rating, duration: movieForm.duration,
        genre: movieForm.genre.split(',').map((g) => g.trim()).filter(Boolean),
        language: movieForm.language.trim(), releaseDate: movieForm.releaseDate,
        director: movieForm.director.trim(),
        cast: movieForm.cast.split(',').map((c) => c.trim()).filter(Boolean),
        description: movieForm.description.trim(),
      }
      if (movieModal === 'create') { const created = await createMovie(payload); setMovies((p) => [created, ...p]) }
      else if (movieModal === 'edit' && editingMovie) { const updated = await updateMovie(editingMovie.id, payload); setMovies((p) => p.map((m) => (m.id === updated.id ? updated : m))) }
      closeMovieModal()
    } catch (err: unknown) {
      if (!localStorage.getItem('access_token')) { navigate('/auth/login'); return }
      const axiosErr = err as { response?: { status?: number } }
      setMovieFormError(axiosErr?.response?.status === 403 ? 'You do not have permission' : (err instanceof Error ? err.message : 'Failed to save movie'))
    } finally { setMovieSubmitting(false) }
  }

  const handleMovieImageUpload = async (file: File, field: 'poster' | 'backdrop') => {
    setImageLoading(true)
    try {
      const base64 = await fileToBase64(file)
      setMovieForm((f) => ({ ...f, [field]: base64 }))
      if (field === 'poster') setPosterPreview(base64); else setBackdropPreview(base64)
    } catch { setMovieFormError('Failed to process image') }
    finally { setImageLoading(false) }
  }

  const handleMovieDelete = async (id: string) => {
    setMovieDeletingId(id)
    try { await deleteMovie(id); setMovies((p) => p.filter((m) => m.id !== id)); setMovieDeleteConfirm(null) }
    catch { if (!localStorage.getItem('access_token')) navigate('/auth/login'); setMovieDeleteConfirm(null) }
    finally { setMovieDeletingId(null) }
  }

  /* ---- Theater handlers ---- */

  const openTheaterCreate = () => {
    setTheaterForm(emptyTheaterForm); setTheaterFormError(''); setEditingTheater(null); setTheaterModal('create')
  }

  const openTheaterEdit = (theater: Theater) => {
    setEditingTheater(theater)
    setTheaterForm({ name: theater.name, address: theater.address, screens: theater.screens, amenities: theater.amenities.join(', ') })
    setTheaterFormError(''); setTheaterModal('edit')
  }

  const closeTheaterModal = () => { setTheaterModal(null); setEditingTheater(null); setTheaterFormError('') }

  const handleTheaterSubmit = async () => {
    if (theaterSubmitting) return
    setTheaterFormError('')
    if (!theaterForm.name.trim() || !theaterForm.address.trim()) { setTheaterFormError('Name and address are required'); return }
    setTheaterSubmitting(true)
    try {
      const payload = {
        name: theaterForm.name.trim(), address: theaterForm.address.trim(),
        screens: theaterForm.screens,
        amenities: theaterForm.amenities.split(',').map((a) => a.trim()).filter(Boolean),
      }
      if (theaterModal === 'create') { const created = await createTheater(payload); setTheaters((p) => [created, ...p]) }
      else if (theaterModal === 'edit' && editingTheater) { const updated = await updateTheater(editingTheater.id, payload); setTheaters((p) => p.map((t) => (t.id === updated.id ? updated : t))) }
      closeTheaterModal()
    } catch (err: unknown) {
      if (!localStorage.getItem('access_token')) { navigate('/auth/login'); return }
      setTheaterFormError(err instanceof Error ? err.message : 'Failed to save theater')
    } finally { setTheaterSubmitting(false) }
  }

  const handleTheaterDelete = async (id: string) => {
    setTheaterDeletingId(id)
    try { await deleteTheater(id); setTheaters((p) => p.filter((t) => t.id !== id)); setTheaterDeleteConfirm(null) }
    catch { if (!localStorage.getItem('access_token')) navigate('/auth/login'); setTheaterDeleteConfirm(null) }
    finally { setTheaterDeletingId(null) }
  }

  /* ---- Showtime handlers ---- */

  const openShowtimeCreate = () => {
    setShowtimeFormMovieId(''); setShowtimeFormTheaterId(''); setShowtimeFormat('2D')
    setShowtimeSlots([{ ...emptyDateGroup, slots: [{ ...emptySlot }] }]); setShowtimeFormError(''); setEditingShowtime(null); setShowtimeModal('create')
  }

  const openShowtimeEdit = async (id: string) => {
    setShowtimeFormError('')
    setShowtimeEditing(true)
    setShowtimeModal('edit')

    // Step 1: Get full showtime by ID with embedded theater
    const showtime = await getShowtime(id).catch(() => null)
    if (!showtime) {
      setShowtimeFormError('Failed to load showtime details')
      setShowtimeEditing(false)
      setShowtimeModal(null)
      return
    }

    // Step 2: Get slot layout details for each unique screenId
    const uniqueScreenIds = [...new Set(showtime.slots.map(s => s.screenId))]
    const layoutPromises = uniqueScreenIds.map(id =>
      getSlotDetails(showtime.movieId, id).catch(() => null)
    )
    const results = await Promise.all(layoutPromises)

    // Step 3: Build a lookup by screenId for fast matching
    const layoutByScreen = new Map<string, ScreenLayout>()
    for (let i = 0; i < uniqueScreenIds.length; i++) {
      if (results[i]) layoutByScreen.set(uniqueScreenIds[i], results[i])
    }

    // Step 4: Merge showtime slots with screen layout data, grouped by date
    const dateMap = new Map<string, SlotForm[]>()
    for (const s of showtime.slots) {
      const layout = layoutByScreen.get(s.screenId)
      if (!dateMap.has(s.date)) dateMap.set(s.date, [])
      const layoutRows = layout?.rows ?? 10
      const layoutCols = layout?.cols ?? 20
      const layoutAisle = layout?.aisleAfterCol ?? 10
      const premiumCols = layout?.premiumCols ?? []
      const pricing = layout?.pricing ?? { premiumPrice: 18, regularPrice: 12 }

      dateMap.get(s.date)!.push({
        time: s.time,
        premiumPrice: pricing.premiumPrice,
        regularPrice: pricing.regularPrice,
        rows: layoutRows,
        cols: layoutCols,
        premiumCols: premiumCols.join(', '),
        aisleAfterCol: layoutAisle,
      })
    }

    const groups: DateGroup[] = Array.from(dateMap.entries()).map(([date, slots]) => ({ date, slots }))

    setEditingShowtime(showtime)
    setShowtimeFormMovieId(showtime.movieId)
    setShowtimeFormTheaterId(showtime.theaterId)
    setShowtimeFormat(showtime.format)
    setShowtimeSlots(groups.length ? groups : [{ ...emptyDateGroup, slots: [{ ...emptySlot }] }])
    setShowtimeEditing(false)
  }

  const closeShowtimeModal = () => { setShowtimeModal(null); setEditingShowtime(null); setShowtimeFormError(''); setShowtimeEditing(false) }

  const addDateGroup = () => setShowtimeSlots((p) => [...p, { ...emptyDateGroup, date: new Date().toISOString().slice(0, 10), slots: [{ ...emptySlot }] }])
  const removeDateGroup = (di: number) => setShowtimeSlots((p) => p.filter((_, i) => i !== di))
  const updateDate = (di: number, date: string) => setShowtimeSlots((p) => p.map((g, i) => i === di ? { ...g, date } : g))

  const addSlot = (di: number) => setShowtimeSlots((p) => p.map((g, i) => i === di ? { ...g, slots: [...g.slots, { ...emptySlot }] } : g))
  const removeSlot = (di: number, si: number) => setShowtimeSlots((p) => p.map((g, i) => i === di ? { ...g, slots: g.slots.filter((_, j) => j !== si) } : g))
  const updateSlot = (di: number, si: number, field: string, value: string) => {
    setShowtimeSlots((p) => p.map((g, i) => i === di ? { ...g, slots: g.slots.map((s, j) => j === si ? { ...s, [field]: value } : s) } : g))
  }

  const handleShowtimeSubmit = async () => {
    if (showtimeSubmitting) return
    setShowtimeFormError('')
    if (!showtimeFormMovieId || !showtimeFormTheaterId || !showtimeFormat) { setShowtimeFormError('Movie, theater, and format are required'); return }
    if (showtimeSlots.length === 0 || showtimeSlots.every((g) => g.slots.length === 0)) { setShowtimeFormError('At least one date group with a slot is required'); return }
    for (const g of showtimeSlots) {
      if (!g.date) { setShowtimeFormError('Each date group needs a date'); return }
      for (const s of g.slots) { if (!s.time) { setShowtimeFormError('Each slot needs a time'); return } }
    }

    const slots: ShowtimeSlotRequest[] = []
    for (const g of showtimeSlots) {
      for (const s of g.slots) {
        slots.push({
          time: s.time, date: g.date,
          premiumPrice: s.premiumPrice, regularPrice: s.regularPrice,
          rows: s.rows, cols: s.cols,
          premiumCols: s.premiumCols.split(',').map((c) => parseInt(c.trim(), 10)).filter((c) => !isNaN(c)),
          aisleAfterCol: s.aisleAfterCol,
        })
      }
    }

    const payload: ShowtimeRequest = { movieId: showtimeFormMovieId, theaterId: showtimeFormTheaterId, format: showtimeFormat, slots }
    setShowtimeSubmitting(true)
    try {
      if (showtimeModal === 'create') { const created = await createShowtime(payload); setShowtimes((p) => [created, ...p]) }
      else if (showtimeModal === 'edit' && editingShowtime) { const updated = await updateShowtime(editingShowtime.id, payload); setShowtimes((p) => p.map((s) => (s.id === updated.id ? updated : s))) }
      closeShowtimeModal()
    } catch (err: unknown) {
      if (!localStorage.getItem('access_token')) { navigate('/auth/login'); return }
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } }
      if (axiosErr?.response?.status === 409) {
        setShowtimeFormError(
          `Showtime for "${getMovieTitle(showtimeFormMovieId)}" at "${getTheaterName(showtimeFormTheaterId)}" in ${showtimeFormat} already exists`
        )
      } else {
        setShowtimeFormError(err instanceof Error ? err.message : 'Failed to save showtime')
      }
    } finally { setShowtimeSubmitting(false) }
  }

  const handleShowtimeDelete = async (id: string) => {
    setShowtimeDeletingId(id)
    try { await deleteShowtime(id); setShowtimes((p) => p.filter((s) => s.id !== id)); setShowtimeDeleteConfirm(null) }
    catch { if (!localStorage.getItem('access_token')) navigate('/auth/login'); setShowtimeDeleteConfirm(null) }
    finally { setShowtimeDeletingId(null) }
  }

  // Lookup helpers for showtime dropdowns
  const getMovieTitle = (id: string) => movies.find((m) => m.id === id)?.title || id
  const getTheaterName = (id: string) => theaters.find((t) => t.id === id)?.name || id

  return (
    <div className="max-w-[1280px] mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-[var(--color-text-heading)] mb-1">Admin Panel</h1>
        <p className="text-[var(--color-text-muted)]">Manage movies, theaters, and showtimes</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-[var(--color-bg-card)] rounded-lg p-1 w-fit">
        {([['movies', 'Movies'], ['theaters', 'Theaters'], ['showtimes', 'Showtimes']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-2 rounded-md font-semibold text-sm transition-all duration-150 ${
              activeTab === key
                ? 'bg-[var(--color-primary)] text-white'
                : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] hover:bg-[var(--color-bg)]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ==================== MOVIES TAB ==================== */}
      {activeTab === 'movies' && (
        <div className="bg-[var(--color-bg-card)] rounded-xl p-6">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
            <h2 className="text-xl font-bold text-[var(--color-text-heading)]">Movies ({movies.length})</h2>
            <div className="flex gap-2 flex-wrap">
              <input type="text" placeholder="Search movies..." value={movieSearch} onChange={(e) => handleMovieSearch(e.target.value)} className="px-4 py-2 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-sm outline-none placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)]" />
              <select value={movieGenreFilter} onChange={(e) => { setMovieGenreFilter(e.target.value); setMovieSearch('') }} className="px-3 py-2 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                <option value="">All Genres</option>
                {allGenres.map((g) => (<option key={g} value={g}>{g}</option>))}
              </select>
              <button onClick={openMovieCreate} className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-semibold text-sm transition-colors duration-150 hover:bg-[var(--color-primary-hover)]">+ Add Movie</button>
            </div>
          </div>

          {movieLoading ? (<p className="text-center py-8 text-[var(--color-text-muted)]">Loading...</p>)
            : movies.length === 0 ? (<p className="text-center py-8 text-[var(--color-text-muted)]">No movies found</p>)
            : (<div className="flex flex-col gap-3">
              {movies.map((movie) => (
                <div key={movie.id} className="flex items-center gap-4 p-3 rounded-lg transition-all duration-150 hover:bg-[var(--color-bg-hover)]">
                  <img src={movie.poster} alt={movie.title} className="w-12 h-[72px] object-cover rounded flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <span className="font-bold text-[var(--color-text-heading)] whitespace-nowrap overflow-hidden text-ellipsis">{movie.title}</span>
                    <span className="text-[var(--color-text-muted)] text-[13px]">{movie.genre.join(', ')} &middot; {movie.duration} min &middot; Rating: {movie.rating}</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openMovieEdit(movie)} className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-primary)] hover:text-white">Edit</button>
                    {movieDeleteConfirm === movie.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleMovieDelete(movie.id)} disabled={!!movieDeletingId} className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-warning)] text-white transition-all duration-150 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed">{movieDeletingId === movie.id ? 'Deleting...' : 'Confirm'}</button>
                        <button onClick={() => setMovieDeleteConfirm(null)} disabled={!!movieDeletingId} className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-bg)] disabled:opacity-60 disabled:cursor-not-allowed">Cancel</button>
                      </div>
                    ) : (<button onClick={() => setMovieDeleteConfirm(movie.id)} className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-error)] text-white transition-all duration-150 hover:opacity-90">Delete</button>)}
                  </div>
                </div>
              ))}
            </div>)}
        </div>
      )}

      {/* ==================== THEATERS TAB ==================== */}
      {activeTab === 'theaters' && (
        <div className="bg-[var(--color-bg-card)] rounded-xl p-6">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-[var(--color-text-heading)]">Theaters ({theaters.length})</h2>
            <button onClick={openTheaterCreate} className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-semibold text-sm transition-colors duration-150 hover:bg-[var(--color-primary-hover)]">+ Add Theater</button>
          </div>

          {theaterLoading ? (<p className="text-center py-8 text-[var(--color-text-muted)]">Loading...</p>)
            : theaters.length === 0 ? (<p className="text-center py-8 text-[var(--color-text-muted)]">No theaters found</p>)
            : (<div className="flex flex-col gap-3">
              {theaters.map((theater) => (
                <div key={theater.id} className="flex items-center gap-4 p-3 rounded-lg transition-all duration-150 hover:bg-[var(--color-bg-hover)]">
                  <div className="w-12 h-12 bg-[var(--color-primary-bg)] rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[var(--color-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 3v18M3 9h18" /></svg>
                  </div>
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <span className="font-bold text-[var(--color-text-heading)] whitespace-nowrap overflow-hidden text-ellipsis">{theater.name}</span>
                    <span className="text-[var(--color-text-muted)] text-[13px]">{theater.address} &middot; {theater.screens} screens &middot; {theater.amenities.join(', ')}</span>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openTheaterEdit(theater)} className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-primary)] hover:text-white">Edit</button>
                    {theaterDeleteConfirm === theater.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleTheaterDelete(theater.id)} disabled={!!theaterDeletingId} className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-warning)] text-white transition-all duration-150 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed">{theaterDeletingId === theater.id ? 'Deleting...' : 'Confirm'}</button>
                        <button onClick={() => setTheaterDeleteConfirm(null)} disabled={!!theaterDeletingId} className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-bg)] disabled:opacity-60 disabled:cursor-not-allowed">Cancel</button>
                      </div>
                    ) : (<button onClick={() => setTheaterDeleteConfirm(theater.id)} className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-error)] text-white transition-all duration-150 hover:opacity-90">Delete</button>)}
                  </div>
                </div>
              ))}
            </div>)}
        </div>
      )}

      {/* ==================== SHOWTIMES TAB ==================== */}
      {activeTab === 'showtimes' && (
        <div className="bg-[var(--color-bg-card)] rounded-xl p-6">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-5">
            <h2 className="text-xl font-bold text-[var(--color-text-heading)]">Showtimes ({showtimes.length})</h2>
            <div className="flex gap-2 flex-wrap">
              <select value={showtimeMovieFilter} onChange={(e) => setShowtimeMovieFilter(e.target.value)} className="px-3 py-2 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                <option value="">All Movies</option>
                {movies.map((m) => (<option key={m.id} value={m.id}>{m.title}</option>))}
              </select>
              <button onClick={openShowtimeCreate} className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-semibold text-sm transition-colors duration-150 hover:bg-[var(--color-primary-hover)]">+ Add Showtime</button>
            </div>
          </div>

          {showtimeLoading ? (<p className="text-center py-8 text-[var(--color-text-muted)]">Loading...</p>)
            : showtimes.length === 0 ? (<p className="text-center py-8 text-[var(--color-text-muted)]">No showtimes found</p>)
            : (<div className="flex flex-col gap-3">
              {showtimes.map((st) => (
                <div key={st.id} className="flex items-center gap-4 p-3 rounded-lg transition-all duration-150 hover:bg-[var(--color-bg-hover)]">
                  <div className="flex-1 flex flex-col gap-1 min-w-0">
                    <span className="font-bold text-[var(--color-text-heading)]">{getMovieTitle(st.movieId)}</span>
                    <span className="text-[var(--color-text-muted)] text-[13px]">
                      {getTheaterName(st.theaterId)} &middot; {st.format} &middot; {st.slots.length} slot{st.slots.length > 1 ? 's' : ''}
                    </span>
                    {(() => {
                      const dateSlots = new Map<string, string[]>()
                      for (const s of st.slots) {
                        if (!dateSlots.has(s.date)) dateSlots.set(s.date, [])
                        dateSlots.get(s.date)!.push(s.time)
                      }
                      return (
                        <span className="text-[var(--color-text-muted)] text-[12px]">
                          {Array.from(dateSlots.entries()).map(([date, times]) => `${date}: ${times.join(', ')}`).join('  ·  ')}
                        </span>
                      )
                    })()}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => openShowtimeEdit(st.id)} className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-primary)] hover:text-white">Edit</button>
                    {showtimeDeleteConfirm === st.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleShowtimeDelete(st.id)} disabled={!!showtimeDeletingId} className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-warning)] text-white transition-all duration-150 hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed">{showtimeDeletingId === st.id ? 'Deleting...' : 'Confirm'}</button>
                        <button onClick={() => setShowtimeDeleteConfirm(null)} disabled={!!showtimeDeletingId} className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-bg-elevated)] text-[var(--color-text)] transition-all duration-150 hover:bg-[var(--color-bg)] disabled:opacity-60 disabled:cursor-not-allowed">Cancel</button>
                      </div>
                    ) : (<button onClick={() => setShowtimeDeleteConfirm(st.id)} className="px-3 py-2 rounded text-[13px] font-semibold bg-[var(--color-error)] text-white transition-all duration-150 hover:opacity-90">Delete</button>)}
                  </div>
                </div>
              ))}
            </div>)}
        </div>
      )}

      {/* ==================== MODALS ==================== */}

      {/* Movie Create/Edit Modal */}
      {movieModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeMovieModal}>
          <div className="bg-[var(--color-bg-card)] rounded-xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-6 shadow-[var(--shadow-elevated)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-extrabold text-[var(--color-text-heading)]">{movieModal === 'create' ? 'Add Movie' : 'Edit Movie'}</h2>
              <button onClick={closeMovieModal} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] text-2xl leading-none">&times;</button>
            </div>
            {movieFormError && (<div className="mb-4 px-4 py-3 bg-[var(--color-error-bg)] rounded-lg text-[var(--color-error)] text-sm">{movieFormError}</div>)}
            <div className="flex flex-col gap-4">
              <FormField label="Title" field="title" value={movieForm.title} onChange={(v) => updateMovieField('title', v)} placeholder="Inception" required />
              <FormField label="Tagline" field="tagline" value={movieForm.tagline} onChange={(v) => updateMovieField('tagline', v)} placeholder="Your mind is the scene of the crime" />
              <div className="grid grid-cols-2 gap-4">
                <ImageUpload label="Poster" preview={posterPreview} loading={imageLoading} onUpload={(f) => handleMovieImageUpload(f, 'poster')} onClear={() => { setPosterPreview(''); setMovieForm((f) => ({ ...f, poster: '' })); posterInputRef.current && (posterInputRef.current.value = '') }} inputRef={posterInputRef} />
                <ImageUpload label="Backdrop" preview={backdropPreview} loading={imageLoading} onUpload={(f) => handleMovieImageUpload(f, 'backdrop')} onClear={() => { setBackdropPreview(''); setMovieForm((f) => ({ ...f, backdrop: '' })); backdropInputRef.current && (backdropInputRef.current.value = '') }} inputRef={backdropInputRef} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <NumericField label="Rating" field="rating" value={movieForm.rating} onChange={(v) => updateMovieField('rating', v)} max={10} step={0.1} />
                <NumericField label="Duration (min)" field="duration" value={movieForm.duration} onChange={(v) => updateMovieField('duration', v)} />
                <FormField label="Language" field="language" value={movieForm.language} onChange={(v) => updateMovieField('language', v)} placeholder="English" />
              </div>
              <FormField label="Genre (comma-separated)" field="genre" value={movieForm.genre} onChange={(v) => updateMovieField('genre', v)} placeholder="Sci-Fi, Action, Drama" />
              <FormField label="Release Date" field="releaseDate" value={movieForm.releaseDate} onChange={(v) => updateMovieField('releaseDate', v)} type="date" />
              <FormField label="Director" field="director" value={movieForm.director} onChange={(v) => updateMovieField('director', v)} placeholder="Christopher Nolan" />
              <FormField label="Cast (comma-separated)" field="cast" value={movieForm.cast} onChange={(v) => updateMovieField('cast', v)} placeholder="Leonardo DiCaprio, Joseph Gordon-Levitt" />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-[var(--color-text)]">Description</label>
                <textarea id="description" rows={3} value={movieForm.description} onChange={(e) => updateMovieField('description', e.target.value)} className="px-4 py-3 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-base outline-none placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)] resize-none" placeholder="Brief movie description..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleMovieSubmit} disabled={movieSubmitting} className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-lg font-bold transition-colors duration-150 hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed">{movieSubmitting ? 'Saving...' : movieModal === 'create' ? 'Add Movie' : 'Save Changes'}</button>
                <button onClick={closeMovieModal} className="px-6 py-3 bg-[var(--color-bg-elevated)] text-[var(--color-text)] rounded-lg font-semibold transition-colors duration-150 hover:bg-[var(--color-bg)]">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Theater Create/Edit Modal */}
      {theaterModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeTheaterModal}>
          <div className="bg-[var(--color-bg-card)] rounded-xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto p-6 shadow-[var(--shadow-elevated)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-extrabold text-[var(--color-text-heading)]">{theaterModal === 'create' ? 'Add Theater' : 'Edit Theater'}</h2>
              <button onClick={closeTheaterModal} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] text-2xl leading-none">&times;</button>
            </div>
            {theaterFormError && (<div className="mb-4 px-4 py-3 bg-[var(--color-error-bg)] rounded-lg text-[var(--color-error)] text-sm">{theaterFormError}</div>)}
            <div className="flex flex-col gap-4">
              <FormField label="Name" field="name" value={theaterForm.name} onChange={(v) => setTheaterForm((f) => ({ ...f, name: v }))} placeholder="Cinebook Multiplex - Downtown" required />
              <FormField label="Address" field="address" value={theaterForm.address} onChange={(v) => setTheaterForm((f) => ({ ...f, address: v }))} placeholder="123 Main St, New York, NY 10001" required />
              <NumericField label="Screens" field="screens" value={theaterForm.screens} onChange={(v) => setTheaterForm((f) => ({ ...f, screens: parseInt(v) || 1 }))} />
              <FormField label="Amenities (comma-separated)" field="amenities" value={theaterForm.amenities} onChange={(v) => setTheaterForm((f) => ({ ...f, amenities: v }))} placeholder="IMAX, Dolby Atmos, Parking" />
              <div className="flex gap-3 pt-2">
                <button onClick={handleTheaterSubmit} disabled={theaterSubmitting} className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-lg font-bold transition-colors duration-150 hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed">{theaterSubmitting ? 'Saving...' : theaterModal === 'create' ? 'Add Theater' : 'Save Changes'}</button>
                <button onClick={closeTheaterModal} className="px-6 py-3 bg-[var(--color-bg-elevated)] text-[var(--color-text)] rounded-lg font-semibold transition-colors duration-150 hover:bg-[var(--color-bg)]">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Showtime Create/Edit Modal */}
      {showtimeModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={closeShowtimeModal}>
          <div className="bg-[var(--color-bg-card)] rounded-xl w-full max-w-[700px] max-h-[90vh] overflow-y-auto p-6 shadow-[var(--shadow-elevated)]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-2xl font-extrabold text-[var(--color-text-heading)]">{showtimeModal === 'create' ? 'Add Showtime' : 'Edit Showtime'}</h2>
              <button onClick={closeShowtimeModal} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] text-2xl leading-none">&times;</button>
            </div>
            {showtimeFormError && (<div className="mb-4 px-4 py-3 bg-[var(--color-error-bg)] rounded-lg text-[var(--color-error)] text-sm">{showtimeFormError}</div>)}
            {showtimeEditing && (<div className="flex justify-center py-12"><div className="w-10 h-10 border-4 border-[var(--color-border)] border-t-[var(--color-primary)] rounded-full animate-spin" /></div>)}
            {!showtimeEditing && (

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Movie <span className="text-[var(--color-error)]">*</span></label>
                  <select value={showtimeFormMovieId} onChange={(e) => setShowtimeFormMovieId(e.target.value)} className="px-4 py-2.5 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                    <option value="">Select movie</option>
                    {movies.map((m) => (<option key={m.id} value={m.id}>{m.title}</option>))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Theater <span className="text-[var(--color-error)]">*</span></label>
                  <select value={showtimeFormTheaterId} onChange={(e) => setShowtimeFormTheaterId(e.target.value)} className="px-4 py-2.5 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                    <option value="">Select theater</option>
                    {theaters.map((t) => (<option key={t.id} value={t.id}>{t.name}</option>))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-[var(--color-text)]">Format <span className="text-[var(--color-error)]">*</span></label>
                  <select value={showtimeFormat} onChange={(e) => setShowtimeFormat(e.target.value)} className="px-4 py-2.5 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                    {['2D', 'IMAX', '3D', '4DX', 'Dolby Cinema', 'ScreenX'].map((f) => (<option key={f} value={f}>{f}</option>))}
                  </select>
                </div>
              </div>

              {/* Date Groups */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-[var(--color-text)]">Dates & Slots</label>
                <button type="button" onClick={addDateGroup} className="px-3 py-1 bg-[var(--color-primary)] text-white rounded text-xs font-semibold hover:bg-[var(--color-primary-hover)]">+ Add Date</button>
              </div>

              {showtimeSlots.map((group, di) => (
                <div key={di} className="border border-[var(--color-border)] rounded-lg p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-[var(--color-primary)]">Date Group {showtimeSlots.length > 1 ? di + 1 : ''}</span>
                      <div className="w-[200px]">
                        <DatePicker value={group.date} onChange={(v) => updateDate(di, v)} />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => addSlot(di)} className="px-3 py-1 bg-[var(--color-bg-elevated)] text-[var(--color-text)] rounded text-xs font-semibold hover:bg-[var(--color-primary)] hover:text-white">+ Slot</button>
                      {showtimeSlots.length > 1 && (
                        <button type="button" onClick={() => removeDateGroup(di)} className="px-3 py-1 bg-[var(--color-error-bg)] text-[var(--color-error)] rounded text-xs font-semibold hover:opacity-80">Remove Date</button>
                      )}
                    </div>
                  </div>

                  {group.slots.map((slot, si) => (
                    <div key={si} className="ml-4 pl-4 border-l-2 border-[var(--color-border)] flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-[var(--color-text-muted)]">Slot {si + 1}</span>
                        {group.slots.length > 1 && (
                          <button type="button" onClick={() => removeSlot(di, si)} className="text-xs text-[var(--color-error)] font-semibold hover:opacity-80">Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <FormField label="Time" field={`slot-${di}-${si}-time`} value={slot.time} onChange={(v) => updateSlot(di, si, 'time', v)} type="time" required />
                        <NumericField label="Rows" field={`slot-${di}-${si}-rows`} value={slot.rows} onChange={(v) => updateSlot(di, si, 'rows', v)} />
                        <NumericField label="Cols" field={`slot-${di}-${si}-cols`} value={slot.cols} onChange={(v) => updateSlot(di, si, 'cols', v)} />
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        <NumericField label="Regular Price" field={`slot-${di}-${si}-regular`} value={slot.regularPrice} onChange={(v) => updateSlot(di, si, 'regularPrice', v)} step={0.5} />
                        <NumericField label="Premium Price" field={`slot-${di}-${si}-premium`} value={slot.premiumPrice} onChange={(v) => updateSlot(di, si, 'premiumPrice', v)} step={0.5} />
                        <NumericField label="Aisle After Col" field={`slot-${di}-${si}-aisle`} value={slot.aisleAfterCol} onChange={(v) => updateSlot(di, si, 'aisleAfterCol', v)} />
                        <FormField label="Premium Cols" field={`slot-${di}-${si}-premiumCols`} value={slot.premiumCols} onChange={(v) => updateSlot(di, si, 'premiumCols', v)} placeholder="1, 2, 19, 20" />
                      </div>
                    </div>
                  ))}
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button onClick={handleShowtimeSubmit} disabled={showtimeSubmitting} className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-lg font-bold transition-colors duration-150 hover:bg-[var(--color-primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed">{showtimeSubmitting ? 'Saving...' : showtimeModal === 'create' ? 'Add Showtime' : 'Save Changes'}</button>
                <button onClick={closeShowtimeModal} className="px-6 py-3 bg-[var(--color-bg-elevated)] text-[var(--color-text)] rounded-lg font-semibold transition-colors duration-150 hover:bg-[var(--color-bg)]">Cancel</button>
              </div>
            </div>)}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---- Small form helpers ---- */

function FormField({ label, field, value, onChange, type, placeholder, required }: {
  label: string; field: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={field} className="text-sm font-semibold text-[var(--color-text)]">{label} {required && <span className="text-[var(--color-error)]">*</span>}</label>
      <input id={field} type={type || 'text'} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="px-4 py-2.5 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-sm outline-none placeholder:text-[var(--color-text-muted)] focus:ring-2 focus:ring-[var(--color-primary)]" />
    </div>
  )
}

function NumericField({ label, field, value, onChange, max, step }: {
  label: string; field: string; value: number; onChange: (v: string) => void; max?: number; step?: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={field} className="text-sm font-semibold text-[var(--color-text)]">{label}</label>
      <input id={field} type="number" max={max} step={step || 1} value={value || ''} onChange={(e) => onChange(e.target.value)} className="px-4 py-2.5 bg-[var(--color-bg)] rounded-lg text-[var(--color-text-heading)] text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)]" />
    </div>
  )
}

function ImageUpload({ label, preview, loading, onUpload, onClear, inputRef }: {
  label: string; preview: string; loading: boolean; onUpload: (f: File) => void; onClear: () => void; inputRef: React.RefObject<HTMLInputElement | null>
}) {
  const inputId = `${label.toLowerCase()}-upload`
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-[var(--color-text)]">{label}</label>
      {preview && (
        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[var(--color-border)]">
          <img src={preview} alt={`${label} preview`} className="w-full h-full object-cover" />
          <button onClick={onClear} className="absolute top-2 right-2 bg-[var(--color-error)] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:opacity-80">&times;</button>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f) }} disabled={loading} className="hidden" id={inputId} />
      <label htmlFor={inputId} className={`w-full py-2.5 border-2 border-dashed border-[var(--color-border)] rounded-lg text-center cursor-pointer text-sm transition-colors duration-150 hover:border-[var(--color-primary)] ${loading ? 'cursor-not-allowed opacity-60' : 'text-[var(--color-text-muted)]'}`}>
        {loading ? 'Loading...' : preview ? 'Change Image' : 'Upload Image'}
      </label>
    </div>
  )
}
