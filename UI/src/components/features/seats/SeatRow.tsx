import { SEAT_TYPES } from '../../../constants/seatTypes'
import type { Seat } from '../../../types'

interface SeatRowProps {
  row: string
  seats: Array<Seat & { idx: number; selected?: boolean }>
  onToggle: (seat: Seat) => void
}

export default function SeatRow({ row, seats, onToggle }: SeatRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 text-center font-bold text-[var(--color-text-muted)] text-sm flex-shrink-0">{row}</span>
      <div className="flex gap-1.5 items-center">
        {seats.map((seat) => {
          const isAisle = seat.type === 'aisle'
          const isClickable = !isAisle && seat.type !== SEAT_TYPES.BOOKED && seat.type !== SEAT_TYPES.DISABLED
          const key = `${row}-${seat.col}-${seat.idx ?? '0'}`
          if (isAisle) {
            return <div key={key} className="w-5 flex-shrink-0" />
          }
          const isSelected = seat.selected === true
          return (
              <button
                key={key}
                className={`w-7 h-7 rounded text-[0] focus:text-[14px] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 focus:ring-offset-[var(--color-bg-card)] ${
                  isSelected
                    ? 'bg-[var(--color-seat-selected)] scale-110 shadow-[0_0_12px_var(--color-seat-selected)]'
                    : seat.type === 'available'
                    ? 'bg-[var(--color-seat-available)] hover:bg-green-600 hover:scale-110 hover:shadow-[0_0_8px_var(--color-seat-available)]'
                    : seat.type === 'booked'
                    ? 'bg-[var(--color-seat-booked)] cursor-not-allowed opacity-40'
                    : seat.type === 'premium'
                    ? 'bg-[var(--color-seat-premium)] hover:bg-amber-600 hover:scale-110 hover:shadow-[0_0_8px_var(--color-seat-premium)]'
                    : 'bg-[var(--color-seat-disabled)] cursor-not-allowed opacity-30'
                }`}
                onClick={() => isClickable && onToggle(seat)}
                disabled={!isClickable}
                aria-label={`Seat ${row}${seat.col} - ${seat.type}${isSelected ? ' selected' : ''}`}
                title={`${row}${seat.col} - ${isClickable ? `$${seat.price}` : 'Unavailable'}`}
              />
            )
        })}
      </div>
    </div>
  )
}
