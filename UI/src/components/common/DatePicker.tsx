import { useState, useEffect, useRef, useCallback } from 'react'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  selectedDates?: Set<string>
  multiSelect?: boolean
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

export function DatePicker({ value, onChange, selectedDates, multiSelect }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDay = new Date(viewYear, viewMonth, 1).getDay()
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('en-US', { month: 'long' })

  const prevMonth = () => setViewMonth((m) => (m === 0 ? 11 : m - 1), setViewYear((y) => (viewMonth === 0 ? y - 1 : y)))
  const nextMonth = () => setViewMonth((m) => (m === 11 ? 0 : m + 1), setViewYear((y) => (viewMonth === 11 ? y + 1 : y)))

  const isEmpty = !value || !value.trim()

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 px-4 py-2.5 bg-[var(--color-bg)] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-colors ${
          isEmpty ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-heading)]'
        }`}
      >
        <svg className="w-4 h-4 text-[var(--color-text-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {isEmpty ? 'Select date' : new Date(value + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
      </button>

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-elevated)] p-4 w-[280px]">
          {/* Month/Year header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={() => {
              const newMonth = viewMonth === 0 ? 11 : viewMonth - 1
              const newYear = viewMonth === 0 ? viewYear - 1 : viewYear
              setViewMonth(newMonth); setViewYear(newYear)
            }} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] px-1 text-lg">&larr;</button>
            <span className="text-sm font-bold text-[var(--color-text-heading)]">{monthName} {viewYear}</span>
            <button type="button" onClick={() => {
              const newMonth = viewMonth === 11 ? 0 : viewMonth + 1
              const newYear = viewMonth === 11 ? viewYear + 1 : viewYear
              setViewMonth(newMonth); setViewYear(newYear)
            }} className="text-[var(--color-text-muted)] hover:text-[var(--color-text-heading)] px-1 text-lg">&rarr;</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wide py-1">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const isSelected = value === dateStr || (selectedDates && selectedDates.has(dateStr))
              const isToday = new Date().toISOString().slice(0, 10) === dateStr

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => { onChange(dateStr); if (!multiSelect) setOpen(false) }}
                  className={`relative flex items-center justify-center h-8 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-[var(--color-primary)] text-white'
                      : isToday
                      ? 'text-[var(--color-primary)] border border-[var(--color-primary)]'
                      : 'text-[var(--color-text)] hover:bg-[var(--color-bg-elevated)]'
                  }`}
                >
                  {day}
                  {isSelected && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-[var(--color-primary)] rounded-full" />
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
