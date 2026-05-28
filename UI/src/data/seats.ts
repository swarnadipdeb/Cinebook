import type { Seat } from '../types'
import { ROW_LABELS } from '../constants/seatTypes'

// Each screen layout defines which seats are booked, premium cols, and aisle gap col
export interface ScreenLayout {
  rows: number
  cols: number
  premiumCols: number[] // 0-indexed cols that are premium-priced
  aisleAfterCol: number // gap appears after this 0-indexed col
  bookedSeats: string[] // e.g. ['A3', 'B7', 'C12']
  premiumPrice: number
  regularPrice: number
}

// Deterministic seat layouts for a handful of screen IDs.
// Showtimes map to a screen (e.g. "3"), and that screen key is looked up here.
const SCREEN_LAYOUTS: Record<string, ScreenLayout> = {
  default: {
    rows: 8,
    cols: 12,
    premiumCols: [4, 5, 6, 7],
    aisleAfterCol: 5,
    bookedSeats: ['A3', 'A4', 'B2', 'B5', 'B9', 'C1', 'C6', 'C11', 'D3', 'D7', 'E5', 'E8', 'F2', 'F10', 'G4', 'G6'],
    premiumPrice: 24.99,
    regularPrice: 14.99,
  },
  '1': {
    rows: 7,
    cols: 10,
    premiumCols: [3, 4, 5, 6],
    aisleAfterCol: 4,
    bookedSeats: ['A1', 'A2', 'B4', 'B8', 'C3', 'C7', 'D2', 'D5', 'D9', 'E1', 'E6', 'F3', 'F8', 'G5'],
    premiumPrice: 22.99,
    regularPrice: 13.99,
  },
  '2': {
    rows: 9,
    cols: 14,
    premiumCols: [5, 6, 7, 8],
    aisleAfterCol: 6,
    bookedSeats: [
      'A5', 'A6', 'A10', 'B3', 'B7', 'B12', 'C2', 'C8', 'C13',
      'D4', 'D9', 'E1', 'E6', 'E11', 'F5', 'F10', 'G3', 'G8',
      'H2', 'H7', 'H12', 'I4', 'I9',
    ],
    premiumPrice: 26.99,
    regularPrice: 15.99,
  },
  '3': {
    rows: 8,
    cols: 12,
    premiumCols: [3, 4, 5, 6, 7, 8],
    aisleAfterCol: 5,
    bookedSeats: ['A1', 'A7', 'B4', 'B10', 'C3', 'C9', 'D2', 'D6', 'D11', 'E5', 'E8', 'F1', 'F7', 'G4', 'G10', 'H3'],
    premiumPrice: 29.99,
    regularPrice: 16.99,
  },
  '4': {
    rows: 6,
    cols: 10,
    premiumCols: [2, 3, 4, 5, 6, 7],
    aisleAfterCol: 4,
    bookedSeats: ['A3', 'A8', 'B2', 'B6', 'C1', 'C5', 'C9', 'D4', 'D7', 'E2', 'E8', 'F3', 'F6'],
    premiumPrice: 19.99,
    regularPrice: 12.99,
  },
  '5': {
    rows: 10,
    cols: 16,
    premiumCols: [6, 7, 8, 9],
    aisleAfterCol: 7,
    bookedSeats: [
      'A6', 'A7', 'A12', 'B3', 'B9', 'B14', 'C5', 'C10', 'C15',
      'D2', 'D7', 'D12', 'E4', 'E9', 'E14', 'F1', 'F6', 'F11',
      'G3', 'G8', 'G13', 'H5', 'H10', 'I2', 'I7', 'I12', 'J4', 'J9',
    ],
    premiumPrice: 27.99,
    regularPrice: 17.99,
  },
}

export function generateSeatsForScreen(screenId: string): Seat[][] {
  const layout = SCREEN_LAYOUTS[screenId] ?? SCREEN_LAYOUTS['default']
  const bookedSet = new Set(layout.bookedSeats)

  return ROW_LABELS.slice(0, layout.rows).map((row) =>
    Array.from({ length: layout.cols }, (_, colIdx) => {
      const col = colIdx + 1
      const seatId = `${row}${col}`
      const isPremium = layout.premiumCols.includes(colIdx)

      if (bookedSet.has(seatId)) {
        return { row, col, type: 'booked' as const, price: 0 }
      }
      return {
        row,
        col,
        type: isPremium ? ('premium' as const) : ('available' as const),
        price: isPremium ? layout.premiumPrice : layout.regularPrice,
      }
    })
  )
}

export function getLayoutForScreen(screenId: string): ScreenLayout {
  return SCREEN_LAYOUTS[screenId] ?? SCREEN_LAYOUTS['default']
}
