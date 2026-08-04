import { useMemo } from 'react'
import SeatRow from './SeatRow'
import type { Seat } from '../../../types'

interface SeatMapProps {
  seatGrid: Seat[][]
  selectedSeats: Seat[]
  onToggle: (seat: Seat) => void
}

type DisplaySeat = Seat & { idx: number; selected?: boolean }

export default function SeatMap({
  seatGrid,
  selectedSeats,
  onToggle,
}: SeatMapProps) {
  const seatMapWithSelection = useMemo(
    () => {
      // Ensure seatGrid is an array before calling .map()
      if (!Array.isArray(seatGrid)) {
        return []
      }
      return seatGrid.map((rowSeats) => {
        // Ensure each row is also an array
        if (!Array.isArray(rowSeats)) {
          return []
        }
        return rowSeats.map((seat, idx) => {
          const isSelected = selectedSeats.some(
            (s) => s.row === seat.row && s.col === seat.col && (s.idx ?? 0) === idx
          )
          return { ...seat, idx, selected: isSelected }
        })
      })
    },
    [seatGrid, selectedSeats]
  )

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="w-full max-w-[480px] mb-6">
        <div className="bg-gradient-to-b from-[var(--color-bg-elevated)] to-[var(--color-bg-card)] rounded-t-full px-8 py-3 text-center text-xs font-bold tracking-[3px] text-[var(--color-text-muted)] uppercase">
          SCREEN
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {seatMapWithSelection.map((rowSeats) => (
          <SeatRow
            key={rowSeats[0].row}
            row={rowSeats[0].row}
            seats={rowSeats}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  )
}
