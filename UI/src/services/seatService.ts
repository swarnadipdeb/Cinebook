import type { Seat } from '../types'
import { generateSeatsForScreen } from '../data/seats'

/**
 * Fetch the seat map for a given screen. Simulates async API call.
 * Returns a 2D array: one sub-array per row.
 */
export const getSeatsForScreen = (screenId: string): Promise<Seat[][]> => {
  return Promise.resolve(generateSeatsForScreen(screenId))
}
