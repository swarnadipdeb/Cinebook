import type { Showtime, ShowtimeEntry, Theater } from '../types'
import { theaters } from './theaters'

// Raw showtime entries — only references, no embedded objects.
// Matches what a real API returns without ?embed=theater.
const showtimeEntries: ShowtimeEntry[] = [
  // Dune: Part Three (movie 1)
  { id: 'st-1-t1-2026-04-24', movieId: '1', theaterId: 't1', date: '2026-04-24', times: ['10:30', '13:45', '17:00', '20:15', '23:30'], screen: '1', format: 'IMAX' },
  { id: 'st-1-t2-2026-04-24', movieId: '1', theaterId: 't2', date: '2026-04-24', times: ['11:00', '14:30', '18:00', '21:30'], screen: '3', format: 'Dolby Cinema' },
  { id: 'st-1-t3-2026-04-24', movieId: '1', theaterId: 't3', date: '2026-04-24', times: ['12:00', '16:15', '19:45', '23:00'], screen: '7', format: 'ScreenX' },
  { id: 'st-1-t1-2026-04-25', movieId: '1', theaterId: 't1', date: '2026-04-25', times: ['11:30', '15:00', '18:30', '22:00'], screen: '1', format: 'IMAX' },
  { id: 'st-1-t2-2026-04-25', movieId: '1', theaterId: 't2', date: '2026-04-25', times: ['10:00', '13:30', '17:00', '20:30'], screen: '3', format: 'Dolby Cinema' },

  // The Midnight Express (movie 2)
  { id: 'st-2-t1-2026-04-24', movieId: '2', theaterId: 't1', date: '2026-04-24', times: ['11:00', '14:00', '17:30', '20:45'], screen: '3', format: '2D' },
  { id: 'st-2-t2-2026-04-24', movieId: '2', theaterId: 't2', date: '2026-04-24', times: ['12:30', '16:00', '19:30', '22:45'], screen: '5', format: 'Gold Class' },
  { id: 'st-2-t3-2026-04-24', movieId: '2', theaterId: 't3', date: '2026-04-24', times: ['10:00', '13:15', '16:45', '20:00', '23:15'], screen: '2', format: '2D' },
  { id: 'st-2-t1-2026-04-25', movieId: '2', theaterId: 't1', date: '2026-04-25', times: ['12:00', '15:30', '19:00', '22:15'], screen: '3', format: '2D' },
  { id: 'st-2-t3-2026-04-25', movieId: '2', theaterId: 't3', date: '2026-04-25', times: ['11:00', '14:30', '18:00', '21:15'], screen: '2', format: '2D' },

  // Neon Samurai (movie 3)
  { id: 'st-3-t1-2026-04-24', movieId: '3', theaterId: 't1', date: '2026-04-24', times: ['10:00', '13:00', '16:30', '19:45', '23:00'], screen: '2', format: 'IMAX' },
  { id: 'st-3-t2-2026-04-24', movieId: '3', theaterId: 't2', date: '2026-04-24', times: ['11:30', '15:00', '18:30', '22:00'], screen: '1', format: '4DX' },
  { id: 'st-3-t3-2026-04-24', movieId: '3', theaterId: 't3', date: '2026-04-24', times: ['10:30', '14:00', '17:30', '21:00'], screen: '10', format: 'RealD 3D' },
  { id: 'st-3-t1-2026-04-25', movieId: '3', theaterId: 't1', date: '2026-04-25', times: ['11:00', '14:15', '17:45', '21:00'], screen: '2', format: 'IMAX' },
  { id: 'st-3-t2-2026-04-25', movieId: '3', theaterId: 't2', date: '2026-04-25', times: ['10:30', '14:00', '17:30', '21:00'], screen: '1', format: '4DX' },

  // Whispers in the Rain (movie 4)
  { id: 'st-4-t1-2026-04-24', movieId: '4', theaterId: 't1', date: '2026-04-24', times: ['11:30', '14:30', '17:00', '20:00', '22:30'], screen: '5', format: '2D' },
  { id: 'st-4-t2-2026-04-24', movieId: '4', theaterId: 't2', date: '2026-04-24', times: ['12:00', '15:15', '18:30', '21:45'], screen: '8', format: 'Gold Class' },
  { id: 'st-4-t3-2026-04-24', movieId: '4', theaterId: 't3', date: '2026-04-24', times: ['11:00', '14:00', '16:45', '19:30', '22:15'], screen: '4', format: '2D' },
  { id: 'st-4-t2-2026-04-25', movieId: '4', theaterId: 't2', date: '2026-04-25', times: ['11:00', '14:00', '17:30', '20:45'], screen: '8', format: 'Gold Class' },

  // Gravity Well (movie 5)
  { id: 'st-5-t1-2026-04-24', movieId: '5', theaterId: 't1', date: '2026-04-24', times: ['10:00', '13:30', '17:00', '20:30'], screen: '1', format: 'IMAX' },
  { id: 'st-5-t2-2026-04-24', movieId: '5', theaterId: 't2', date: '2026-04-24', times: ['11:00', '15:00', '19:00', '23:00'], screen: '2', format: 'Dolby Cinema' },
  { id: 'st-5-t3-2026-04-24', movieId: '5', theaterId: 't3', date: '2026-04-24', times: ['10:30', '14:30', '18:30', '22:30'], screen: '12', format: 'ScreenX' },
  { id: 'st-5-t1-2026-04-25', movieId: '5', theaterId: 't1', date: '2026-04-25', times: ['10:30', '14:00', '17:30', '21:00'], screen: '1', format: 'IMAX' },
  { id: 'st-5-t3-2026-04-25', movieId: '5', theaterId: 't3', date: '2026-04-25', times: ['11:30', '15:30', '19:30', '23:00'], screen: '12', format: 'ScreenX' },

  // The Last Kingdom (movie 6)
  { id: 'st-6-t1-2026-04-24', movieId: '6', theaterId: 't1', date: '2026-04-24', times: ['12:00', '15:30', '19:00', '22:30'], screen: '6', format: '2D' },
  { id: 'st-6-t2-2026-04-24', movieId: '6', theaterId: 't2', date: '2026-04-24', times: ['11:00', '14:45', '18:15', '21:45'], screen: '9', format: 'Dolby Cinema' },
  { id: 'st-6-t3-2026-04-24', movieId: '6', theaterId: 't3', date: '2026-04-24', times: ['10:30', '14:00', '17:45', '21:15'], screen: '11', format: 'RealD 3D' },
  { id: 'st-6-t1-2026-04-25', movieId: '6', theaterId: 't1', date: '2026-04-25', times: ['11:00', '15:00', '18:45', '22:15'], screen: '6', format: '2D' },
  { id: 'st-6-t3-2026-04-25', movieId: '6', theaterId: 't3', date: '2026-04-25', times: ['10:00', '13:45', '17:30', '21:00'], screen: '11', format: 'RealD 3D' },
]

// Simulates ?embed=theater — joins theater objects into raw entries.
// When a real API is wired up, the server does this JOIN instead.
export const resolveShowtimes = (entries: ShowtimeEntry[], theaters: Theater[]): Showtime[] =>
  entries.map((entry) => ({
    ...entry,
    theater: theaters.find((t) => t.id === entry.theaterId)!,
  }))

export const getShowtimeEntries = (): ShowtimeEntry[] => showtimeEntries
