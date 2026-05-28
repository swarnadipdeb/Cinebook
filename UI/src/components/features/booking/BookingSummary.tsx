import { formatPrice } from '../../../utils/formatPrice'
import type { Movie, ShowtimeResponseDTO, ShowSlot, Seat } from '../../../types'

interface BookingSummaryProps {
  movie: Movie | null
  showtime: ShowtimeResponseDTO | null
  slot: ShowSlot | null
  selectedSeats: Seat[]
  totalPrice: number
  onConfirm: () => void
}

export default function BookingSummary({
  movie,
  showtime,
  slot,
  selectedSeats,
  totalPrice,
  onConfirm,
}: BookingSummaryProps) {
  const isDisabled = selectedSeats.length === 0

  return (
    <div className="bg-gradient-to-br from-[var(--color-bg-card)] to-[var(--color-bg-elevated)] rounded-xl p-5 sticky top-[calc(72px+16px)] shadow-[var(--shadow-card)]">
      <h3 className="text-lg font-bold text-[var(--color-text-heading)] mb-5 pb-4">
        Booking Summary
      </h3>

      {movie && (
        <div className="flex gap-3 mb-5">
          <img src={movie.poster} alt={movie.title} className="w-16 rounded" />
          <div>
            <p className="font-bold text-[var(--color-text-heading)] text-[15px] mb-0.5">{movie.title}</p>
            {showtime && (
              <p className="text-[var(--color-text-muted)] text-[13px]">
                {showtime.theater?.name} &middot; {showtime.format}
              </p>
            )}
            {slot && <p className="text-[var(--color-primary)] font-bold text-[15px] mt-0.5">{slot.time} &middot; {slot.date}</p>}
          </div>
        </div>
      )}

      {selectedSeats.length > 0 ? (
        <div className="mb-5">
          <div className="text-[13px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
            Selected Seats
          </div>
          {selectedSeats.map((seat) => (
            <div key={`${seat.row}${seat.col}`} className="flex justify-between items-center py-1 text-sm text-[var(--color-text)]">
              <span>
                Row {seat.row}, Seat {seat.col}
                {seat.type === 'premium' && (
                  <span className="ml-2 text-[11px] bg-[var(--color-seat-premium)] text-black px-2 py-0.5 rounded-full font-bold">Premium</span>
                )}
              </span>
              <span className="font-semibold">{formatPrice(seat.price)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-[var(--color-text-muted)] text-sm py-4">No seats selected</p>
      )}

      <div className="flex justify-between items-center pt-4 mb-5 font-bold text-[17px] text-[var(--color-text-heading)]">
        <span>Total</span>
        <span className="text-[var(--color-primary)]">{formatPrice(totalPrice)}</span>
      </div>

      <button
        className={`w-full py-4 rounded-lg font-bold text-base transition-colors duration-150 ${
          isDisabled
            ? 'bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)] cursor-not-allowed'
            : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
        }`}
        disabled={isDisabled}
        onClick={onConfirm}
      >
        {isDisabled ? 'Select Seats to Continue' : `Pay ${formatPrice(totalPrice)}`}
      </button>
    </div>
  )
}
