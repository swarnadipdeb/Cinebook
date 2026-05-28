import { SEAT_LABELS } from '../../../constants/seatTypes'

const LEGEND_ITEMS = [
  { type: 'available', label: SEAT_LABELS.available, color: 'var(--color-seat-available)' },
  { type: 'selected', label: SEAT_LABELS.selected, color: 'var(--color-seat-selected)' },
  { type: 'booked', label: SEAT_LABELS.booked, color: 'var(--color-seat-booked)' },
  { type: 'premium', label: SEAT_LABELS.premium, color: 'var(--color-seat-premium)' },
]

export default function SeatLegend() {
  return (
    <div className="flex justify-center gap-6 flex-wrap">
      {LEGEND_ITEMS.map((item) => (
        <div key={item.type} className="flex items-center gap-2">
          <div
            className="w-5 h-5 rounded flex-shrink-0"
            style={{ background: item.color }}
          />
          <span className="text-sm text-[var(--color-text-muted)]">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
