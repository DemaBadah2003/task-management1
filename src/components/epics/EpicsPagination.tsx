import { getPageItems } from '@/src/lib/pagination';

interface EpicsPaginationProps {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

const pageButton =
  'inline-flex h-8 min-w-8 items-center justify-center rounded-[2px] border border-[#E2E5F0] px-2 text-xs transition-colors';

export function EpicsPagination({
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
}: EpicsPaginationProps) {
  const items = getPageItems(currentPage, totalPages);
  const canGoPrevious = currentPage > 1;
  const canGoNext = hasMore && currentPage < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="mt-6 hidden items-center justify-end gap-1 md:flex"
    >
      <button
        type="button"
        disabled={!canGoPrevious}
        onClick={() => onPageChange(currentPage - 1)}
        className={`${pageButton} ${
          canGoPrevious
            ? 'text-[#434654] hover:bg-[#F1F3FF]'
            : 'cursor-not-allowed text-[#737685] opacity-50'
        }`}
      >
        Previous
      </button>
      {items.map((item) => {
        if (typeof item !== 'number') {
          return (
            <span
              key={item}
              aria-hidden="true"
              className="px-1 text-xs text-[#737685]"
            >
              …
            </span>
          );
        }

        const isCurrent = item === currentPage;
        return (
          <button
            key={item}
            type="button"
            aria-current={isCurrent ? 'page' : undefined}
            onClick={() => onPageChange(item)}
            className={`${pageButton} ${
              isCurrent
                ? 'border-[#003D9B] bg-[#003D9B] font-bold text-white'
                : 'text-[#434654] hover:bg-[#F1F3FF]'
            }`}
          >
            {item}
          </button>
        );
      })}
      <button
        type="button"
        disabled={!canGoNext}
        onClick={() => onPageChange(currentPage + 1)}
        className={`${pageButton} ${
          canGoNext
            ? 'text-[#434654] hover:bg-[#F1F3FF]'
            : 'cursor-not-allowed text-[#737685] opacity-50'
        }`}
      >
        Next
      </button>
    </nav>
  );
}
