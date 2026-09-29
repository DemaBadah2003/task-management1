'use client';

interface ProjectsPaginationProps {
  currentPage?: number;
  totalPages?: number;
}

function ChevronLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 12L6 8L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 4L10 8L6 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const boxBase =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border text-[14px] leading-5 font-medium transition-colors';

export function ProjectsPagination({
  currentPage = 1,
  totalPages = 15,
}: ProjectsPaginationProps) {
  const pages: (number | '...')[] = [1, 2, 3, '...', totalPages];

  return (
    <div className="mt-auto hidden items-center justify-end gap-2 pt-6 md:flex">
      <button
        type="button"
        aria-label="Previous page"
        className={`${boxBase} border-border-subtle text-surface-medium hover:bg-surface-low bg-white`}
      >
        <ChevronLeftIcon />
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className={`${boxBase} border-border-subtle text-surface-medium bg-white`}
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            aria-current={page === currentPage ? 'page' : undefined}
            className={`${boxBase} ${
              page === currentPage
                ? 'border-primary bg-primary text-white'
                : 'border-border-subtle hover:bg-surface-low bg-white text-slate-900'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        aria-label="Next page"
        className={`${boxBase} border-border-subtle text-surface-medium hover:bg-surface-low bg-white`}
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
