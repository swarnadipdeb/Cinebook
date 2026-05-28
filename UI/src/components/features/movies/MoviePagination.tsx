import { useMemo } from 'react'

interface MoviePaginationProps {
  currentPage: number
  totalPages: number
  totalElements: number
  onPageChange: (page: number) => void
}

export default function MoviePagination({
  currentPage,
  totalPages,
  totalElements,
  onPageChange,
}: MoviePaginationProps) {
  const pages = useMemo(() => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i)
    } else {
      pages.push(0)
      if (currentPage > 2) pages.push('...')
      for (
        let i = Math.max(1, currentPage - 1);
        i <= Math.min(totalPages - 2, currentPage + 1);
        i++
      ) {
        pages.push(i)
      }
      if (currentPage < totalPages - 3) pages.push('...')
      pages.push(totalPages - 1)
    }
    return pages
  }, [currentPage, totalPages])

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--color-bg-elevated)] transition-colors"
      >
        Prev
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-[var(--color-text-muted)]">
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 rounded-lg font-medium transition-colors ${
              page === currentPage
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-[var(--color-bg-card)] text-[var(--color-text)] hover:bg-[var(--color-bg-elevated)]'
            }`}
          >
            {page + 1}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-card)] text-[var(--color-text)] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--color-bg-elevated)] transition-colors"
      >
        Next
      </button>

      <span className="text-sm text-[var(--color-text-muted)] ml-4">
        {totalElements} movie{totalElements !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
