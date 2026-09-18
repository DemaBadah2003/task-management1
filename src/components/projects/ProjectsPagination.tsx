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
  'flex h-11 w-11 shrink-0 items-center justify-center rounded-[8px] border text-[15px] leading-none font-medium transition-colors';

export function ProjectsPagination({
  currentPage = 1,
  totalPages = 15,
}: ProjectsPaginationProps) {
  const pages: (number | '...')[] = [1, 2, 3, '...', totalPages];

  return (
    // pt-4 انشالت من هون، صارت مضبوطة من الأب (mt-[138.5px])
    <div className="hidden items-center justify-end gap-2 md:flex">
      <button
        type="button"
        aria-label="Previous page"
        className={`${boxBase} border-[#E2E5F0] bg-white text-[#737685] hover:bg-[#F1F3FF]`}
      >
        <ChevronLeftIcon />
      </button>

      {pages.map((page, index) =>
        page === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className={`${boxBase} border-[#E2E5F0] bg-white text-[#737685]`}
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
                ? 'border-[#003D9B] bg-[#003D9B] text-white'
                : 'border-[#E2E5F0] bg-white text-[#041B3C] hover:bg-[#F1F3FF]'
            }`}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        aria-label="Next page"
        className={`${boxBase} border-[#E2E5F0] bg-white text-[#737685] hover:bg-[#F1F3FF]`}
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
