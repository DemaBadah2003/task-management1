import Link from 'next/link';
import { getPageItems } from '@/src/lib/pagination';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  basePath?: string;
};

const buildHref = (basePath: string, page: number) =>
  page === 1 ? basePath : `${basePath}?page=${page}`;

const base =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-slate-200 px-3 text-sm';
const active = 'border-[#003D9B] bg-[#003D9B] text-white';
const normal = 'text-slate-700 hover:bg-slate-100';
const disabled = 'pointer-events-none opacity-50 text-slate-500';

export function Pagination({
  currentPage,
  totalPages,
  basePath = '/project',
}: PaginationProps) {
  // صفحة وحدة فقط → نخفي الـ pagination كله
  if (totalPages <= 1) return null;

  const items = getPageItems(currentPage, totalPages);
  const isFirst = currentPage === 1;
  const isLast = currentPage === totalPages;

  return (
    <nav aria-label="Pagination" className="flex items-center gap-2">
      {/* Previous: دائماً ظاهر */}
      {isFirst ? (
        <span aria-disabled="true" className={`${base} ${disabled}`}>
          Previous
        </span>
      ) : (
        <Link
          href={buildHref(basePath, currentPage - 1)}
          rel="prev"
          className={`${base} ${normal}`}
        >
          Previous
        </Link>
      )}

      {items.map((item) => {
        if (typeof item === 'string') {
          return (
            <span key={item} aria-hidden="true" className="px-1 text-slate-500">
              …
            </span>
          );
        }

        const isActive = item === currentPage;
        return (
          <Link
            key={item}
            href={buildHref(basePath, item)}
            aria-current={isActive ? 'page' : undefined}
            className={`${base} ${isActive ? active : normal}`}
          >
            {item}
          </Link>
        );
      })}

      {/* Next: دائماً ظاهر */}
      {isLast ? (
        <span aria-disabled="true" className={`${base} ${disabled}`}>
          Next
        </span>
      ) : (
        <Link
          href={buildHref(basePath, currentPage + 1)}
          rel="next"
          className={`${base} ${normal}`}
        >
          Next
        </Link>
      )}
    </nav>
  );
}
