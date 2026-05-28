export const SEAT_TYPES = {
  AVAILABLE: 'available',
  SELECTED: 'selected',
  BOOKED: 'booked',
  PREMIUM: 'premium',
  AISLE: 'aisle',
  DISABLED: 'disabled',
} as const

export const SEAT_LABELS: Record<(typeof SEAT_TYPES)[keyof typeof SEAT_TYPES], string> = {
  [SEAT_TYPES.AVAILABLE]: 'Available',
  [SEAT_TYPES.SELECTED]: 'Selected',
  [SEAT_TYPES.BOOKED]: 'Booked',
  [SEAT_TYPES.PREMIUM]: 'Premium',
  [SEAT_TYPES.AISLE]: 'Aisle',
  [SEAT_TYPES.DISABLED]: 'Not Available',
}

export const ROW_LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
